;; title: Liquidity Pool Manager
;; version: 1.0.0
;; summary: A milestone-based liquidity pool system with time-locked zones
;; description: Enables LP Farmers to create liquidity pools with milestone zones where users can stake and earn rewards

;; ============================================
;; TRAITS
;; ============================================

;; SIP-010 Trait for fungible tokens
(define-trait sip-010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response uint uint))
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 32) uint))
    (get-decimals () (response uint uint))
  )
)

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-already-exists (err u104))
(define-constant err-invalid-zone (err u105))
(define-constant err-zone-locked (err u106))
(define-constant err-insufficient-liquidity (err u107))
(define-constant err-invalid-amount (err u108))
(define-constant err-pool-not-found (err u109))
(define-constant err-transfer-failed (err u110))

;; Fee percentage (in basis points: 30 = 0.3%)
(define-constant trading-fee u30)
(define-constant basis-points u10000)

;; ============================================
;; DATA VARIABLES
;; ============================================

(define-data-var pool-nonce uint u0)
(define-data-var total-pools-created uint u0)

;; ============================================
;; DATA MAPS
;; ============================================

;; Liquidity Pool Structure
(define-map liquidity-pools
  uint ;; pool-id
  {
    lp-farmer: principal,
    stx-reserve: uint,
    usdt-reserve: uint,
    total-volume: uint,
    total-transactions: uint,
    zone-count: uint,
    current-zone: uint,
    zone-unlock-time: uint, ;; block height for zone unlock
    zone-duration: uint, ;; blocks between zones
    created-at: uint,
    active: bool
  }
)

;; User Position in Pool
(define-map user-positions
  {pool-id: uint, user: principal}
  {
    stx-deposited: uint,
    usdt-deposited: uint,
    rewards-earned: uint,
    last-interaction: uint,
    can-claim: bool
  }
)

;; LP Farmer Rewards
(define-map farmer-rewards
  {pool-id: uint, farmer: principal}
  {
    total-fees-earned: uint,
    last-claimed: uint
  }
)

;; Pool Statistics per Zone
(define-map zone-statistics
  {pool-id: uint, zone: uint}
  {
    total-buys: uint,
    total-sells: uint,
    volume: uint,
    unique-users: uint,
    rewards-distributed: uint
  }
)

;; User Zone Participation
(define-map user-zone-participation
  {pool-id: uint, user: principal, zone: uint}
  {
    participated: bool,
    volume-contributed: uint
  }
)

;; Track which pools a farmer owns
(define-map farmer-pools
  principal
  (list 100 uint)
)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

;; Calculate trading fee
(define-private (calculate-fee (amount uint))
  (/ (* amount trading-fee) basis-points)
)

;; Calculate reward multiplier based on zone
(define-private (calculate-zone-multiplier (zone uint))
  ;; Higher zones = higher multiplier (zone 1 = 1x, zone 2 = 1.5x, zone 3 = 2x, etc.)
  (+ u100 (* zone u50)) ;; Returns percentage (100 = 1x, 150 = 1.5x, 200 = 2x)
)

;; Calculate user rewards based on contribution and zone
(define-private (calculate-user-reward (contribution uint) (total-volume uint) (zone uint) (pool-fees uint))
  (let
    (
      (base-reward (/ (* contribution pool-fees) total-volume))
      (multiplier (calculate-zone-multiplier zone))
    )
    (/ (* base-reward multiplier) u100)
  )
)

;; Check if zone is unlocked
(define-private (is-zone-unlocked (pool-id uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) false))
      (current-block stacks-block-height)
    )
    (>= current-block (get zone-unlock-time pool))
  )
)

