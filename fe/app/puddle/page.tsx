/**
 * Puddle Home Page
 * 
 * Main dashboard showing user's liquidity pools
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PuddleLayout } from '@/components/layout/PuddleLayout';
import { NotConnected } from '@/components/NotConnected';
import { PoolCard } from '@/components/pool/PoolCard';
import { useWallet } from '@/contexts/WalletContext';
import { 
  getFarmerPools, 
  getPoolInfo, 
  checkZoneUnlocked,
  PoolInfo 
} from '@/lib/vault-contract';
import { Loader2, AlertCircle } from 'lucide-react';

interface PoolData {
  id: number;
  info: PoolInfo;
  isLocked: boolean;
}

export default function PuddlePage() {
  const { isConnected, address } = useWallet();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadUserPools();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const loadUserPools = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get farmer's pool IDs
      const poolIds = await getFarmerPools(address);

      if (poolIds.length === 0) {
        setPools([]);
        setIsLoading(false);
        return;
      }

      // Fetch info for each pool
      const poolDataPromises = poolIds.map(async (poolId) => {
        const info = await getPoolInfo(poolId);
        const isLocked = !(await checkZoneUnlocked(poolId));

        if (info) {
          return { id: poolId, info, isLocked };
        }
        return null;
      });

      const poolData = await Promise.all(poolDataPromises);
      const validPools = poolData.filter((p): p is PoolData => p !== null);

      setPools(validPools);
    } catch (err) {
      console.error('Error loading pools:', err);
      setError('Failed to load your liquidity pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <PuddleLayout>
        <NotConnected />
      </PuddleLayout>
    );
  }

  return (
    <PuddleLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Liquidity Pools
          </h1>
          <p className="text-gray-600">
            Manage your LP farms and track your BTC-dominated yields
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your pools...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Pools</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={loadUserPools}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && pools.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Liquidity Pools Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't created any liquidity pools. Start earning by creating your first pool!
            </p>
            <a
              href="/puddle/vault"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium hover:shadow-lg transition-all duration-200"
            >
              Create Your First Pool
            </a>
          </div>
        )}

        {/* Pools Grid */}
        {!isLoading && !error && pools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <PoolCard
                key={pool.id}
                poolId={pool.id}
                poolInfo={pool.info}
                isLocked={pool.isLocked}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && !error && pools.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total Pools</div>
              <div className="text-3xl font-bold text-gray-900">{pools.length}</div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Active Pools</div>
              <div className="text-3xl font-bold text-green-600">
                {pools.filter(p => p.info.active).length}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Unlocked Pools</div>
              <div className="text-3xl font-bold text-blue-600">
                {pools.filter(p => !p.isLocked).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </PuddleLayout>
  );
}
