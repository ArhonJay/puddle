/**
 * Vault Stats Page
 * 
 * Displays user's portfolio statistics, PnL, ROI calendar, and recent transactions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { useWallet } from '@/contexts/walletContext';
import {
  getUserPosition,
  getFarmerPools,
  getPoolInfo,
  formatStx,
  formatUsdt,
} from '@/lib/vault-contract';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStats {
  totalDeposited: bigint;
  totalRewards: bigint;
  pnl: bigint;
  roi: number;
  activePools: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'claim' | 'create';
  amount: string;
  timestamp: Date;
  poolId: number;
  status: 'success' | 'pending' | 'failed';
}

interface DailyROI {
  date: string;
  roi: number;
  profit: bigint;
}

export default function VaultPage() {
  const { isConnected, address } = useWallet();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyROI, setDailyROI] = useState<DailyROI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (isConnected && address) {
      loadUserStats();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const loadUserStats = async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      // Get user's pools
      const poolIds = await getFarmerPools(address);
      
      let totalDeposited = BigInt(0);
      let totalRewards = BigInt(0);
      let activePools = 0;

      // Aggregate stats from all pools
      for (const poolId of poolIds) {
        const position = await getUserPosition(poolId, address);
        if (position) {
          totalDeposited += position.stxDeposited + position.usdtDeposited;
          totalRewards += position.rewardsEarned;
          activePools++;
        }
      }

      const pnl = totalRewards;
      const roi = totalDeposited > 0 
        ? (Number(totalRewards) / Number(totalDeposited)) * 100 
        : 0;

      setStats({
        totalDeposited,
        totalRewards,
        pnl,
        roi,
        activePools,
      });

      // Generate mock daily ROI data for the last 30 days
      generateDailyROI(roi, totalRewards);

      // Generate mock recent transactions
      generateMockTransactions(poolIds);

    } catch (err) {
      console.error('Error loading user stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyROI = (totalROI: number, totalProfit: bigint) => {
    const days: DailyROI[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate gradual ROI growth
      const dayROI = (totalROI / 30) * (30 - i) * (0.8 + Math.random() * 0.4);
      const dayProfit = totalProfit / BigInt(30) * BigInt(30 - i);
      
      days.push({
        date: date.toISOString().split('T')[0],
        roi: dayROI,
        profit: dayProfit,
      });
    }
    
    setDailyROI(days);
  };

  const generateMockTransactions = (poolIds: number[]) => {
    const txTypes: Transaction['type'][] = ['buy', 'sell', 'claim', 'create'];
    const txs: Transaction[] = [];
    
    for (let i = 0; i < Math.min(5, poolIds.length * 2); i++) {
      const type = txTypes[Math.floor(Math.random() * txTypes.length)];
      const date = new Date();
      date.setHours(date.getHours() - (i * 4));
      
      txs.push({
        id: `tx-${i}`,
        type,
        amount: (Math.random() * 100 + 10).toFixed(6),
        timestamp: date,
        poolId: poolIds[Math.floor(Math.random() * poolIds.length)] || 1,
        status: 'success',
      });
    }
    
    setTransactions(txs);
  };

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const roiData = dailyROI.find(d => d.date === dateStr);
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        roi: roiData?.roi || 0,
        profit: roiData?.profit || BigInt(0),
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 2) return 'bg-green-500';
    if (roi >= 1) return 'bg-green-400';
    if (roi >= 0.5) return 'bg-blue-400';
    if (roi >= 0.1) return 'bg-blue-300';
    return 'bg-gray-200';
  };

  if (!isConnected) {
    return (
      <PuddleLayout>
        <div className="max-w-7xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to view your vault statistics.
          </p>
        </div>
      </PuddleLayout>
    );
  }

  if (isLoading) {
    return (
      <PuddleLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your stats...</p>
            </div>
          </div>
        </div>
      </PuddleLayout>
    );
  }

  return (
    <PuddleLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vault Stats</h1>
          <p className="text-sm text-gray-600">Your portfolio performance and activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Total Deposited</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatStx(stats?.totalDeposited || BigInt(0))}
            </div>
            <div className="text-xs text-gray-500 mt-1">STX</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Total Rewards</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatStx(stats?.totalRewards || BigInt(0))}
            </div>
            <div className="text-xs text-gray-500 mt-1">STX</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">PnL</span>
              {(stats?.pnl || BigInt(0)) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className={cn(
              "text-xl font-bold",
              (stats?.pnl || BigInt(0)) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {(stats?.pnl || BigInt(0)) >= 0 ? '+' : ''}
              {formatStx(stats?.pnl || BigInt(0))}
            </div>
            <div className="text-xs text-gray-500 mt-1">STX</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">ROI</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-600">
              {(stats?.roi || 0).toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.activePools || 0} active pools
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ROI Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Daily ROI Calendar</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    const prev = new Date(selectedMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setSelectedMonth(prev);
                  }}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  ‹
                </button>
                <span className="font-medium text-gray-700 min-w-[100px] text-center">
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const next = new Date(selectedMonth);
                    next.setMonth(next.getMonth() + 1);
                    setSelectedMonth(next);
                  }}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Week days */}
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded flex flex-col items-center justify-center text-xs transition-all",
                      day.isCurrentMonth ? "cursor-pointer hover:ring-2 hover:ring-blue-400" : "opacity-30",
                      !day.isCurrentMonth && "text-gray-400"
                    )}
                    title={day.roi > 0 ? `ROI: ${day.roi.toFixed(2)}%` : undefined}
                  >
                    <div className={cn(
                      "w-full h-full rounded flex flex-col items-center justify-center",
                      day.roi > 0 && day.isCurrentMonth ? getROIColor(day.roi) : "bg-gray-50"
                    )}>
                      <div className={cn(
                        "text-xs font-medium",
                        day.roi > 0.5 && day.isCurrentMonth ? "text-white" : "text-gray-700"
                      )}>
                        {day.date.getDate()}
                      </div>
                      {day.roi > 0.1 && day.isCurrentMonth && (
                        <div className={cn(
                          "text-[8px] font-medium mt-0.5",
                          day.roi > 0.5 ? "text-white/90" : "text-gray-600"
                        )}>
                          {day.roi.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-500">ROI:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-200"></div>
                  <span className="text-gray-600">0%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-300"></div>
                  <span className="text-gray-600">0.1%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-400"></div>
                  <span className="text-gray-600">0.5%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-400"></div>
                  <span className="text-gray-600">1%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-gray-600">2%+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            </div>

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-500">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center",
                        tx.type === 'buy' && "bg-green-100",
                        tx.type === 'sell' && "bg-red-100",
                        tx.type === 'claim' && "bg-blue-100",
                        tx.type === 'create' && "bg-purple-100"
                      )}>
                        {tx.type === 'buy' && <ArrowUpRight className="w-3 h-3 text-green-600" />}
                        {tx.type === 'sell' && <ArrowDownRight className="w-3 h-3 text-red-600" />}
                        {tx.type === 'claim' && <DollarSign className="w-3 h-3 text-blue-600" />}
                        {tx.type === 'create' && <TrendingUp className="w-3 h-3 text-purple-600" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900 capitalize">
                          {tx.type}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Pool #{tx.poolId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-900">
                        {tx.amount}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {tx.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {transactions.length > 0 && (
              <button className="w-full mt-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                View All Transactions
              </button>
            )}
          </div>
        </div>
      </div>
    </PuddleLayout>
  );
}