;; Update zone if time has passed
(define-private (update-zone-if-needed (pool-id uint))
  (match (map-get? liquidity-pools pool-id)
    pool
    (let
      (
        (current-block stacks-block-height)
        (unlock-time (get zone-unlock-time pool))
        (zone-duration (get zone-duration pool))
        (current-zone (get current-zone pool))
        (max-zones (get zone-count pool))
      )
      (if (and (>= current-block unlock-time) (< current-zone max-zones))
        (begin
          (map-set liquidity-pools pool-id
            (merge pool {
              current-zone: (+ current-zone u1),
              zone-unlock-time: (+ unlock-time zone-duration)
            })
          )
          true
        )
        false
      )
    )
    false
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

;; Get pool information
(define-read-only (get-pool-info (pool-id uint))
  (map-get? liquidity-pools pool-id)
)

;; Get user position in pool
(define-read-only (get-user-position (pool-id uint) (user principal))
  (map-get? user-positions {pool-id: pool-id, user: user})
)

;; Get farmer rewards
(define-read-only (get-farmer-rewards (pool-id uint) (farmer principal))
  (map-get? farmer-rewards {pool-id: pool-id, farmer: farmer})
)

;; Get zone statistics
(define-read-only (get-zone-stats (pool-id uint) (zone uint))
  (map-get? zone-statistics {pool-id: pool-id, zone: zone})
)

;; Get total pools created
(define-read-only (get-total-pools)
  (var-get total-pools-created)
)

;; Get pools owned by farmer
(define-read-only (get-farmer-pools (farmer principal))
  (default-to (list) (map-get? farmer-pools farmer))
)

;; Check if zone is currently unlocked
(define-read-only (check-zone-unlocked (pool-id uint))
  (is-zone-unlocked pool-id)
)

;; Calculate estimated reward for user
(define-read-only (estimate-user-reward (pool-id uint) (user principal))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) (err err-pool-not-found)))
      (position (unwrap! (map-get? user-positions {pool-id: pool-id, user: user}) (err err-not-found)))
      (total-volume (get total-volume pool))
      (current-zone (get current-zone pool))
      (user-contribution (+ (get stx-deposited position) (get usdt-deposited position)))
    )
    (if (> total-volume u0)
      (ok (calculate-user-reward user-contribution total-volume current-zone (get total-volume pool)))
      (ok u0)
    )
  )
)

;; Get pool USDT/STX price ratio
(define-read-only (get-pool-price (pool-id uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) (err err-pool-not-found)))
      (stx-reserve (get stx-reserve pool))
      (usdt-reserve (get usdt-reserve pool))
    )
    (if (and (> stx-reserve u0) (> usdt-reserve u0))
      (ok (/ (* usdt-reserve u1000000) stx-reserve)) ;; Price in micro-USDT per STX
      (err err-insufficient-liquidity)
    )
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - LP FARMER OPERATIONS
;; ============================================

;; Create a new liquidity pool
(define-public (create-liquidity-pool 
    (initial-stx uint)
    (initial-usdt uint)
    (zone-count uint)
    (zone-duration uint))
  (let
    (
      (pool-id (var-get pool-nonce))
      (current-block stacks-block-height)
      (unlock-time (+ current-block zone-duration))
    )
    ;; Validate inputs
    (asserts! (> initial-stx u0) err-invalid-amount)
    (asserts! (> initial-usdt u0) err-invalid-amount)
    (asserts! (and (> zone-count u0) (<= zone-count u10)) err-invalid-zone)
    (asserts! (> zone-duration u0) err-invalid-zone)
    
    ;; Transfer STX from LP Farmer
    (try! (stx-transfer? initial-stx tx-sender (as-contract tx-sender)))
    
    ;; Note: USDT transfer would require SIP-010 token contract integration
    ;; For now, we'll track it in the contract state
    ;; In production, add: (try! (contract-call? .usdt-token transfer initial-usdt tx-sender (as-contract tx-sender) none))
    
    ;; Create the pool
    (map-set liquidity-pools pool-id {
      lp-farmer: tx-sender,
      stx-reserve: initial-stx,
      usdt-reserve: initial-usdt,
      total-volume: u0,
      total-transactions: u0,
      zone-count: zone-count,
      current-zone: u0,
      zone-unlock-time: unlock-time,
      zone-duration: zone-duration,
      created-at: current-block,
      active: true
    })
    
    ;; Initialize farmer rewards
    (map-set farmer-rewards {pool-id: pool-id, farmer: tx-sender} {
      total-fees-earned: u0,
      last-claimed: current-block
    })
    
    ;; Track farmer's pools
    (let
      (
        (current-pools (default-to (list) (map-get? farmer-pools tx-sender)))
      )
      (map-set farmer-pools tx-sender (unwrap-panic (as-max-len? (append current-pools pool-id) u100)))
    )
    
    ;; Update counters
    (var-set pool-nonce (+ pool-id u1))
    (var-set total-pools-created (+ (var-get total-pools-created) u1))
    
    (ok pool-id)
  )
)

