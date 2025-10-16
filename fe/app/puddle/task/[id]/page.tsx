/**
 * Task Detail Page
 * 
 * Shows detailed information about a specific task
 * including all milestones, progress, and completion status
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { useWallet } from '@/contexts/walletContext';
import {
  getPoolInfo,
  checkZoneUnlocked,
  getPoolPrice,
  getUserPosition,
  estimateUserReward,
  buyUsdt,
  claimRewards,
  formatStx,
  formatUsdt,
  toMicroStx,
  PoolInfo,
  UserPosition,
} from '@/lib/vault-contract';
import { TaskPool, ZoneMilestone } from '@/types/task';
import { poolToTask, getTaskStatus, getTaskProgress } from '@/lib/task-helpers';
import { getTaskMetadata } from '@/lib/task-metadata';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Lock,
  Trophy,
  Calendar,
  User,
  Target,
  TrendingUp,
  Coins,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const taskId = parseInt(params.id as string);

  // State
  const [task, setTask] = useState<TaskPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ZoneMilestone | null>(null);
  
  // Investment & Rewards state
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0));
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [estimatedReward, setEstimatedReward] = useState<bigint>(BigInt(0));
  const [investAmount, setInvestAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);

  useEffect(() => {
    loadTaskData();
  }, [taskId, address]);

  const loadTaskData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load pool info
      const info = await getPoolInfo(taskId);
      if (!info) {
        setError('Task not found');
        setIsLoading(false);
        return;
      }

      // Check if user is the creator
      if (address) {
        setIsCreator(info.lpFarmer.toLowerCase() === address.toLowerCase());
      }

      // Check unlock status for each zone
      const zoneCount = Number(info.zoneCount);
      const unlockPromises = Array.from({ length: zoneCount }, (_, i) => 
        checkZoneUnlocked(taskId).then(unlocked => unlocked)
      );
      const unlockedZones = await Promise.all(unlockPromises);

      // Convert to task
      const taskData = poolToTask(taskId, info, unlockedZones);
      setTask(taskData);

      // Load investment data if user is connected
      if (address) {
        // Get current price
        const price = await getPoolPrice(taskId);
        setCurrentPrice(price);

        // Get user position
        const position = await getUserPosition(taskId, address);
        setUserPosition(position);

        // Estimate rewards
        const reward = await estimateUserReward(taskId, address);
        setEstimatedReward(reward);
      }

    } catch (err) {
      console.error('Error loading task data:', err);
      setError('Failed to load task data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      setTxError('Please enter a valid amount');
      return;
    }

    try {
      setIsProcessing(true);
      setTxError(null);

      const microAmount = toMicroStx(parseFloat(investAmount));
      const result = await buyUsdt(taskId, microAmount);

      if (result.success) {
        // Refresh data after successful investment
        setTimeout(() => {
          loadTaskData();
          setInvestAmount('');
          setShowInvestModal(false);
        }, 2000);
      } else {
        setTxError(result.error || 'Investment failed');
      }
    } catch (err: any) {
      console.error('Error investing:', err);
      setTxError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsProcessing(true);
      setTxError(null);

      const result = await claimRewards(taskId);

      if (result.success) {
        setTimeout(() => {
          loadTaskData();
        }, 2000);
      } else {
        setTxError(result.error || 'Claim failed');
      }
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      setTxError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteMilestone = async (milestone: ZoneMilestone) => {
    if (!isConnected) {
      alert('Please connect your wallet to complete milestones');
      return;
    }

    // TODO: Implement milestone completion logic
    // This would call the smart contract to mark zone as completed
    console.log('Complete milestone:', milestone);
    setSelectedMilestone(milestone);
  };

  if (isLoading) {
    return (
      <PuddleLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading task details...</p>
            </div>
          </div>
        </div>
      </PuddleLayout>
    );
  }

  if (error || !task) {
    return (
      <PuddleLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error || 'Task not found'}</p>
              <button
                onClick={() => router.push('/puddle')}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Back to Tasks
              </button>
            </div>
          </div>
        </div>
      </PuddleLayout>
    );
  }

  const taskStatus = getTaskStatus(task);
  const progress = getTaskProgress(task);

  return (
    <PuddleLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/puddle')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Tasks</span>
        </button>

        {/* Task Header */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{task.title}</h1>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    taskStatus === 'completed' && 'bg-green-100 text-green-700',
                    taskStatus === 'in-progress' && 'bg-blue-100 text-blue-700',
                    taskStatus === 'new' && 'bg-gray-100 text-gray-700'
                  )}
                >
                  {taskStatus === 'completed' && '✓ Completed'}
                  {taskStatus === 'in-progress' && '◐ In Progress'}
                  {taskStatus === 'new' && '○ New'}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
            </div>
            {taskStatus === 'completed' && (
              <Trophy className="w-12 h-12 text-yellow-500 flex-shrink-0" />
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="text-gray-600">{progress}% Complete</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  taskStatus === 'completed' && 'bg-gradient-to-r from-green-500 to-emerald-600',
                  taskStatus === 'in-progress' && 'bg-gradient-to-r from-blue-500 to-sky-600',
                  taskStatus === 'new' && 'bg-gray-300'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Creator</div>
                <div className="font-medium text-gray-700 truncate">
                  {task.creator.slice(0, 8)}...{task.creator.slice(-4)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div className="font-medium text-gray-700">
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Milestones</div>
                <div className="font-medium text-gray-700">
                  {task.completedMilestones} / {task.totalMilestones}
                </div>
              </div>
            </div>
          </div>

          {isCreator && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-blue-700">You created this task</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment & Rewards Section */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Investment Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-900">Investment</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Current Price:</span>
                  <span className="text-lg font-bold text-purple-900">
                    {formatStx(currentPrice)} STX
                  </span>
                </div>

                {userPosition && (
                  <div className="pt-3 border-t border-purple-200">
                    <div className="text-xs text-purple-600 mb-2">Your Position:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Invested:</span>
                        <span className="font-medium text-purple-900">
                          {formatStx(userPosition.stxDeposited)} STX
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Holdings:</span>
                        <span className="font-medium text-purple-900">
                          {formatUsdt(userPosition.usdtDeposited)} USDT
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowInvestModal(true)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:shadow-md"
                >
                  Invest in Task
                </button>
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Rewards</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Estimated Rewards:</span>
                  <span className="text-lg font-bold text-green-900">
                    {formatStx(estimatedReward)} STX
                  </span>
                </div>

                {/* Maintain consistent height with Investment card */}
                {userPosition && userPosition.rewardsEarned > BigInt(0) ? (
                  <div className="pt-3 border-t border-green-200">
                    <div className="text-xs text-green-600 mb-2">Your Rewards:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Earned:</span>
                        <span className="font-medium text-green-900">
                          {formatStx(userPosition.rewardsEarned)} STX
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-green-200">
                    <div className="text-xs text-green-600 mb-2">Your Rewards:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Earned:</span>
                        <span className="font-medium text-green-900">0 STX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Holdings:</span>
                        <span className="font-medium text-green-900">0 STX</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleClaimRewards}
                  disabled={isProcessing || estimatedReward === BigInt(0)}
                  className={cn(
                    "w-full py-2.5 rounded-lg font-semibold transition-all duration-200",
                    estimatedReward > BigInt(0)
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming...
                    </span>
                  ) : (
                    'Claim Rewards'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Error */}
        {txError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{txError}</p>
          </div>
        )}

        {/* Milestones List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestones
          </h2>

          <div className="space-y-3">
            {task.zones.map((milestone, index) => (
              <div
                key={milestone.zoneNumber}
                className={cn(
                  'border-2 rounded-xl p-4 transition-all',
                  milestone.isCompleted && 'bg-green-50 border-green-200',
                  !milestone.isCompleted && milestone.isUnlocked && 'bg-white border-blue-200 hover:border-blue-300',
                  !milestone.isCompleted && !milestone.isUnlocked && 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {milestone.isCompleted ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    ) : milestone.isUnlocked ? (
                      <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    ) : (
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={cn(
                          'font-semibold',
                          milestone.isCompleted && 'text-green-900',
                          !milestone.isCompleted && milestone.isUnlocked && 'text-gray-900',
                          !milestone.isCompleted && !milestone.isUnlocked && 'text-gray-500'
                        )}
                      >
                        {milestone.title}
                      </h3>
                      {milestone.isCompleted && milestone.completedAt && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ {new Date(milestone.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p
                      className={cn(
                        'text-sm mb-2',
                        milestone.isCompleted && 'text-green-700',
                        !milestone.isCompleted && milestone.isUnlocked && 'text-gray-600',
                        !milestone.isCompleted && !milestone.isUnlocked && 'text-gray-400'
                      )}
                    >
                      {milestone.description}
                    </p>

                    {/* Unlock Info */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {milestone.unlockType === 'timestamp' ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span
                              className={cn(
                                milestone.isUnlocked ? 'text-green-600' : 'text-gray-500'
                              )}
                            >
                              {milestone.isUnlocked ? 'Time-based (Unlocked)' : 'Time-based (Locked)'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Target className="w-3 h-3" />
                            <span className="text-blue-600">Manual unlock</span>
                          </>
                        )}
                      </div>

                      {!milestone.isCompleted && milestone.isUnlocked && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                          Ready to complete
                        </span>
                      )}

                      {!milestone.isUnlocked && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!milestone.isCompleted && milestone.isUnlocked && (
                    <button
                      onClick={() => handleCompleteMilestone(milestone)}
                      disabled={!isConnected}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                        isConnected
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect Wallet Notice */}
        {!isConnected && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 text-sm mb-1">
                  Connect Wallet to Participate
                </h4>
                <p className="text-xs text-yellow-800">
                  Connect your wallet to invest in this task, complete milestones, and claim rewards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Investment Modal */}
        {showInvestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowInvestModal(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invest in Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (STX)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="100.0"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Current price: {formatStx(currentPrice)} STX per unit
                  </p>
                </div>

                {txError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">{txError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInvestModal(false)}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvest}
                    disabled={isProcessing || !investAmount || parseFloat(investAmount) <= 0}
                    className={cn(
                      "flex-1 py-3 rounded-lg font-medium text-white transition-all",
                      "bg-gradient-to-r from-purple-600 to-pink-600",
                      "hover:from-purple-700 hover:to-pink-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Investing...
                      </>
                    ) : (
                      'Invest'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PuddleLayout>
  );
}
