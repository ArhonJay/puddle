# Liquidity Pool Manager - Milestone-Based Staking System

A Clarity smart contract system that enables milestone-based liquidity pools with time-locked zones and rewards distribution.

## 🎯 Overview

This smart contract implements a unique liquidity pool system where:
- **LP Farmers** create liquidity pools with milestone-based unlock zones
- **Users** can stake tokens (buy) anytime but can only unstake (sell) when milestones/zones are unlocked
- **Rewards** increase progressively with each zone milestone achieved
- **Transparency** - all pool information, transactions, and statistics are publicly available

## 🏗️ System Architecture

### Core Components

1. **Liquidity Pool Manager** - Main contract that handles pool creation and tracking
2. **Liquidity Pools** - Individual pools with STX/USDT pairs and zone mechanics
3. **Zone System** - Time-locked milestones that control when users can exit and claim rewards
4. **Reward System** - Progressive rewards based on contribution and zone multipliers

## 📋 Features

### For LP Farmers

✅ **Create Liquidity Pools**
- Set initial STX and USDT reserves
- Define number of zones (milestones)
- Set duration for each zone
- Automatic validation of parameters

✅ **Earn Trading Fees**
- Collect 0.3% fee on all trades
- View accumulated fees in real-time
- Claim fees at any time

✅ **Track Pools**
- View all pools owned
- Monitor pool statistics
- Access detailed metrics per zone

### For Users

✅ **Stake (Buy) Anytime**
- Buy USDT with STX at any time
- Automatic price calculation using constant product formula
- Position tracking per pool

✅ **Unstake (Sell) at Milestones**
- Sell only when zones are unlocked
- Claim both principal and rewards
- Progressive rewards based on zone achieved

✅ **Transparent Information**
- View pool reserves and liquidity
- Check current price ratios
- See transaction history and volume
- Estimate potential rewards

## 🔧 Contract Functions

### LP Farmer Operations

#### `create-liquidity-pool`
```clarity
(create-liquidity-pool 
    (initial-stx uint)
    (initial-usdt uint)
    (zone-count uint)
    (zone-duration uint))
```
Creates a new liquidity pool with specified parameters.

**Parameters:**
- `initial-stx`: Initial STX to deposit (must be > 0)
- `initial-usdt`: Initial USDT to deposit (must be > 0)
- `zone-count`: Number of unlock zones/milestones (1-10)
- `zone-duration`: Block height duration for each zone

**Returns:** Pool ID on success

#### `claim-farmer-rewards`
```clarity
(claim-farmer-rewards (pool-id uint))
```
Claims accumulated trading fees from a pool.

**Requirements:**
- Caller must be the pool's LP Farmer
- Must have fees to claim

### User Operations

#### `buy-usdt`
```clarity
(buy-usdt (pool-id uint) (stx-amount uint))
```
Buy USDT with STX (stake in the pool).

**Parameters:**
- `pool-id`: ID of the pool to interact with
- `stx-amount`: Amount of STX to swap

**Effects:**
- Transfers STX from user to pool
- Updates user position
- Collects trading fee for LP Farmer
- Updates pool reserves and statistics

#### `sell-usdt`
```clarity
(sell-usdt (pool-id uint) (usdt-amount uint))
```
Sell USDT for STX (unstake from pool).

**Parameters:**
- `pool-id`: ID of the pool
- `usdt-amount`: Amount of USDT to swap back

**Requirements:**
- Zone must be unlocked
- User must have sufficient USDT deposited

#### `claim-rewards`
```clarity
(claim-rewards (pool-id uint))
```
Claim accumulated rewards for participation.

**Requirements:**
- Zone must be unlocked
- User must have sold (unlocked claim eligibility)
- Rewards must be > 0

### Read-Only Functions

#### `get-pool-info`
Returns complete information about a pool.

#### `get-user-position`
Returns user's position in a specific pool.

#### `get-farmer-rewards`
Returns accumulated fees for an LP Farmer.

#### `get-zone-stats`
Returns statistics for a specific zone in a pool.

#### `get-total-pools`
Returns total number of pools created.

#### `get-farmer-pools`
Returns list of pool IDs owned by a farmer.

#### `check-zone-unlocked`
Checks if a pool's current zone is unlocked.

#### `estimate-user-reward`
Calculates estimated reward for a user.

#### `get-pool-price`
Returns current USDT/STX price ratio in a pool.

## 🎮 Usage Examples

### Creating a Pool (LP Farmer)

```clarity
;; Create a pool with 3 zones, each lasting 144 blocks (~1 day)
(contract-call? .vault create-liquidity-pool 
    u10000000    ;; 10 STX
    u10000000    ;; 10 USDT
    u3           ;; 3 zones
    u144)        ;; 144 blocks per zone
```

### Buying USDT (User Stakes)

```clarity
;; Buy USDT with 1 STX
(contract-call? .vault buy-usdt 
    u0           ;; Pool ID
    u1000000)    ;; 1 STX
```

