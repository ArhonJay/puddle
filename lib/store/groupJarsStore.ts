import { create } from 'zustand';
import { db } from '@/lib/supabase/database';
import type { 
  GroupJar, 
  GroupJarMember, 
  WithdrawalRequest, 
  WithdrawalApproval,
  GroupJarActivity,
  GroupJarTransaction 
} from '@/types/database.types';

interface GroupJarsState {
  groupJars: GroupJar[];
  selectedGroupJar: GroupJar | null;
  members: GroupJarMember[];
  withdrawalRequests: WithdrawalRequest[];
  activities: GroupJarActivity[];
  transactions: GroupJarTransaction[];
  approvals: Record<string, WithdrawalApproval[]>; // keyed by request id
  isLoading: boolean;
  isTransacting: boolean;
  error: string | null;
}

interface GroupJarsActions {
  // Group Jar CRUD
  fetchGroupJars: (userId: string) => Promise<void>;
  fetchGroupJar: (jarId: string) => Promise<void>;
  createGroupJar: (
    userId: string,
    jar: { 
      name: string; 
      goal_amount: number; 
      image_url?: string; 
      target_date?: string;
      wallet_address: string;
      display_name?: string;
    }
  ) => Promise<GroupJar | null>;
  selectGroupJar: (jar: GroupJar | null) => void;

  // Members
  fetchMembers: (jarId: string) => Promise<void>;
  inviteMember: (jarId: string, walletAddress: string, inviterId: string) => Promise<GroupJarMember | null>;
  joinJar: (jarId: string, userId: string, walletAddress: string, displayName?: string) => Promise<boolean>;
  leaveJar: (jarId: string, userId: string) => Promise<boolean>;

  // Transactions
  deposit: (userId: string, jarId: string, amount: number, txHash?: string, note?: string) => Promise<boolean>;
  
  // Withdrawal Requests
  fetchWithdrawalRequests: (jarId: string) => Promise<void>;
  createWithdrawalRequest: (
    jarId: string, 
    requesterId: string, 
    amount: number, 
    destinationWallet: string,
    reason?: string
  ) => Promise<WithdrawalRequest | null>;
  approveWithdrawal: (requestId: string, userId: string) => Promise<boolean>;
  rejectWithdrawal: (requestId: string, userId: string) => Promise<boolean>;
  executeWithdrawal: (requestId: string, txHash?: string) => Promise<boolean>;
  cancelWithdrawal: (requestId: string) => Promise<boolean>;

  // Activity
  fetchActivities: (jarId: string) => Promise<void>;
  fetchTransactions: (jarId: string) => Promise<void>;

  // Utility
  clearGroupJars: () => void;
}

type GroupJarsStore = GroupJarsState & GroupJarsActions;

