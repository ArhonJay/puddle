import { createClient } from '@/lib/supabase/client';
import type { 
  UserProfile, 
  Jar, 
  Transaction,
  GroupJar,
  GroupJarMember,
  WithdrawalRequest,
  WithdrawalApproval,
  GroupJarActivity,
  GroupJarTransaction,
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

  // ==================== GROUP JARS ====================

  /**
   * Get all group jars (publicly visible)
   */
  async getGroupJars(userId: string): Promise<GroupJar[]> {
    const supabase = this.getSupabase();
    
    // Get ALL group jars (publicly visible to all authenticated users)
    const { data, error } = await supabase
      .from('group_jars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group jars:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single group jar by ID
   */
  async getGroupJar(jarId: string): Promise<GroupJar | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('group_jars')
      .select('*')
      .eq('id', jarId)
      .single();

    if (error) {
      console.error('Error fetching group jar:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Create a new group jar
   */
  async createGroupJar(
    userId: string,
    jar: { 
      name: string; 
      goal_amount: number; 
      image_url?: string; 
      target_date?: string;
      wallet_address: string;
      display_name?: string;
    }
  ): Promise<GroupJar | null> {
    const supabase = this.getSupabase();
    
    // Generate a mock contract address for now
    const contractAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const { data: groupJar, error: jarError } = await supabase
      .from('group_jars')
      .insert({
        name: jar.name,
        goal_amount: jar.goal_amount,
        current_amount: 0,
        image_url: jar.image_url || null,
        target_date: jar.target_date || null,
        creator_id: userId,
        contract_address: contractAddress,
        required_approvals: 2,
        is_completed: false,
      })
      .select()
      .single();

    if (jarError) {
      console.error('Error creating group jar:', jarError.message);
      return null;
    }

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('group_jar_members')
      .insert({
        group_jar_id: groupJar.id,
        user_id: userId,
        wallet_address: jar.wallet_address,
        display_name: jar.display_name || null,
        status: 'active',
        contributed_amount: 0,
        contribution_percentage: 0,
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError.message);
    }

    // Log activity
    await this.logGroupJarActivity(groupJar.id, userId, 'jar_created', null, { jar_name: jar.name });

    return groupJar;
  }

  /**
   * Update a group jar
   */
  async updateGroupJar(jarId: string, updates: Partial<GroupJar>): Promise<GroupJar | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('group_jars')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', jarId)
      .select()
      .single();

    if (error) {
      console.error('Error updating group jar:', error.message);
      return null;
    }

    return data;
  }

  // ==================== GROUP JAR MEMBERS ====================

  /**
   * Get members of a group jar (enriched with user profile data)
   */
  async getGroupJarMembers(jarId: string): Promise<GroupJarMember[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('group_jar_members')
      .select('*')
      .eq('group_jar_id', jarId)
      .order('contributed_amount', { ascending: false });

    if (error) {
      console.error('Error fetching group jar members:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Enrich with user profile data for members missing display_name
    const enrichedMembers = await Promise.all(
      data.map(async (member) => {
        // If we already have display_name, just return the member
        if (member.display_name) {
          return member;
        }

        // Fetch profile for this user to get display_name
        if (member.user_id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', member.user_id)
            .single();

          if (profile?.display_name) {
            return {
              ...member,
              display_name: profile.display_name,
            };
          }
        }

        return member;
      })
    );

    return enrichedMembers;
  }

  /**
   * Invite a member to a group jar
   */
  async inviteGroupJarMember(
    jarId: string, 
    walletAddress: string, 
    inviterId: string
  ): Promise<GroupJarMember | null> {
    const supabase = this.getSupabase();
    
    const { data, error } = await supabase
      .from('group_jar_members')
      .insert({
        group_jar_id: jarId,
        user_id: null, // Will be set when they join
        wallet_address: walletAddress,
        status: 'invited',
        invited_by: inviterId,
        contributed_amount: 0,
        contribution_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inviting member:', error.message);
      return null;
    }

    // Log activity
    await this.logGroupJarActivity(jarId, inviterId, 'member_invited', null, { wallet: walletAddress });

    return data;
  }

  /**
   * Join a group jar (for invited members)
   */
  async joinGroupJar(
    jarId: string, 
    userId: string, 
    walletAddress: string,
    displayName?: string
  ): Promise<boolean> {
    const supabase = this.getSupabase();
    
    const { error } = await supabase
      .from('group_jar_members')
      .update({
        user_id: userId,
        display_name: displayName || null,
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .eq('group_jar_id', jarId)
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error joining group jar:', error.message);
      return false;
    }

    // Log activity
    await this.logGroupJarActivity(jarId, userId, 'member_joined', null, { display_name: displayName });

    return true;
  }

  /**
   * Leave a group jar
   */
  async leaveGroupJar(jarId: string, userId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    
    const { error } = await supabase
      .from('group_jar_members')
      .update({ status: 'left' })
      .eq('group_jar_id', jarId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving group jar:', error.message);
      return false;
    }

    // Log activity
    await this.logGroupJarActivity(jarId, userId, 'member_left');

    return true;
  }

  // ==================== GROUP JAR TRANSACTIONS ====================

  /**
   * Deposit to a group jar
   */
  async groupJarDeposit(
    userId: string,
    jarId: string,
    amount: number,
    txHash?: string,
    note?: string
  ): Promise<{ transaction: GroupJarTransaction | null; jar: GroupJar | null }> {
    const supabase = this.getSupabase();
    
    // Get current jar
    const jar = await this.getGroupJar(jarId);
    if (!jar) return { transaction: null, jar: null };

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('group_jar_transactions')
      .insert({
        group_jar_id: jarId,
        user_id: userId,
        type: 'deposit',
        amount,
        tx_hash: txHash || null,
        note: note || null,
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating group jar transaction:', txError.message);
      return { transaction: null, jar: null };
    }

    // Update jar amount
    const newAmount = jar.current_amount + amount;
    const isCompleted = newAmount >= jar.goal_amount;
    
    const updatedJar = await this.updateGroupJar(jarId, {
      current_amount: newAmount,
      is_completed: isCompleted,
    });

    // Update member's contributed amount
    await this.updateMemberContribution(jarId, userId, amount);

    // Log activity
    await this.logGroupJarActivity(jarId, userId, 'deposit', amount, { tx_hash: txHash });

    return { transaction, jar: updatedJar };
  }

  /**
   * Update member's contribution (or add as new member if not exists)
   */
  private async updateMemberContribution(jarId: string, userId: string, amount: number): Promise<void> {
    const supabase = this.getSupabase();
    
    // Get current member data
    const { data: member } = await supabase
      .from('group_jar_members')
      .select('*')
      .eq('group_jar_id', jarId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      // User is not a member yet - auto-add them as a member
      // Get user profile for wallet address and display name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('wallet_address, display_name')
        .eq('id', userId)
        .single();

      // Create new member entry
      await supabase
        .from('group_jar_members')
        .insert({
          group_jar_id: jarId,
          user_id: userId,
          wallet_address: profile?.wallet_address || '',
          display_name: profile?.display_name || null,
          status: 'active',
          contributed_amount: amount,
          contribution_percentage: 0, // Will be recalculated
          joined_at: new Date().toISOString(),
        });

      // Log activity for new member joining via deposit
      await this.logGroupJarActivity(jarId, userId, 'member_joined', null, { via: 'deposit' });
    } else {
      // Update existing member's contribution
      const newContributed = (member.contributed_amount || 0) + amount;

      await supabase
        .from('group_jar_members')
        .update({
          contributed_amount: newContributed,
        })
        .eq('group_jar_id', jarId)
        .eq('user_id', userId);
    }

    // Recalculate all members' percentages
    await this.recalculateMemberPercentages(jarId);
  }

  /**
   * Recalculate all members' contribution percentages
   */
  private async recalculateMemberPercentages(jarId: string): Promise<void> {
    const supabase = this.getSupabase();
    
    const jar = await this.getGroupJar(jarId);
    if (!jar || jar.current_amount === 0) return;

    const members = await this.getGroupJarMembers(jarId);
    
    for (const member of members) {
      const percentage = (member.contributed_amount / jar.current_amount) * 100;
      await supabase
        .from('group_jar_members')
        .update({ contribution_percentage: percentage })
        .eq('id', member.id);
    }
  }

  /**
   * Get group jar transactions
   */
  async getGroupJarTransactions(jarId: string): Promise<GroupJarTransaction[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('group_jar_transactions')
      .select('*')
      .eq('group_jar_id', jarId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group jar transactions:', error.message);
      return [];
    }

    return data || [];
  }

  // ==================== WITHDRAWAL REQUESTS ====================

  /**
   * Get withdrawal requests for a group jar
   */
  async getWithdrawalRequests(jarId: string): Promise<WithdrawalRequest[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('group_jar_id', jarId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawal requests:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Create a withdrawal request
   */
  async createWithdrawalRequest(
    jarId: string,
    requesterId: string,
    amount: number,
    destinationWallet: string,
    reason?: string
  ): Promise<WithdrawalRequest | null> {
    const supabase = this.getSupabase();
    
    const jar = await this.getGroupJar(jarId);
    if (!jar || jar.current_amount < amount) {
      console.error('Insufficient balance or jar not found');
      return null;
    }

    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert({
        group_jar_id: jarId,
        requester_id: requesterId,
        amount,
        destination_wallet: destinationWallet,
        reason: reason || null,
        status: 'pending',
        approvals_count: 0,
        rejections_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating withdrawal request:', error.message);
      return null;
    }

    // Log activity
    await this.logGroupJarActivity(jarId, requesterId, 'withdrawal_requested', amount, { reason });

    return data;
  }

  /**
   * Approve a withdrawal request
   */
  async approveWithdrawal(requestId: string, userId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    
    // Get current request
    const { data: request, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Error fetching withdrawal request:', fetchError?.message);
      return false;
    }

    // Check if user already approved/rejected
    const { data: existingApproval } = await supabase
      .from('withdrawal_approvals')
      .select('*')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .single();

    if (existingApproval) {
      console.error('User already voted on this request');
      return false;
    }

    // Record approval
    const { error: approvalError } = await supabase
      .from('withdrawal_approvals')
      .insert({
        request_id: requestId,
        user_id: userId,
        approved: true,
      });

    if (approvalError) {
      console.error('Error recording approval:', approvalError.message);
      return false;
    }

    // Update request counts
    const newApprovalsCount = request.approvals_count + 1;
    const jar = await this.getGroupJar(request.group_jar_id);
    const requiredApprovals = jar?.required_approvals || 2;
    
    const newStatus = newApprovalsCount >= requiredApprovals ? 'approved' : 'pending';

    await supabase
      .from('withdrawal_requests')
      .update({
        approvals_count: newApprovalsCount,
        status: newStatus,
      })
      .eq('id', requestId);

    // Log activity
    await this.logGroupJarActivity(request.group_jar_id, userId, 'withdrawal_approved', null, { request_id: requestId });

    return true;
  }

  /**
   * Reject a withdrawal request
   */
  async rejectWithdrawal(requestId: string, userId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    
    // Get current request
    const { data: request, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Error fetching withdrawal request:', fetchError?.message);
      return false;
    }

    // Check if user already approved/rejected
    const { data: existingApproval } = await supabase
      .from('withdrawal_approvals')
      .select('*')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .single();

    if (existingApproval) {
      console.error('User already voted on this request');
      return false;
    }

    // Record rejection
    const { error: approvalError } = await supabase
      .from('withdrawal_approvals')
      .insert({
        request_id: requestId,
        user_id: userId,
        approved: false,
      });

    if (approvalError) {
      console.error('Error recording rejection:', approvalError.message);
      return false;
    }

    // Update request
    const newRejectionsCount = request.rejections_count + 1;
    const members = await this.getGroupJarMembers(request.group_jar_id);
    const activeMembers = members.filter(m => m.status === 'active').length;
    
    // If majority rejected, mark as rejected
    const newStatus = newRejectionsCount > activeMembers / 2 ? 'rejected' : 'pending';

    await supabase
      .from('withdrawal_requests')
      .update({
        rejections_count: newRejectionsCount,
        status: newStatus,
      })
      .eq('id', requestId);

    // Log activity
    await this.logGroupJarActivity(request.group_jar_id, userId, 'withdrawal_rejected', null, { request_id: requestId });

    return true;
  }

  /**
   * Execute an approved withdrawal
   */
  async executeWithdrawal(requestId: string, txHash?: string): Promise<boolean> {
    const supabase = this.getSupabase();
    
    const { data: request, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request || request.status !== 'approved') {
      console.error('Request not found or not approved');
      return false;
    }

    // Create withdrawal transaction
    await supabase
      .from('group_jar_transactions')
      .insert({
        group_jar_id: request.group_jar_id,
        user_id: request.requester_id,
        type: 'withdraw',
        amount: request.amount,
        tx_hash: txHash || null,
      });

    // Update jar amount
    const jar = await this.getGroupJar(request.group_jar_id);
    if (jar) {
      await this.updateGroupJar(request.group_jar_id, {
        current_amount: jar.current_amount - request.amount,
      });
    }

    // Update request status
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
        tx_hash: txHash || null,
      })
      .eq('id', requestId);

    // Log activity
    await this.logGroupJarActivity(request.group_jar_id, request.requester_id, 'withdrawal_executed', request.amount, { tx_hash: txHash });

    return true;
  }

  /**
   * Cancel a withdrawal request
   */
  async cancelWithdrawal(requestId: string): Promise<boolean> {
    const supabase = this.getSupabase();
    
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    if (error) {
      console.error('Error cancelling withdrawal:', error.message);
      return false;
    }

    return true;
  }

  // ==================== GROUP JAR ACTIVITIES ====================

  /**
   * Get activities for a group jar
   */
  async getGroupJarActivities(jarId: string): Promise<GroupJarActivity[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('group_jar_activities')
      .select('*')
      .eq('group_jar_id', jarId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group jar activities:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Log a group jar activity
   */
  private async logGroupJarActivity(
    jarId: string,
    userId: string,
    actionType: string,
    amount?: number | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const supabase = this.getSupabase();
    
    await supabase
      .from('group_jar_activities')
      .insert({
        group_jar_id: jarId,
        user_id: userId,
        action_type: actionType,
        amount: amount || null,
        metadata: metadata || null,
      });
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Export class for testing
export { DatabaseService };
