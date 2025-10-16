'use client';

import React, { useEffect, useState } from 'react';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { NotConnected } from '@/components/notConnected';
import { TaskCard } from '@/components/task/taskCard';
import { CreateTaskModal } from '@/components/task/createTaskModal';
import { useWallet } from '@/contexts/walletContext';
import { 
  getFarmerPools, 
  getPoolInfo, 
  checkZoneUnlocked,
  PoolInfo 
} from '@/lib/vault-contract';
import { TaskPool } from '@/types/task';
import { poolToTask } from '@/lib/task-helpers';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

export default function PuddlePage() {
  const { isConnected, address } = useWallet();
  const [tasks, setTasks] = useState<TaskPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadUserTasks();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const loadUserTasks = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get farmer's pool IDs (now representing tasks)
      const poolIds = await getFarmerPools(address);
      console.log('Fetched task IDs:', poolIds);

      if (poolIds.length === 0) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Convert pools to tasks
      const taskPromises = poolIds.map(async (poolId) => {
        const info = await getPoolInfo(poolId);
        if (!info) return null;

        // Check unlock status for each zone
        const zoneCount = Number(info.zoneCount);
        const unlockPromises = Array.from({ length: zoneCount }, (_, i) => 
          checkZoneUnlocked(poolId).then(unlocked => unlocked)
        );
        const unlockedZones = await Promise.all(unlockPromises);

        return poolToTask(poolId, info, unlockedZones);
      });

      const taskData = await Promise.all(taskPromises);
      const validTasks = taskData.filter((t): t is TaskPool => t !== null);

      setTasks(validTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks. Please try again.');
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your tasks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Tasks</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={loadUserTasks}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Tasks Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't created any tasks. Start tracking your progress by creating your first task!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Create Your First Task
            </button>
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && !error && tasks.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Tasks</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium hover:shadow-md transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Create New Task
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.poolId}
                  task={task}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadUserTasks()}
      />
    </PuddleLayout>
  );
}
