/**
 * Pool Card Component
 * 
 * Displays liquidity pool information in a card format
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Lock, Unlock, ArrowRight } from 'lucide-react';
import { PoolInfo } from '@/lib/vault-contract';
import { formatStx, formatUsdt } from '@/lib/vault-contract';
import { cn } from '@/lib/utils';

interface PoolCardProps {
  poolId: number;
  poolInfo: PoolInfo;
  isLocked: boolean;
  onClick?: () => void;
}

export function PoolCard({ poolId, poolInfo, isLocked, onClick }: PoolCardProps) {
  const stxAmount = formatStx(poolInfo.stxReserve);
  const usdtAmount = formatUsdt(poolInfo.usdtReserve);
  const totalVolume = formatStx(poolInfo.totalVolume);

  return (
    <Link href={`/puddle/pool/${poolId}`}>
      <div
        className={cn(
          "group relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20",
          isLocked ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50/30"
        )}
        onClick={onClick}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Pool ID</div>
              <div className="text-2xl font-bold text-gray-900">#{poolId}</div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
              isLocked 
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            )}>
              {isLocked ? (
                <><Lock className="w-3 h-3" /> Locked</>
              ) : (
                <><Unlock className="w-3 h-3" /> Unlocked</>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">STX Reserve</div>
              <div className="text-lg font-bold text-blue-600">{stxAmount}</div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">USDT Reserve</div>
              <div className="text-lg font-bold text-sky-600">{usdtAmount}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Total Volume
              </span>
              <span className="font-semibold text-gray-900">{totalVolume} STX</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Transactions
              </span>
              <span className="font-semibold text-gray-900">{poolInfo.totalTransactions.toString()}</span>
            </div>
          </div>

          {/* Zone Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Zone Progress</span>
              <span>{poolInfo.currentZone.toString()}/{poolInfo.zoneCount.toString()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(Number(poolInfo.currentZone) / Number(poolInfo.zoneCount)) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">View Details</span>
            <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