export const useGroupJarsStore = create<GroupJarsStore>((set, get) => ({
  // State
  groupJars: [],
  selectedGroupJar: null,
  members: [],
  withdrawalRequests: [],
  activities: [],
  transactions: [],
  approvals: {},
  isLoading: false,
  isTransacting: false,
  error: null,

  // Actions - Now using Supabase database via db service
  fetchGroupJars: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const groupJars = await db.getGroupJars(userId);
      set({ groupJars, isLoading: false });
    } catch (error) {
      console.error('Error fetching group jars:', error);
      set({ error: 'Failed to fetch group jars', isLoading: false });
    }
  },

  fetchGroupJar: async (jarId: string) => {
    try {
      const jar = await db.getGroupJar(jarId);
      
      if (jar) {
        set({ selectedGroupJar: jar });
        // Also fetch related data
        get().fetchMembers(jarId);
        get().fetchWithdrawalRequests(jarId);
        get().fetchActivities(jarId);
        get().fetchTransactions(jarId);
      }
    } catch (error) {
      console.error('Error fetching group jar:', error);
    }
  },

  createGroupJar: async (userId, jarData) => {
    set({ isLoading: true, error: null });

    try {
      const newJar = await db.createGroupJar(userId, jarData);

      if (newJar) {
        const { groupJars } = get();
        set({ groupJars: [newJar, ...groupJars], isLoading: false });
        return newJar;
      }
      
      set({ error: 'Failed to create group jar', isLoading: false });
      return null;
    } catch (error) {
      console.error('Error creating group jar:', error);
      set({ error: 'Failed to create group jar', isLoading: false });
      return null;
    }
  },

  selectGroupJar: (jar) => {
    set({ selectedGroupJar: jar, members: [], withdrawalRequests: [], activities: [], transactions: [] });
    if (jar) {
      get().fetchMembers(jar.id);
      get().fetchWithdrawalRequests(jar.id);
      get().fetchActivities(jar.id);
      get().fetchTransactions(jar.id);
    }
  },

  fetchMembers: async (jarId: string) => {
    try {
      const members = await db.getGroupJarMembers(jarId);
      set({ members });
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  },

  inviteMember: async (jarId: string, walletAddress: string, inviterId: string) => {
    try {
      const newMember = await db.inviteGroupJarMember(jarId, walletAddress, inviterId);
      
      if (newMember) {
        const { members } = get();
        set({ members: [...members, newMember] });
        return newMember;
      }
      
      return null;
    } catch (error) {
      console.error('Error inviting member:', error);
      return null;
    }
  },

  joinJar: async (jarId: string, userId: string, walletAddress: string, displayName?: string) => {
    try {
      const success = await db.joinGroupJar(jarId, userId, walletAddress, displayName);
      
      if (success) {
        get().fetchMembers(jarId);
      }
      
      return success;
    } catch (error) {
      console.error('Error joining jar:', error);
      return false;
    }
  },

  leaveJar: async (jarId: string, userId: string) => {
    try {
      const success = await db.leaveGroupJar(jarId, userId);
      
      if (success) {
        get().fetchMembers(jarId);
      }
      
      return success;
    } catch (error) {
      console.error('Error leaving jar:', error);
      return false;
    }
  },

  deposit: async (userId: string, jarId: string, amount: number, txHash?: string, note?: string) => {
    set({ isTransacting: true, error: null });

    try {
      const { transaction, jar } = await db.groupJarDeposit(userId, jarId, amount, txHash, note);

      if (transaction && jar) {
        const { groupJars, selectedGroupJar, transactions } = get();
        const updatedJars = groupJars.map(j => j.id === jarId ? jar : j);
        
        set({ 
          groupJars: updatedJars,
          selectedGroupJar: selectedGroupJar?.id === jarId ? jar : selectedGroupJar,
          transactions: [transaction, ...transactions],
          isTransacting: false,
        });
        
        // Refresh members to update contribution percentages
        get().fetchMembers(jarId);
        get().fetchActivities(jarId);
        
        return true;
      }

      set({ error: 'Deposit failed', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error depositing to group jar:', error);
      set({ error: 'Deposit failed', isTransacting: false });
      return false;
    }
  },

  fetchWithdrawalRequests: async (jarId: string) => {
    try {
      const withdrawalRequests = await db.getWithdrawalRequests(jarId);
      set({ withdrawalRequests });
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  },

  createWithdrawalRequest: async (jarId, requesterId, amount, destinationWallet, reason) => {
    set({ isTransacting: true, error: null });

    try {
      const request = await db.createWithdrawalRequest(jarId, requesterId, amount, destinationWallet, reason);

      if (request) {
        const { withdrawalRequests } = get();
        set({ 
          withdrawalRequests: [request, ...withdrawalRequests],
          isTransacting: false,
        });
        
        get().fetchActivities(jarId);
        return request;
      }

      set({ error: 'Failed to create withdrawal request', isTransacting: false });
      return null;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      set({ error: 'Failed to create withdrawal request', isTransacting: false });
      return null;
    }
  },

  approveWithdrawal: async (requestId: string, userId: string) => {
    set({ isTransacting: true, error: null });

    try {
      const success = await db.approveWithdrawal(requestId, userId);

      if (success) {
        const { selectedGroupJar } = get();
        if (selectedGroupJar) {
          get().fetchWithdrawalRequests(selectedGroupJar.id);
          get().fetchActivities(selectedGroupJar.id);
        }
        set({ isTransacting: false });
        return true;
      }

      set({ error: 'Failed to approve withdrawal', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      set({ error: 'Failed to approve withdrawal', isTransacting: false });
      return false;
    }
  },

  rejectWithdrawal: async (requestId: string, userId: string) => {
    set({ isTransacting: true, error: null });

    try {
      const success = await db.rejectWithdrawal(requestId, userId);

      if (success) {
        const { selectedGroupJar } = get();
        if (selectedGroupJar) {
          get().fetchWithdrawalRequests(selectedGroupJar.id);
          get().fetchActivities(selectedGroupJar.id);
        }
        set({ isTransacting: false });
        return true;
      }

      set({ error: 'Failed to reject withdrawal', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      set({ error: 'Failed to reject withdrawal', isTransacting: false });
      return false;
    }
  },

  executeWithdrawal: async (requestId: string, txHash?: string) => {
    set({ isTransacting: true, error: null });

    try {
      const success = await db.executeWithdrawal(requestId, txHash);

      if (success) {
        const { selectedGroupJar } = get();
        if (selectedGroupJar) {
          get().fetchGroupJar(selectedGroupJar.id);
        }
        set({ isTransacting: false });
        return true;
      }

      set({ error: 'Failed to execute withdrawal', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error executing withdrawal:', error);
      set({ error: 'Failed to execute withdrawal', isTransacting: false });
      return false;
    }
  },

  cancelWithdrawal: async (requestId: string) => {
    try {
      const success = await db.cancelWithdrawal(requestId);

      if (success) {
        const { selectedGroupJar } = get();
        if (selectedGroupJar) {
          get().fetchWithdrawalRequests(selectedGroupJar.id);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
      return false;
    }
  },

  fetchActivities: async (jarId: string) => {
    try {
      const activities = await db.getGroupJarActivities(jarId);
      set({ activities });
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  },

  fetchTransactions: async (jarId: string) => {
    try {
      const transactions = await db.getGroupJarTransactions(jarId);
      set({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  clearGroupJars: () => {
    set({
      groupJars: [],
      selectedGroupJar: null,
      members: [],
      withdrawalRequests: [],
      activities: [],
      transactions: [],
      approvals: {},
      isLoading: false,
      isTransacting: false,
      error: null,
    });
  },
}));

// Selectors
export const selectGroupJarTotalSaved = (state: GroupJarsState) => 
  state.groupJars.reduce((sum, jar) => sum + jar.current_amount, 0);

export const selectGroupJarTotalGoal = (state: GroupJarsState) => 
  state.groupJars.reduce((sum, jar) => sum + jar.goal_amount, 0);

export const selectActiveMembers = (state: GroupJarsState) => 
  state.members.filter(m => m.status === 'active');

export const selectPendingInvites = (state: GroupJarsState) =>
  state.members.filter(m => m.status === 'pending');

export const selectPendingWithdrawals = (state: GroupJarsState) => 
  state.withdrawalRequests.filter(r => r.status === 'pending' || r.status === 'approved');
