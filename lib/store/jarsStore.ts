import { create } from 'zustand';
import { db } from '@/lib/supabase/database';
import type { Jar, Transaction } from '@/types/database.types';

interface JarsState {
  jars: Jar[];
  selectedJar: Jar | null;
  transactions: Transaction[];
  isLoading: boolean;
  isTransacting: boolean;
  error: string | null;
}

interface JarsActions {
  fetchJars: (userId: string) => Promise<void>;
  fetchJar: (jarId: string) => Promise<void>;
  fetchTransactions: (jarId: string) => Promise<void>;
  createJar: (
    userId: string,
    jar: { name: string; goal_amount: number; emoji?: string; image_url?: string; target_date?: string }
  ) => Promise<Jar | null>;
  updateJar: (jarId: string, updates: Partial<Jar>) => Promise<Jar | null>;
  deleteJar: (jarId: string) => Promise<boolean>;
  deposit: (userId: string, jarId: string, amount: number, txHash?: string, note?: string) => Promise<boolean>;
  withdraw: (userId: string, jarId: string, amount: number, txHash?: string, note?: string) => Promise<boolean>;
  selectJar: (jar: Jar | null) => void;
  clearJars: () => void;
}

type JarsStore = JarsState & JarsActions;

export const useJarsStore = create<JarsStore>((set, get) => ({
  // State
  jars: [],
  selectedJar: null,
  transactions: [],
  isLoading: false,
  isTransacting: false,
  error: null,

  // Actions
  fetchJars: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const jars = await db.getJars(userId);
      set({ jars, isLoading: false });
    } catch (error) {
      console.error('Error fetching jars:', error);
      set({ error: 'Failed to fetch jars', isLoading: false });
    }
  },

  fetchJar: async (jarId: string) => {
    try {
      const jar = await db.getJar(jarId);
      if (jar) {
        set({ selectedJar: jar });
        // Also update in jars array
        const { jars } = get();
        const updatedJars = jars.map(j => j.id === jarId ? jar : j);
        set({ jars: updatedJars });
      }
    } catch (error) {
      console.error('Error fetching jar:', error);
    }
  },

  fetchTransactions: async (jarId: string) => {
    try {
      const transactions = await db.getTransactions(jarId);
      set({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  createJar: async (userId, jarData) => {
    set({ isLoading: true, error: null });

    try {
      const jar = await db.createJar(userId, jarData);
      if (jar) {
        const { jars } = get();
        set({ jars: [jar, ...jars], isLoading: false });
        return jar;
      }
      set({ error: 'Failed to create jar', isLoading: false });
      return null;
    } catch (error) {
      console.error('Error creating jar:', error);
      set({ error: 'Failed to create jar', isLoading: false });
      return null;
    }
  },

  updateJar: async (jarId, updates) => {
    try {
      const jar = await db.updateJar(jarId, updates);
      if (jar) {
        const { jars, selectedJar } = get();
        const updatedJars = jars.map(j => j.id === jarId ? jar : j);
        set({ 
          jars: updatedJars,
          selectedJar: selectedJar?.id === jarId ? jar : selectedJar,
        });
        return jar;
      }
      return null;
    } catch (error) {
      console.error('Error updating jar:', error);
      return null;
    }
  },

  deleteJar: async (jarId) => {
    try {
      const success = await db.deleteJar(jarId);
      if (success) {
        const { jars, selectedJar } = get();
        set({ 
          jars: jars.filter(j => j.id !== jarId),
          selectedJar: selectedJar?.id === jarId ? null : selectedJar,
        });
      }
      return success;
    } catch (error) {
      console.error('Error deleting jar:', error);
      return false;
    }
  },

  deposit: async (userId, jarId, amount, txHash, note) => {
    set({ isTransacting: true, error: null });

    try {
      const { transaction, jar } = await db.deposit(userId, jarId, amount, txHash, note);
      
      if (transaction && jar) {
        const { jars, selectedJar, transactions } = get();
        const updatedJars = jars.map(j => j.id === jarId ? jar : j);
        
        set({ 
          jars: updatedJars,
          selectedJar: selectedJar?.id === jarId ? jar : selectedJar,
          transactions: [transaction, ...transactions],
          isTransacting: false,
        });
        return true;
      }
      
      set({ error: 'Deposit failed', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error depositing:', error);
      set({ error: 'Deposit failed', isTransacting: false });
      return false;
    }
  },

  withdraw: async (userId, jarId, amount, txHash, note) => {
    set({ isTransacting: true, error: null });

    try {
      const { transaction, jar } = await db.withdraw(userId, jarId, amount, txHash, note);
      
      if (transaction && jar) {
        const { jars, selectedJar, transactions } = get();
        const updatedJars = jars.map(j => j.id === jarId ? jar : j);
        
        set({ 
          jars: updatedJars,
          selectedJar: selectedJar?.id === jarId ? jar : selectedJar,
          transactions: [transaction, ...transactions],
          isTransacting: false,
        });
        return true;
      }
      
      set({ error: 'Withdrawal failed', isTransacting: false });
      return false;
    } catch (error) {
      console.error('Error withdrawing:', error);
      set({ error: 'Withdrawal failed', isTransacting: false });
      return false;
    }
  },

  selectJar: (jar) => {
    set({ selectedJar: jar, transactions: [] });
    if (jar) {
      get().fetchTransactions(jar.id);
    }
  },

  clearJars: () => {
    set({ jars: [], selectedJar: null, transactions: [] });
  },
}));

// Selectors
export const selectTotalSaved = (state: JarsState) => 
  state.jars.reduce((sum, jar) => sum + jar.current_amount, 0);

export const selectTotalGoal = (state: JarsState) => 
  state.jars.reduce((sum, jar) => sum + jar.goal_amount, 0);

export const selectCompletedJars = (state: JarsState) => 
  state.jars.filter(jar => jar.is_completed);
