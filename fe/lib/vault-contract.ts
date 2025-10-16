/**
 * Stacks Vault Contract Integration
 * 
 * This module provides type-safe abstractions for interacting with the
 * Puddle Liquidity Pool smart contract on Stacks blockchain.
 * 
 * Contract: ST1HWVAY6DN2NWE6G8P80DPDJS9FNYJRR7501S77A.vault
 */

import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  ClarityValue,
  cvToJSON,
  standardPrincipalCV,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET, StacksNetwork } from '@stacks/network';
import { openContractCall } from '@stacks/connect';

// Contract Configuration
const CONTRACT_ADDRESS = 'ST1HWVAY6DN2NWE6G8P80DPDJS9FNYJRR7501S77A';
const CONTRACT_NAME = 'vault';

// Network configuration
const NETWORK_TYPE = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
const getNetwork = (): StacksNetwork => {
  return NETWORK_TYPE === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PoolInfo {
  lpFarmer: string;
  stxReserve: bigint;
  usdtReserve: bigint;
  totalVolume: bigint;
  totalTransactions: bigint;
  zoneCount: bigint;
  currentZone: bigint;
  zoneUnlockTime: bigint;
  zoneDuration: bigint;
  createdAt: bigint;
  active: boolean;
}

export interface UserPosition {
  stxDeposited: bigint;
  usdtDeposited: bigint;
  rewardsEarned: bigint;
  lastInteraction: bigint;
  canClaim: boolean;
}

export interface FarmerRewards {
  totalFeesEarned: bigint;
  lastClaimed: bigint;
}

export interface ZoneStats {
  totalBuys: bigint;
  totalSells: bigint;
  volume: bigint;
  uniqueUsers: bigint;
  rewardsDistributed: bigint;
}

export interface ContractCallResult {
  txId: string;
  success: boolean;
  error?: string;
}

// ============================================
// READ-ONLY FUNCTIONS (No wallet needed)
// ============================================

/**
 * Get information about a specific liquidity pool
 * @param poolId - The ID of the pool
 * @returns Pool information or null if not found
 */
export async function getPoolInfo(poolId: number): Promise<PoolInfo | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-pool-info',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    if (data.success && data.value) {
      const pool = data.value.value;
      return {
        lpFarmer: pool['lp-farmer'].value,
        stxReserve: BigInt(pool['stx-reserve'].value),
        usdtReserve: BigInt(pool['usdt-reserve'].value),
        totalVolume: BigInt(pool['total-volume'].value),
        totalTransactions: BigInt(pool['total-transactions'].value),
        zoneCount: BigInt(pool['zone-count'].value),
        currentZone: BigInt(pool['current-zone'].value),
        zoneUnlockTime: BigInt(pool['zone-unlock-time'].value),
        zoneDuration: BigInt(pool['zone-duration'].value),
        createdAt: BigInt(pool['created-at'].value),
        active: pool.active.value,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return null;
  }
}

/**
 * Get user's position in a specific pool
 * @param poolId - The ID of the pool
 * @param userAddress - The user's Stacks address
 * @returns User position or null if not found
 */
