/**
 * Task Card Component
 * 
 * Displays task information in a card format
 * Shows investment opportunity and current price
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Trophy, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { TaskPool } from '@/types/task';
import { getTaskProgress, getTaskStatus, getNextMilestone } from '@/lib/task-helpers';
import { getPoolPrice, formatStx } from '@/lib/vault-contract';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: TaskPool;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const progress = getTaskProgress(task);
  const status = getTaskStatus(task);
  const nextMilestone = getNextMilestone(task);
  const [currentPrice, setCurrentPrice] = useState<bigint | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    loadPrice();
  }, [task.poolId]);

  const loadPrice = async () => {
    try {
      const price = await getPoolPrice(task.poolId);
      setCurrentPrice(price);
    } catch (err) {
      console.error('Error loading price:', err);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleInvestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Will navigate to task detail page where investment can be made
    window.location.href = `/puddle/task/${task.poolId}`;
  };

  return (
    <Link href={`/puddle/task/${task.poolId}`}>
      <div
        className={cn(
          "group relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20",
          status === 'completed' && "border-green-200 bg-green-50/30",
          status === 'in-progress' && "border-blue-200 bg-blue-50/30",
          status === 'new' && "border-gray-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
                {task.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description}
              </p>
            </div>
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              status === 'completed' && "bg-green-100",
              status === 'in-progress' && "bg-blue-100",
              status === 'new' && "bg-gray-100"
            )}>
              {status === 'completed' ? (
                <Trophy className="w-5 h-5 text-green-600" />
              ) : status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold">{task.completedMilestones}/{task.totalMilestones} milestones</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  status === 'completed' && "bg-green-500",
                  status === 'in-progress' && "bg-blue-500",
                  status === 'new' && "bg-gray-400"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && status !== 'completed' && (
            <div className="p-2 rounded bg-blue-50 border border-blue-100 mb-3">
              <div className="text-xs text-blue-600 font-medium mb-0.5">Next Milestone:</div>
              <div className="text-xs text-gray-700 line-clamp-1">{nextMilestone.title}</div>
            </div>
          )}

          {/* Status Badge */}
          {status === 'completed' && (
            <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Completed!</span>
            </div>
          )}

          {/* Price & Investment Section */}
          <div className="space-y-2 mb-3">
            {/* Current Price */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Current Price:</span>
              </div>
              <div className="text-xs font-bold text-purple-700">
                {isLoadingPrice ? (
                  <span className="text-gray-400">Loading...</span>
                ) : currentPrice !== null ? (
                  <span>{formatStx(currentPrice)} STX</span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </div>

            {/* Invest Button */}
            <button
              onClick={handleInvestClick}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold hover:from-blue-700 hover:to-sky-600 transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
            >
              <span>Invest in Task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">View Details</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
