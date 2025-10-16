/**
 * Task Metadata Storage
 * 
 * Stores task titles, descriptions, and milestone information
 * Maps pool IDs to human-readable task data
 */

import { TaskMetadata } from '@/types/task';

// Task metadata for existing and new pools
// Key: poolId, Value: task metadata
export const TASK_METADATA: Record<number, TaskMetadata> = {
  // Pool 0
  0: {
    title: 'Web3 Onboarding Journey',
    description: 'Welcome to Web3! Complete these milestones to get started with decentralized applications.',
    zones: [
      {
        title: 'Connect Your Wallet',
        description: 'Successfully connect your Stacks wallet to begin your journey.',
        unlockType: 'manual',
      },
      {
        title: 'Explore the Dashboard',
        description: 'Navigate through different sections and familiarize yourself with the interface.',
        unlockType: 'manual',
      },
      {
        title: 'Complete Your Profile',
        description: 'Add your information and customize your experience.',
        unlockType: 'manual',
      },
    ],
  },
  
  // Pool 1
  1: {
    title: 'Daily Habits Tracker',
    description: 'Build consistency by completing daily tasks and tracking your progress.',
    zones: [
      {
        title: 'Morning Routine',
        description: 'Complete your morning routine: wake up early, exercise, and have breakfast.',
        unlockType: 'timestamp',
        unlockTimestamp: 100, // Example: unlocks after 100 blocks
      },
      {
        title: 'Learning Session',
        description: 'Dedicate 1 hour to learning something new today.',
        unlockType: 'manual',
      },
      {
        title: 'Evening Reflection',
        description: 'Take 15 minutes to reflect on your day and plan for tomorrow.',
        unlockType: 'manual',
      },
    ],
  },
  
  // Pool 2
  2: {
    title: 'Fitness Challenge',
    description: 'Complete this 30-day fitness challenge to build healthy habits.',
    zones: [
      {
        title: 'Week 1: Foundation',
        description: 'Complete 3 workouts this week to build your foundation.',
        unlockType: 'manual',
      },
      {
        title: 'Week 2: Consistency',
        description: 'Increase to 4 workouts and track your progress.',
        unlockType: 'manual',
      },
      {
        title: 'Week 3: Intensity',
        description: 'Push yourself with 5 high-intensity workouts.',
        unlockType: 'manual',
      },
      {
        title: 'Week 4: Achievement',
        description: 'Complete your final week and celebrate your success!',
        unlockType: 'timestamp',
        unlockTimestamp: 200, // Unlocks after certain time
      },
    ],
  },
};

/**
 * Get task metadata for a pool
 */
export function getTaskMetadata(poolId: number): TaskMetadata | undefined {
  return TASK_METADATA[poolId];
}

/**
 * Add new task metadata (for newly created pools)
 */
export function addTaskMetadata(poolId: number, metadata: TaskMetadata): void {
  TASK_METADATA[poolId] = metadata;
}

/**
 * Check if a pool has task metadata
 */
export function hasTaskMetadata(poolId: number): boolean {
  return poolId in TASK_METADATA;
}

/**
 * Get default task metadata for pools without custom data
 */
export function getDefaultTaskMetadata(poolId: number, zoneCount: number): TaskMetadata {
  return {
    title: `Task #${poolId}`,
    description: `Complete ${zoneCount} milestone${zoneCount > 1 ? 's' : ''} to finish this task.`,
    zones: Array.from({ length: zoneCount }, (_, i) => ({
      title: `Milestone ${i + 1}`,
      description: `Complete this milestone to unlock the next step.`,
      unlockType: 'manual' as const,
    })),
  };
}