export async function getUserPosition(
  poolId: number,
  userAddress: string
): Promise<UserPosition | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-position',
      functionArgs: [uintCV(poolId), standardPrincipalCV(userAddress)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    if (data.success && data.value) {
      const position = data.value.value;
      return {
        stxDeposited: BigInt(position['stx-deposited'].value),
        usdtDeposited: BigInt(position['usdt-deposited'].value),
        rewardsEarned: BigInt(position['rewards-earned'].value),
        lastInteraction: BigInt(position['last-interaction'].value),
        canClaim: position['can-claim'].value,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user position:', error);
    return null;
  }
}

/**
 * Get farmer's rewards for a specific pool
 * @param poolId - The ID of the pool
 * @param farmerAddress - The farmer's Stacks address
 * @returns Farmer rewards or null if not found
 */
export async function getFarmerRewards(
  poolId: number,
  farmerAddress: string
): Promise<FarmerRewards | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-farmer-rewards',
      functionArgs: [uintCV(poolId), standardPrincipalCV(farmerAddress)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    if (data.success && data.value) {
      const rewards = data.value.value;
      return {
        totalFeesEarned: BigInt(rewards['total-fees-earned'].value),
        lastClaimed: BigInt(rewards['last-claimed'].value),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching farmer rewards:', error);
    return null;
  }
}

/**
 * Get statistics for a specific zone in a pool
 * @param poolId - The ID of the pool
 * @param zone - The zone number
 * @returns Zone statistics or null if not found
 */
export async function getZoneStats(
  poolId: number,
  zone: number
): Promise<ZoneStats | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-zone-stats',
      functionArgs: [uintCV(poolId), uintCV(zone)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    if (data.success && data.value) {
      const stats = data.value.value;
      return {
        totalBuys: BigInt(stats['total-buys'].value),
        totalSells: BigInt(stats['total-sells'].value),
        volume: BigInt(stats.volume.value),
        uniqueUsers: BigInt(stats['unique-users'].value),
        rewardsDistributed: BigInt(stats['rewards-distributed'].value),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching zone stats:', error);
    return null;
  }
}

/**
 * Get total number of pools created
 * @returns Total pools count
 */
export async function getTotalPools(): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-pools',
      functionArgs: [],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    return data.success ? Number(data.value.value) : 0;
  } catch (error) {
    console.error('Error fetching total pools:', error);
    return 0;
  }
}

/**
 * Get all pools created by a specific farmer
 * @param farmerAddress - The farmer's Stacks address
 * @returns Array of pool IDs
 */
export async function getFarmerPools(farmerAddress: string): Promise<number[]> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-farmer-pools',
      functionArgs: [standardPrincipalCV(farmerAddress)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    if (data.success && Array.isArray(data.value)) {
      return data.value.map((item: any) => Number(item.value));
    }
    return [];
  } catch (error) {
    console.error('Error fetching farmer pools:', error);
    return [];
  }
}

/**
 * Check if a zone is unlocked for a pool
 * @param poolId - The ID of the pool
 * @returns true if zone is unlocked, false otherwise
 */
export async function checkZoneUnlocked(poolId: number): Promise<boolean> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'check-zone-unlocked',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    return data.success ? data.value : false;
  } catch (error) {
    console.error('Error checking zone unlock:', error);
    return false;
  }
}

/**
 * Estimate user reward for a pool
 * @param poolId - The ID of the pool
 * @param userAddress - The user's Stacks address
 * @returns Estimated reward amount
 */
export async function estimateUserReward(
  poolId: number,
  userAddress: string
): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'estimate-user-reward',
      functionArgs: [uintCV(poolId), standardPrincipalCV(userAddress)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    return data.success ? BigInt(data.value.value) : BigInt(0);
  } catch (error) {
    console.error('Error estimating user reward:', error);
    return BigInt(0);
  }
}

/**
 * Get current price for a pool (STX per USDT)
 * @param poolId - The ID of the pool
 * @returns Pool price
 */
export async function getPoolPrice(poolId: number): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-pool-price',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    const data = cvToJSON(result);
    return data.success ? BigInt(data.value.value) : BigInt(0);
  } catch (error) {
    console.error('Error fetching pool price:', error);
    return BigInt(0);
  }
}

// ============================================
// WRITE FUNCTIONS (Requires wallet connection)
// ============================================

/**
 * Create a new liquidity pool (LP Farmer only)
 * @param initialStx - Initial STX amount (in microSTX)
 * @param initialUsdt - Initial USDT amount (in microUSDT)
 * @param zoneCount - Number of zones (1-10)
 * @param zoneDuration - Duration of each zone in blocks
 * @returns Contract call result with transaction ID
 */