;; LP Farmer claims accumulated fees
(define-public (claim-farmer-rewards (pool-id uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) err-pool-not-found))
      (rewards (unwrap! (map-get? farmer-rewards {pool-id: pool-id, farmer: tx-sender}) err-not-found))
      (claimable (get total-fees-earned rewards))
      (farmer tx-sender)
    )
    ;; Verify caller is the LP farmer
    (asserts! (is-eq tx-sender (get lp-farmer pool)) err-unauthorized)
    (asserts! (> claimable u0) err-invalid-amount)
    
    ;; Transfer rewards (in STX)
    (try! (as-contract (stx-transfer? claimable tx-sender farmer)))
    
    ;; Update rewards record
    (map-set farmer-rewards {pool-id: pool-id, farmer: tx-sender}
      (merge rewards {
        total-fees-earned: u0,
        last-claimed: stacks-block-height
      })
    )
    
    (ok claimable)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - USER OPERATIONS
;; ============================================

;; Buy USDT with STX (users deposit STX, get USDT value tracked)
(define-public (buy-usdt (pool-id uint) (stx-amount uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) err-pool-not-found))
      (stx-reserve (get stx-reserve pool))
      (usdt-reserve (get usdt-reserve pool))
      (fee (calculate-fee stx-amount))
      (stx-after-fee (- stx-amount fee))
      ;; Constant product formula: x * y = k
      (usdt-out (/ (* stx-after-fee usdt-reserve) (+ stx-reserve stx-after-fee)))
      (current-position (default-to 
        {stx-deposited: u0, usdt-deposited: u0, rewards-earned: u0, last-interaction: u0, can-claim: false}
        (map-get? user-positions {pool-id: pool-id, user: tx-sender})
      ))
      (current-zone (get current-zone pool))
    )
    ;; Validations
    (asserts! (get active pool) err-pool-not-found)
    (asserts! (> stx-amount u0) err-invalid-amount)
    (asserts! (> usdt-out u0) err-insufficient-liquidity)
    
    ;; Update zone if needed
    (update-zone-if-needed pool-id)
    
    ;; Transfer STX from user
    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
    
    ;; Update pool reserves
    (map-set liquidity-pools pool-id
      (merge pool {
        stx-reserve: (+ stx-reserve stx-amount),
        usdt-reserve: (- usdt-reserve usdt-out),
        total-volume: (+ (get total-volume pool) stx-amount),
        total-transactions: (+ (get total-transactions pool) u1)
      })
    )
    
    ;; Update user position
    (map-set user-positions {pool-id: pool-id, user: tx-sender}
      (merge current-position {
        stx-deposited: (+ (get stx-deposited current-position) stx-amount),
        usdt-deposited: (+ (get usdt-deposited current-position) usdt-out),
        last-interaction: stacks-block-height,
        can-claim: false
      })
    )
    
    ;; Update zone statistics
    (let
      (
        (zone-stats (default-to
          {total-buys: u0, total-sells: u0, volume: u0, unique-users: u0, rewards-distributed: u0}
          (map-get? zone-statistics {pool-id: pool-id, zone: current-zone})
        ))
      )
      (map-set zone-statistics {pool-id: pool-id, zone: current-zone}
        (merge zone-stats {
          total-buys: (+ (get total-buys zone-stats) u1),
          volume: (+ (get volume zone-stats) stx-amount)
        })
      )
    )
    
    ;; Track user participation in zone
    (map-set user-zone-participation {pool-id: pool-id, user: tx-sender, zone: current-zone}
      {participated: true, volume-contributed: stx-amount}
    )
    
    ;; Add fee to farmer rewards
    (let
      (
        (farmer-reward-data (unwrap! (map-get? farmer-rewards {pool-id: pool-id, farmer: (get lp-farmer pool)}) err-not-found))
      )
      (map-set farmer-rewards {pool-id: pool-id, farmer: (get lp-farmer pool)}
        (merge farmer-reward-data {
          total-fees-earned: (+ (get total-fees-earned farmer-reward-data) fee)
        })
      )
    )
    
    (ok usdt-out)
  )
)

