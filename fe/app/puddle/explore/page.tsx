/**
 * Explore Tasks Page
 * 
 * Displays all available tasks in the system
 * Limited to first 20 tasks for performance
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PuddleLayout } from '@/components/layout/puddleLayout';
import { useWallet } from '@/contexts/walletContext';
import { TaskCard } from '@/components/task/taskCard';
import {
  getTotalPools,
  getPoolInfo,
  checkZoneUnlocked,
  PoolInfo,
} from '@/lib/vault-contract';
import { TaskPool } from '@/types/task';
import { poolToTask, getTaskStatus } from '@/lib/task-helpers';
import {
  Loader2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const { isConnected } = useWallet();
  const [tasks, setTasks] = useState<TaskPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'progress' | 'milestones'>('newest');

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get total number of tasks
      const total = await getTotalPools();
      console.log('Total tasks from contract:', total);
      setTotalTasksCount(total);

      if (total === 0) {
        console.log('No tasks found, total is 0');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Load first 20 tasks (or less if total is smaller)
      const maxTasks = Math.min(total, 20);
      const taskDataPromises: Promise<TaskPool | null>[] = [];

      console.log(`Loading tasks 0 to ${maxTasks - 1}...`);

      // Pool IDs start from 0
      for (let i = 0; i < maxTasks; i++) {
        taskDataPromises.push(loadSingleTask(i));
      }

      const tasksData = await Promise.all(taskDataPromises);
      console.log('Loaded task data:', tasksData);
      
      // Filter out null values (failed to load)
      const validTasks = tasksData.filter((task): task is TaskPool => task !== null);
      console.log('Valid tasks after filtering:', validTasks.length);
      
      setTasks(validTasks);

    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSingleTask = async (poolId: number): Promise<TaskPool | null> => {
    try {
      console.log(`Fetching task #${poolId}...`);
      const info = await getPoolInfo(poolId);
      console.log(`Task #${poolId} info:`, info);
      
      if (!info) {
        console.log(`Task #${poolId} returned null`);
        return null;
      }

      // Check unlock status for each zone
      const zoneCount = Number(info.zoneCount);
      const unlockPromises = Array.from({ length: zoneCount }, (_, i) => 
        checkZoneUnlocked(poolId).then(unlocked => unlocked)
      );
      const unlockedZones = await Promise.all(unlockPromises);

      return poolToTask(poolId, info, unlockedZones);
    } catch (err) {
      console.error(`Error loading task ${poolId}:`, err);
      return null;
    }
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.poolId.toString().includes(query) ||
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.creator.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === 'completed') {
      filtered = filtered.filter((task) => getTaskStatus(task) === 'completed');
    } else if (filterStatus === 'in-progress') {
      filtered = filtered.filter((task) => getTaskStatus(task) === 'in-progress');
    } else if (filterStatus === 'new') {
      filtered = filtered.filter((task) => getTaskStatus(task) === 'new');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'progress':
          return (b.completedMilestones / b.totalMilestones) - (a.completedMilestones / a.totalMilestones);
        case 'milestones':
          return b.totalMilestones - a.totalMilestones;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();
  const completedCount = tasks.filter((t) => getTaskStatus(t) === 'completed').length;
  const inProgressCount = tasks.filter((t) => getTaskStatus(t) === 'in-progress').length;
  const newCount = tasks.filter((t) => getTaskStatus(t) === 'new').length;

  return (
    <PuddleLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Explore Tasks</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Discover and track available tasks with milestone achievements
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1">Total Tasks</div>
            <div className="text-xl font-bold text-gray-900">{totalTasksCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1">Displaying</div>
            <div className="text-xl font-bold text-blue-600">{tasks.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Completed
            </div>
            <div className="text-xl font-bold text-green-600">{completedCount}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              In Progress
            </div>
            <div className="text-xl font-bold text-blue-600">{inProgressCount}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="new">New Tasks</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="progress">Most Progress</option>
                <option value="milestones">Most Milestones</option>
              </select>
            </div>
          </div>

          {/* Active Filters Info */}
          {(searchQuery || filterStatus !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Loading tasks...</p>
              <p className="text-sm text-gray-500">
                Fetching first {Math.min(totalTasksCount || 20, 20)} tasks
              </p>
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
                onClick={loadAllTasks}
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Tasks Found
            </h3>
            <p className="text-gray-600 text-sm">
              There are no tasks in the system yet. Be the first to create one!
            </p>
          </div>
        )}

        {/* No Results After Filter */}
        {!isLoading && !error && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Matching Tasks
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Task Grid */}
        {!isLoading && !error && filteredTasks.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.poolId}
                  task={task}
                />
              ))}
            </div>

            {/* Show More Info if there are more tasks */}
            {totalTasksCount > 20 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Showing first 20 tasks out of {totalTasksCount} total tasks.
                  More tasks will be loaded in future updates.
                </p>
              </div>
            )}
          </>
        )}

        {/* Not Connected Notice */}
        {!isConnected && !isLoading && tasks.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 text-sm mb-1">
                  Connect Wallet to Participate
                </h4>
                <p className="text-xs text-yellow-800">
                  You can view all tasks, but you need to connect your wallet to complete milestones and track your progress.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PuddleLayout>
  );
}