export async function createLiquidityPool(
  initialStx: number,
  initialUsdt: number,
  zoneCount: number,
  zoneDuration: number
): Promise<ContractCallResult> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-liquidity-pool',
      functionArgs: [
        uintCV(initialStx),
        uintCV(initialUsdt),
        uintCV(zoneCount),
        uintCV(zoneDuration),
      ],
      network: getNetwork(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data: any) => {
        console.log('Transaction broadcasted:', data.txId);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { txId: '', success: true };
  } catch (error: any) {
    console.error('Error creating liquidity pool:', error);
    return { txId: '', success: false, error: error.message };
  }
}

/**
 * Buy USDT with STX in a pool
 * @param poolId - The ID of the pool
 * @param stxAmount - Amount of STX to spend (in microSTX)
 * @returns Contract call result
 */
export async function buyUsdt(
  poolId: number,
  stxAmount: number
): Promise<ContractCallResult> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'buy-usdt',
      functionArgs: [uintCV(poolId), uintCV(stxAmount)],
      network: getNetwork(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data: any) => {
        console.log('Buy transaction broadcasted:', data.txId);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { txId: '', success: true };
  } catch (error: any) {
    console.error('Error buying USDT:', error);
    return { txId: '', success: false, error: error.message };
  }
}

/**
 * Sell USDT for STX in a pool (only when zone is unlocked)
 * @param poolId - The ID of the pool
 * @param usdtAmount - Amount of USDT to sell (in microUSDT)
 * @returns Contract call result
 */
export async function sellUsdt(
  poolId: number,
  usdtAmount: number
): Promise<ContractCallResult> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'sell-usdt',
      functionArgs: [uintCV(poolId), uintCV(usdtAmount)],
      network: getNetwork(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data: any) => {
        console.log('Sell transaction broadcasted:', data.txId);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { txId: '', success: true };
  } catch (error: any) {
    console.error('Error selling USDT:', error);
    return { txId: '', success: false, error: error.message };
  }
}

/**
 * Claim rewards from a pool
 * @param poolId - The ID of the pool
 * @returns Contract call result
 */
export async function claimRewards(poolId: number): Promise<ContractCallResult> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-rewards',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data: any) => {
        console.log('Claim rewards transaction broadcasted:', data.txId);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { txId: '', success: true };
  } catch (error: any) {
    console.error('Error claiming rewards:', error);
    return { txId: '', success: false, error: error.message };
  }
}

/**
 * Claim farmer rewards (LP Farmer only)
 * @param poolId - The ID of the pool
 * @returns Contract call result
 */
export async function claimFarmerRewards(poolId: number): Promise<ContractCallResult> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-farmer-rewards',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data: any) => {
        console.log('Claim farmer rewards transaction broadcasted:', data.txId);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { txId: '', success: true };
  } catch (error: any) {
    console.error('Error claiming farmer rewards:', error);
    return { txId: '', success: false, error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format microSTX to STX
 * @param microStx - Amount in microSTX
 * @returns Formatted STX string
 */
export function formatStx(microStx: bigint | number): string {
  const stx = Number(microStx) / 1_000_000;
  return stx.toFixed(6);
}

/**
 * Format microUSDT to USDT
 * @param microUsdt - Amount in microUSDT
 * @returns Formatted USDT string
 */
export function formatUsdt(microUsdt: bigint | number): string {
  const usdt = Number(microUsdt) / 1_000_000;
  return usdt.toFixed(6);
}

/**
 * Convert STX to microSTX
 * @param stx - Amount in STX
 * @returns Amount in microSTX
 */
export function toMicroStx(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Convert USDT to microUSDT
 * @param usdt - Amount in USDT
 * @returns Amount in microUSDT
 */
export function toMicroUsdt(usdt: number): number {
  return Math.floor(usdt * 1_000_000);
}

/**
 * Get contract address and name
 * @returns Object with contract address and name
 */
export function getContractInfo() {
  return {
    address: CONTRACT_ADDRESS,
    name: CONTRACT_NAME,
    network: NETWORK_TYPE,
  };
}