### Selling USDT (User Unstakes)

```clarity
;; After zone unlocks, sell USDT back for STX
(contract-call? .vault sell-usdt 
    u0           ;; Pool ID
    u500000)     ;; 0.5 USDT
```

### Claiming Rewards (User)

```clarity
;; Claim accumulated rewards
(contract-call? .vault claim-rewards u0)
```

### Claiming Fees (LP Farmer)

```clarity
;; LP Farmer claims trading fees
(contract-call? .vault claim-farmer-rewards u0)
```

## 🔐 Security Features

### Access Control
- Only LP Farmers can claim fees from their pools
- Only users with deposits can sell from pools
- Automatic validation of all inputs

### Safety Checks
- Prevents selling more than deposited
- Validates pool existence before operations
- Checks zone unlock status before selling
- Prevents division by zero in calculations
- Validates all amounts > 0

### Economic Security
- Constant product AMM formula (x * y = k)
- Trading fees protect LP Farmers
- Zone locks prevent immediate dumps
- Progressive rewards incentivize longer participation

## 💰 Economics

### Trading Fees
- **Fee Rate:** 0.3% (30 basis points)
- **Distribution:** 100% to LP Farmer of the pool
- **Collection:** Automatic on every trade

### Reward Calculation

**Base Reward:**
```
base_reward = (user_contribution / total_volume) * pool_fees
```

**Zone Multiplier:**
```
Zone 1: 1.0x (100%)
Zone 2: 1.5x (150%)
Zone 3: 2.0x (200%)
Zone N: (1 + 0.5 * N)x
```

**Final Reward:**
```
final_reward = base_reward * zone_multiplier
```

### Price Calculation

Uses constant product formula:
```
x * y = k

Where:
x = STX reserve
y = USDT reserve
k = constant product
```

## 🧪 Testing

Comprehensive test suite included covering:

✅ Pool creation and validation
✅ User buy/sell operations
✅ Zone locking and unlocking mechanics
✅ Reward calculations
✅ Fee collection for LP Farmers
✅ Edge cases and error handling
✅ Multiple pool interactions
✅ Access control

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm test -- vault.test.ts
```

## 🚀 Deployment

### Prerequisites
1. Clarinet CLI installed
2. Stacks wallet configured
3. Sufficient STX for deployment

### Deploy to Testnet

```bash
# Check syntax
clarinet check

# Run tests
clarinet test

# Deploy
clarinet deploy --testnet
```

### Deploy to Mainnet

```bash
clarinet deploy --mainnet
```

## 📊 Data Structures

### Liquidity Pool
```clarity
{
    lp-farmer: principal,
    stx-reserve: uint,
    usdt-reserve: uint,
    total-volume: uint,
    total-transactions: uint,
    zone-count: uint,
    current-zone: uint,
    zone-unlock-time: uint,
    zone-duration: uint,
    created-at: uint,
    active: bool
}
```

### User Position
```clarity
{
    stx-deposited: uint,
    usdt-deposited: uint,
    rewards-earned: uint,
    last-interaction: uint,
    can-claim: bool
}
```

### Zone Statistics
```clarity
{
    total-buys: uint,
    total-sells: uint,
    volume: uint,
    unique-users: uint,
    rewards-distributed: uint
}
```

## ⚠️ Important Notes

### Current Implementation
- USDT transfers are tracked but not enforced (requires SIP-010 integration)
- For production, integrate actual USDT token contract
- STX transfers are fully functional

### Integration Required
To make this production-ready, integrate a USDT token contract:

```clarity
;; Add USDT token trait reference
(use-trait ft-trait .sip-010-trait.sip-010-trait)

;; Update create-liquidity-pool function
(try! (contract-call? .usdt-token transfer 
    initial-usdt 
    tx-sender 
    (as-contract tx-sender) 
    none))
```

## 🛣️ Roadmap

### Phase 1 - Core Features ✅
- [x] Pool creation
- [x] Buy/Sell operations
- [x] Zone mechanics
- [x] Reward system
- [x] Fee collection

### Phase 2 - Enhancements (Planned)
- [ ] SIP-010 USDT integration
- [ ] Multiple token pair support
- [ ] Advanced reward distribution strategies
- [ ] Pool pause/resume functionality
- [ ] Emergency withdrawal mechanism

### Phase 3 - Advanced Features (Future)
- [ ] Liquidity pool tokens (LP tokens)
- [ ] Farming rewards
- [ ] Governance integration
- [ ] Cross-pool strategies
- [ ] Analytics dashboard integration

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Check documentation
- Review test files for examples

## ⚡ Quick Start

1. **Clone and Install**
```bash
git clone <repo-url>
cd puddle/smc
npm install
```

2. **Run Tests**
```bash
npm test
```

3. **Deploy Locally**
```bash
clarinet integrate
```

4. **Create Your First Pool**
```bash
# Use clarinet console or integrate with frontend
```

---

Built with ❤️ using Clarity on Stacks
