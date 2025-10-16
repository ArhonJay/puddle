;; title: Mock USDT Token with Faucet
;; version: 1.0.0
;; summary: SIP-010 compliant mock USDT token for testing with faucet functionality
;; description: A test token that mimics USDT behavior with a built-in faucet for easy testing

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-faucet-cooldown (err u104))

;; Token details
(define-constant token-name "Mock USDT")
(define-constant token-symbol "mUSDT")
(define-constant token-decimals u6) ;; USDT uses 6 decimals
(define-constant token-uri u"https://mock-usdt.example.com/metadata")

;; Faucet settings
(define-constant faucet-amount u10000000) ;; 10 USDT (with 6 decimals)
(define-constant faucet-cooldown u144) ;; ~24 hours in blocks (assuming 10 min blocks)

;; ============================================
;; DATA STRUCTURES
;; ============================================

(define-fungible-token mock-usdt)

;; Track last faucet claim per user
(define-map faucet-claims principal uint)

;; ============================================
;; SIP-010 FUNCTIONS
;; ============================================

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? mock-usdt amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok token-name)
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok token-symbol)
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok token-decimals)
)

;; Get balance of account
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance mock-usdt account))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-usdt))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (some token-uri))
)

;; ============================================
;; FAUCET FUNCTIONS (PUBLIC ACCESS)
;; ============================================

;; Request tokens from faucet (anyone can call, 10 USDT per request)
(define-public (request-faucet)
  (let
    (
      (last-claim (default-to u0 (map-get? faucet-claims tx-sender)))
      (current-height stacks-block-height)
    )
    ;; Check cooldown period
    (asserts! (>= (- current-height last-claim) faucet-cooldown) err-faucet-cooldown)
    
    ;; Mint tokens to sender
    (try! (ft-mint? mock-usdt faucet-amount tx-sender))
    
    ;; Update last claim
    (map-set faucet-claims tx-sender current-height)
    
    (print {
      event: "faucet-claimed",
      recipient: tx-sender,
      amount: faucet-amount,
      block-height: current-height
    })
    
    (ok faucet-amount)
  )
)

;; Check if user can claim from faucet
(define-read-only (can-claim-faucet (user principal))
  (let
    (
      (last-claim (default-to u0 (map-get? faucet-claims user)))
      (current-height stacks-block-height)
      (blocks-since-claim (- current-height last-claim))
    )
    (>= blocks-since-claim faucet-cooldown)
  )
)

;; Get blocks until next faucet claim
(define-read-only (blocks-until-next-claim (user principal))
  (let
    (
      (last-claim (default-to u0 (map-get? faucet-claims user)))
      (current-height stacks-block-height)
      (blocks-since-claim (- current-height last-claim))
    )
    (if (>= blocks-since-claim faucet-cooldown)
      u0
      (- faucet-cooldown blocks-since-claim)
    )
  )
)

;; Get last faucet claim block height
(define-read-only (get-last-claim (user principal))
  (ok (default-to u0 (map-get? faucet-claims user)))
)

;; Get faucet amount constant
(define-read-only (get-faucet-amount)
  (ok faucet-amount)
)

;; Get faucet cooldown constant
(define-read-only (get-faucet-cooldown)
  (ok faucet-cooldown)
)

;; ============================================
;; ADMIN FUNCTIONS (FOR TESTING)
;; ============================================

;; Mint tokens (owner only - for special cases)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? mock-usdt amount recipient)
  )
)

;; Burn tokens
(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (is-eq tx-sender owner) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? mock-usdt amount owner)
  )
)

;; Emergency faucet refill by owner
(define-public (refill-faucet (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? mock-usdt amount (as-contract tx-sender))
  )
)

;; ============================================
;; INITIALIZATION
;; ============================================

;; Mint initial supply to contract owner for testing
(begin
  (try! (ft-mint? mock-usdt u1000000000000 contract-owner)) ;; 1 million USDT (with 6 decimals)
  (ok true)
)
