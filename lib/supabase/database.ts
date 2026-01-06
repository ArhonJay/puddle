import { createClient } from '@/lib/supabase/client';
import type { 
  UserProfile, 
  Jar, 
  Transaction,
} from '@/types/database.types';

/**
 * Database Service - Handles all Supabase database operations
 */
class DatabaseService {
  private getSupabase() {
    return createClient();
  }

  // ==================== USER PROFILE ====================

  /**
   * Get or create user profile
   */
  async getOrCreateProfile(userId: string, displayName?: string): Promise<UserProfile | null> {
    const supabase = this.getSupabase();
    
    // First try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // If not found (PGRST116 = no rows returned), create new profile
    if (fetchError?.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          display_name: displayName || null,
          level: 1,
          xp: 0,
          total_xp: 0,
          balance: 0,
          streak_days: 0,
          rank: 'Rookie Saver',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError.message, createError.code, createError.details);
        return null;
      }

      return newProfile;
    }

    console.error('Error fetching profile:', fetchError?.message, fetchError?.code);
    return null;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Add XP to user and handle level ups
   */
  async addXP(userId: string, xpAmount: number): Promise<UserProfile | null> {
    const profile = await this.getOrCreateProfile(userId);
    if (!profile) return null;

    const newTotalXp = profile.total_xp + xpAmount;
    const { calculateLevel, calculateRank } = await import('@/types/database.types');
    const newLevel = calculateLevel(newTotalXp);
    const newRank = calculateRank(newTotalXp);

    return this.updateProfile(userId, {
      total_xp: newTotalXp,
      xp: newTotalXp, // Keep xp same as total_xp for now
      level: newLevel,
      rank: newRank,
    });
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string): Promise<UserProfile | null> {
    const profile = await this.getOrCreateProfile(userId);
    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = profile.last_activity_date?.split('T')[0];

    if (lastActivity === today) {
      // Already logged in today
      return profile;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.streak_days;
    if (lastActivity === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    // Award XP for daily login
    const { XP_REWARDS } = await import('@/types/database.types');
    let xpToAdd = XP_REWARDS.DAILY_LOGIN;
    
    // Bonus for streaks
    if (newStreak === 7) xpToAdd += XP_REWARDS.STREAK_7_DAYS;
    if (newStreak === 30) xpToAdd += XP_REWARDS.STREAK_30_DAYS;

    const updatedProfile = await this.updateProfile(userId, {
      streak_days: newStreak,
      last_activity_date: new Date().toISOString(),
    });

    if (updatedProfile && xpToAdd > 0) {
      return this.addXP(userId, xpToAdd);
    }

    return updatedProfile;
  }

  // ==================== JARS ====================

  /**
   * Get all jars for a user
   */
  async getJars(userId: string): Promise<Jar[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('jars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jars:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single jar by ID
   */
  async getJar(jarId: string): Promise<Jar | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('jars')
      .select('*')
      .eq('id', jarId)
      .single();

    if (error) {
      console.error('Error fetching jar:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Create a new jar
   */
  async createJar(
    userId: string,
    jar: { name: string; goal_amount: number; emoji?: string; image_url?: string; target_date?: string }
  ): Promise<Jar | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('jars')
      .insert({
        user_id: userId,
        name: jar.name,
        goal_amount: jar.goal_amount,
        current_amount: 0,
        emoji: jar.emoji || null,
        image_url: jar.image_url || null,
        target_date: jar.target_date || null,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating jar:', error.message);
      return null;
    }

    // Award XP for creating a jar
    const { XP_REWARDS } = await import('@/types/database.types');
    await this.addXP(userId, XP_REWARDS.CREATE_JAR);

    return data;
  }

  /**
   * Update a jar
   */
  async updateJar(jarId: string, updates: Partial<Jar>): Promise<Jar | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('jars')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', jarId)
      .select()
      .single();

    if (error) {
      console.error('Error updating jar:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Delete a jar
   */
  async deleteJar(jarId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('jars')
      .delete()
      .eq('id', jarId);

    if (error) {
      console.error('Error deleting jar:', error.message);
      return false;
    }

    return true;
  }

  // ==================== TRANSACTIONS ====================

  /**
   * Get transactions for a jar
   */
  async getTransactions(jarId: string): Promise<Transaction[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('jar_id', jarId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user transactions:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Create a deposit transaction
   */
  async deposit(
    userId: string,
    jarId: string,
    amount: number,
    txHash?: string,
    note?: string
  ): Promise<{ transaction: Transaction | null; jar: Jar | null }> {
    const supabase = this.getSupabase();
    
    // Get current jar
    const jar = await this.getJar(jarId);
    if (!jar) return { transaction: null, jar: null };

    // Check if this is the first deposit for this jar
    const existingTransactions = await this.getTransactions(jarId);
    const isFirstDeposit = existingTransactions.length === 0;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        jar_id: jarId,
        user_id: userId,
        type: 'deposit',
        amount,
        tx_hash: txHash || null,
        note: note || null,
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError.message);
      return { transaction: null, jar: null };
    }

    // Update jar amount
    const newAmount = jar.current_amount + amount;
    const isCompleted = newAmount >= jar.goal_amount;
    
    const updatedJar = await this.updateJar(jarId, {
      current_amount: newAmount,
      is_completed: isCompleted,
    });

    // Award XP
    const { XP_REWARDS } = await import('@/types/database.types');
    let xpToAdd = XP_REWARDS.DEPOSIT;
    if (isFirstDeposit) xpToAdd += XP_REWARDS.FIRST_DEPOSIT;
    if (isCompleted && !jar.is_completed) xpToAdd += XP_REWARDS.COMPLETE_GOAL;
    
    await this.addXP(userId, xpToAdd);

    // Update user's total balance
    await this.updateUserBalance(userId);

    return { transaction, jar: updatedJar };
  }

  /**
   * Create a withdrawal transaction
   */
  async withdraw(
    userId: string,
    jarId: string,
    amount: number,
    txHash?: string,
    note?: string
  ): Promise<{ transaction: Transaction | null; jar: Jar | null }> {
    const supabase = this.getSupabase();
    
    // Get current jar
    const jar = await this.getJar(jarId);
    if (!jar || jar.current_amount < amount) {
      console.error('Insufficient balance or jar not found');
      return { transaction: null, jar: null };
    }

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        jar_id: jarId,
        user_id: userId,
        type: 'withdraw',
        amount,
        tx_hash: txHash || null,
        note: note || null,
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError.message);
      return { transaction: null, jar: null };
    }

    // Update jar amount
    const newAmount = jar.current_amount - amount;
    const updatedJar = await this.updateJar(jarId, {
      current_amount: newAmount,
      is_completed: newAmount >= jar.goal_amount,
    });

    // Update user's total balance
    await this.updateUserBalance(userId);

    return { transaction, jar: updatedJar };
  }

  /**
   * Update user's total balance (sum of all jars)
   */
  private async updateUserBalance(userId: string): Promise<void> {
    const jars = await this.getJars(userId);
    const totalBalance = jars.reduce((sum, jar) => sum + jar.current_amount, 0);
    await this.updateProfile(userId, { balance: totalBalance });
  }

  // ==================== STATISTICS ====================

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSaved: number;
    totalGoal: number;
    jarsCount: number;
    completedJars: number;
    transactionsCount: number;
  }> {
    const jars = await this.getJars(userId);
    const transactions = await this.getUserTransactions(userId, 1000);

    return {
      totalSaved: jars.reduce((sum, jar) => sum + jar.current_amount, 0),
      totalGoal: jars.reduce((sum, jar) => sum + jar.goal_amount, 0),
      jarsCount: jars.length,
      completedJars: jars.filter(jar => jar.is_completed).length,
      transactionsCount: transactions.length,
    };
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Export class for testing
export { DatabaseService };
