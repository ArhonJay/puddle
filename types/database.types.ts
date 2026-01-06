/**
 * Database Types for Supabase
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      jars: {
        Row: Jar;
        Insert: Omit<Jar, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Jar, 'id' | 'user_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'jar_id' | 'created_at'>>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id'>;
        Update: Partial<Omit<Badge, 'id'>>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, 'id' | 'earned_at'>;
        Update: never;
      };
    };
  };
}

/**
 * User Profile - Stores user's game stats and preferences
 */
export interface UserProfile {
  id: string; // References auth.users.id
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  total_xp: number;
  balance: number; // Total balance across all jars
  streak_days: number;
  last_activity_date: string | null;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  created_at: string;
  updated_at: string;
}

/**
 * Jar - Savings goal container
 */
export interface Jar {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  goal_amount: number;
  current_amount: number;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction - Deposit or withdrawal from a jar
 */
export interface Transaction {
  id: string;
  jar_id: string;
  user_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  tx_hash: string | null; // Blockchain transaction hash
  note: string | null;
  created_at: string;
}

/**
 * Badge - Achievement definition
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: 'jars_created' | 'total_saved' | 'streak_days' | 'goals_completed' | 'transactions';
  requirement_value: number;
}

/**
 * UserBadge - Junction table for earned badges
 */
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

/**
 * XP thresholds for each level
 */
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  12000,  // Level 10
] as const;

/**
 * Rank thresholds based on total XP
 */
export const RANK_THRESHOLDS: Record<string, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
  diamond: 10000,
};

/**
 * XP rewards for actions
 */
export const XP_REWARDS = {
  CREATE_JAR: 25,
  FIRST_DEPOSIT: 50,
  DEPOSIT: 10,
  COMPLETE_GOAL: 100,
  DAILY_LOGIN: 5,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
} as const;

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate XP progress to next level
 */
export function calculateLevelProgress(totalXp: number): { current: number; required: number; percentage: number } {
  const level = calculateLevel(totalXp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const current = totalXp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.min((current / required) * 100, 100);
  
  return { current, required, percentage };
}

/**
 * Calculate rank from total XP
 */
export function calculateRank(totalXp: number): UserProfile['rank'] {
  if (totalXp >= RANK_THRESHOLDS.diamond) return 'diamond';
  if (totalXp >= RANK_THRESHOLDS.platinum) return 'platinum';
  if (totalXp >= RANK_THRESHOLDS.gold) return 'gold';
  if (totalXp >= RANK_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}