;; Sell USDT for STX (can only sell when zone is unlocked)
(define-public (sell-usdt (pool-id uint) (usdt-amount uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) err-pool-not-found))
      (position (unwrap! (map-get? user-positions {pool-id: pool-id, user: tx-sender}) err-not-found))
      (stx-reserve (get stx-reserve pool))
      (usdt-reserve (get usdt-reserve pool))
      (fee (calculate-fee usdt-amount))
      (usdt-after-fee (- usdt-amount fee))
      (stx-out (/ (* usdt-after-fee stx-reserve) (+ usdt-reserve usdt-after-fee)))
      (current-zone (get current-zone pool))
      (user tx-sender)
    )
    ;; Validations
    (asserts! (get active pool) err-pool-not-found)
    (asserts! (> usdt-amount u0) err-invalid-amount)
    (asserts! (<= usdt-amount (get usdt-deposited position)) err-insufficient-balance)
    (asserts! (> stx-out u0) err-insufficient-liquidity)
    
    ;; Check if zone is unlocked
    (asserts! (is-zone-unlocked pool-id) err-zone-locked)
    
    ;; Update zone if needed
    (update-zone-if-needed pool-id)
    
    ;; Transfer STX to user
    (try! (as-contract (stx-transfer? stx-out tx-sender user)))
    
    ;; Update pool reserves
    (map-set liquidity-pools pool-id
      (merge pool {
        stx-reserve: (- stx-reserve stx-out),
        usdt-reserve: (+ usdt-reserve usdt-amount),
        total-volume: (+ (get total-volume pool) usdt-amount),
        total-transactions: (+ (get total-transactions pool) u1)
      })
    )
    
    ;; Update user position
    (map-set user-positions {pool-id: pool-id, user: tx-sender}
      (merge position {
        usdt-deposited: (- (get usdt-deposited position) usdt-amount),
        last-interaction: stacks-block-height,
        can-claim: true
      })
    )
    
    ;; Update zone statistics
    (let
      (
        (zone-stats (default-to
          {total-buys: u0, total-sells: u0, volume: u0, unique-users: u0, rewards-distributed: u0}
          (map-get? zone-statistics {pool-id: pool-id, zone: current-zone})
        ))
      )
      (map-set zone-statistics {pool-id: pool-id, zone: current-zone}
        (merge zone-stats {
          total-sells: (+ (get total-sells zone-stats) u1),
          volume: (+ (get volume zone-stats) usdt-amount)
        })
      )
    )
    
    ;; Add fee to farmer rewards
    (let
      (
        (farmer-reward-data (unwrap! (map-get? farmer-rewards {pool-id: pool-id, farmer: (get lp-farmer pool)}) err-not-found))
      )
      (map-set farmer-rewards {pool-id: pool-id, farmer: (get lp-farmer pool)}
        (merge farmer-reward-data {
          total-fees-earned: (+ (get total-fees-earned farmer-reward-data) fee)
        })
      )
    )
    
    (ok stx-out)
  )
)

;; Claim rewards (can only claim when zone is unlocked)
(define-public (claim-rewards (pool-id uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools pool-id) err-pool-not-found))
      (position (unwrap! (map-get? user-positions {pool-id: pool-id, user: tx-sender}) err-not-found))
      (current-zone (get current-zone pool))
      (user-contribution (+ (get stx-deposited position) (get usdt-deposited position)))
      (total-volume (get total-volume pool))
      (reward (if (> total-volume u0)
        (calculate-user-reward user-contribution total-volume current-zone (get total-volume pool))
        u0
      ))
      (user tx-sender)
    )
    ;; Validations
    (asserts! (get active pool) err-pool-not-found)
    (asserts! (is-zone-unlocked pool-id) err-zone-locked)
    (asserts! (> reward u0) err-invalid-amount)
    (asserts! (get can-claim position) err-unauthorized)
    
    ;; Transfer reward to user
    (try! (as-contract (stx-transfer? reward tx-sender user)))
    
    ;; Update user position
    (map-set user-positions {pool-id: pool-id, user: tx-sender}
      (merge position {
        rewards-earned: (+ (get rewards-earned position) reward),
        can-claim: false,
        last-interaction: stacks-block-height
      })
    )
    
    ;; Update zone statistics
    (let
      (
        (zone-stats (unwrap! (map-get? zone-statistics {pool-id: pool-id, zone: current-zone}) err-not-found))
      )
      (map-set zone-statistics {pool-id: pool-id, zone: current-zone}
        (merge zone-stats {
          rewards-distributed: (+ (get rewards-distributed zone-stats) reward)
        })
      )
    )
    
    (ok reward)
  )
)
