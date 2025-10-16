/**
 * Task/Milestone Type Definitions
 * 
 * Transforms liquidity pools into task-based milestones
 * while keeping blockchain mechanics underneath
 */

export type UnlockType = 'timestamp' | 'manual';

export interface ZoneMilestone {
  zoneNumber: number;
  title: string;
  description: string;
  unlockType: UnlockType;
  unlockTimestamp?: number; // Block height for timestamp-based
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export interface TaskPool {
  poolId: number;
  title: string;
  description: string;
  creator: string;
  createdAt: string;
  totalMilestones: number;
  completedMilestones: number;
  zones: ZoneMilestone[];
}

export interface TaskMetadata {
  title: string;
  description: string;
  zones: {
    title: string;
    description: string;
    unlockType: UnlockType;
    unlockTimestamp?: number;
  }[];
}
