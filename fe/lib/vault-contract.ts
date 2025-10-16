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
  ClarityType,
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
    console.log('Fetching pool info for pool ID:', poolId);
    
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-pool-info',
      functionArgs: [uintCV(poolId)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    });

    console.log('Raw pool info result:', result);
    console.log('Result type:', result.type);
    
    // Handle Clarity optional type (some/none)
    if (result.type === 'some') {
      const poolValue = (result as any).value;
      console.log('Pool value (some):', poolValue);
      
      // The pool data is in a tuple
      if (poolValue.type === 'tuple') {
        const poolData = (poolValue as any).value;
        console.log('Pool tuple data:', poolData);
        
        const poolInfo = {
          lpFarmer: poolData['lp-farmer'].value,
          stxReserve: BigInt(poolData['stx-reserve'].value),
          usdtReserve: BigInt(poolData['usdt-reserve'].value),
          totalVolume: BigInt(poolData['total-volume'].value),
          totalTransactions: BigInt(poolData['total-transactions'].value),
          zoneCount: BigInt(poolData['zone-count'].value),
          currentZone: BigInt(poolData['current-zone'].value),
          zoneUnlockTime: BigInt(poolData['zone-unlock-time'].value),
          zoneDuration: BigInt(poolData['zone-duration'].value),
          createdAt: BigInt(poolData['created-at'].value),
          active: poolData.active.value,
        };
        
        console.log('Parsed pool info:', poolInfo);
        return poolInfo;
      }
    }
    
    // If type is 'none', pool doesn't exist
    if (result.type === 'none') {
      console.log('Pool not found (none)');
      return null;
    }
    
    console.log('Pool info not found - unexpected structure');
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

    console.log(`getUserPosition for pool ${poolId}, user ${userAddress}:`, result);
    
    // Handle optional response (some/none)
    const resultAny = result as any;
    if (resultAny.type === 'some' && resultAny.value) {
      const tupleData = resultAny.value.value;
      
      const position = {
        stxDeposited: BigInt(tupleData['stx-deposited'].value),
        usdtDeposited: BigInt(tupleData['usdt-deposited'].value),
        rewardsEarned: BigInt(tupleData['rewards-earned'].value),
        lastInteraction: BigInt(tupleData['last-interaction'].value),
        canClaim: tupleData['can-claim'].value === true,
      };
      
      console.log('Parsed user position:', position);
      return position;
    }
    
    console.log('No user position found (none)');
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

    console.log('Total pools raw result:', result);
    
    // The result is a Clarity uint value directly
    if (result.type === 'uint') {
      const total = Number(result.value);
      console.log('Total pools from contract:', total);
      return total;
    }
    
    console.error('Unexpected result type:', result.type);
    return 0;
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
    console.log('Fetching pools for farmer:', farmerAddress);
    
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-farmer-pools',
      functionArgs: [standardPrincipalCV(farmerAddress)],
      network: getNetwork(),
      senderAddress: CONTRACT_ADDRESS,
    }).catch((err) => {
      console.error('Network error fetching farmer pools:', err);
      throw new Error('Failed to connect to Stacks network. Please check your connection.');
    });

    console.log('Raw result:', result);
    console.log('Result type:', result.type);
    console.log('Result keys:', Object.keys(result));
    
    // Handle Clarity list response
    if (result.type === 'list') {
      // ListCV has a 'value' property that contains the array
      const listValue = (result as any).value || (result as any).list;
      
      if (!listValue || !Array.isArray(listValue)) {
        console.error('List value is not an array:', listValue);
        return [];
      }
      
      const poolIds = listValue.map((item: any) => {
        // Handle uint Clarity values
        if (item && item.type === 'uint') {
          return Number(item.value);
        }
        return 0;
      });
      console.log('Parsed pool IDs:', poolIds);
      return poolIds;
    }
    
    // Fallback to cvToJSON if not a direct list
    const data = cvToJSON(result);
    console.log('cvToJSON data:', data);
    
    if (data.value && Array.isArray(data.value)) {
      const poolIds = data.value.map((item: any) => {
        if (typeof item === 'object' && item.value !== undefined) {
          return Number(item.value);
        }
        return Number(item);
      });
      console.log('Parsed pool IDs (fallback):', poolIds);
      return poolIds;
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

    console.log(`checkZoneUnlocked for pool ${poolId}:`, result);
    
    // Parse the boolean result
    const resultAny = result as any;
    
    // The result has structure: {type: "true"} or {type: "false"}
    if (resultAny.type === 'true' || resultAny.type === 'false') {
      const isUnlocked = resultAny.type === 'true';
      console.log(`Pool ${poolId} is ${isUnlocked ? 'unlocked ✅' : 'locked 🔒'}`);
      return isUnlocked;
    }
    
    // Fallback: Try direct boolean value
    if (typeof resultAny === 'boolean') {
      console.log(`Pool ${poolId} is ${resultAny ? 'unlocked' : 'locked'} (direct boolean)`);
      return resultAny;
    }
    
    // Fallback: Try numeric type (3 = BoolTrue, 4 = BoolFalse)
    if (resultAny.type === 3 || resultAny.type === 4) {
      const isUnlocked = resultAny.type === 3;
      console.log(`Pool ${poolId} is ${isUnlocked ? 'unlocked' : 'locked'} (numeric type)`);
      return isUnlocked;
    }
    
    // Fallback: Try TrueCV or FalseCV constructor
    if (result.constructor?.name === 'TrueCV') {
      console.log(`Pool ${poolId} is unlocked (TrueCV)`);
      return true;
    }
    if (result.constructor?.name === 'FalseCV') {
      console.log(`Pool ${poolId} is locked (FalseCV)`);
      return false;
    }
    
    console.error('Unexpected result structure for checkZoneUnlocked:', {
      result,
      type: typeof result,
      typeField: resultAny.type,
      keys: Object.keys(result),
      constructor: result?.constructor?.name
    });
    return false;
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
      postConditionMode: PostConditionMode.Allow,
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
      postConditionMode: PostConditionMode.Allow,
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
      postConditionMode: PostConditionMode.Allow,
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
      postConditionMode: PostConditionMode.Allow,
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
      postConditionMode: PostConditionMode.Allow,
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


