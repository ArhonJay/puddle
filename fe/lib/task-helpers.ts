/**
 * Task Helpers
 * 
 * Convert blockchain pool data to task-oriented UI data
 */

import { PoolInfo } from '@/lib/vault-contract';
import { TaskPool, ZoneMilestone } from '@/types/task';
import { getTaskMetadata, getDefaultTaskMetadata } from './task-metadata';

/**
 * Convert PoolInfo from blockchain to TaskPool for UI
 */
export function poolToTask(
  poolId: number,
  poolInfo: PoolInfo,
  unlockedZones: boolean[]
): TaskPool {
  const metadata = getTaskMetadata(poolId) || getDefaultTaskMetadata(poolId, Number(poolInfo.zoneCount));
  
  const zones: ZoneMilestone[] = metadata.zones.map((zoneMeta, index) => {
    const zoneNumber = index + 1;
    const isUnlocked = unlockedZones[index] || false;
    
    return {
      zoneNumber,
      title: zoneMeta.title,
      description: zoneMeta.description,
      unlockType: zoneMeta.unlockType,
      unlockTimestamp: zoneMeta.unlockTimestamp,
      isUnlocked,
      isCompleted: Number(poolInfo.currentZone) > index,
      completedAt: undefined, // Could be enhanced with on-chain timestamps
    };
  });

  const completedMilestones = zones.filter(z => z.isCompleted).length;

  return {
    poolId,
    title: metadata.title,
    description: metadata.description,
    creator: poolInfo.lpFarmer,
    createdAt: new Date(Number(poolInfo.createdAt) * 1000).toISOString(),
    totalMilestones: zones.length,
    completedMilestones,
    zones,
  };
}

/**
 * Calculate task progress percentage
 */
export function getTaskProgress(task: TaskPool): number {
  if (task.totalMilestones === 0) return 0;
  return Math.round((task.completedMilestones / task.totalMilestones) * 100);
}

/**
 * Get next milestone to complete
 */
export function getNextMilestone(task: TaskPool): ZoneMilestone | null {
  return task.zones.find(z => !z.isCompleted) || null;
}

/**
 * Check if task is fully completed
 */
export function isTaskCompleted(task: TaskPool): boolean {
  return task.completedMilestones === task.totalMilestones;
}

/**
 * Get task status label
 */
export function getTaskStatus(task: TaskPool): 'completed' | 'in-progress' | 'new' {
  if (isTaskCompleted(task)) return 'completed';
  if (task.completedMilestones > 0) return 'in-progress';
  return 'new';
}

/**
 * Format milestone unlock condition
 */
export function formatUnlockCondition(milestone: ZoneMilestone): string {
  if (milestone.unlockType === 'manual') {
    return 'Complete when ready';
  }
  if (milestone.unlockType === 'timestamp' && milestone.unlockTimestamp) {
    return `Unlocks at block ${milestone.unlockTimestamp}`;
  }
  return 'Unknown unlock condition';
}
