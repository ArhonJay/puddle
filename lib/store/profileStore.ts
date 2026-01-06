import { create } from 'zustand';
import { db } from '@/lib/supabase/database';
import type { UserProfile } from '@/types/database.types';
import { calculateLevelProgress } from '@/types/database.types';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  levelProgress: { current: number; required: number; percentage: number };
}

interface ProfileActions {
  fetchProfile: (userId: string, displayName?: string) => Promise<void>;
  updateStreak: (userId: string) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  levelProgress: { current: 0, required: 100, percentage: 0 },

  // Actions
  fetchProfile: async (userId: string, displayName?: string) => {
    set({ isLoading: true, error: null });

    try {
      const profile = await db.getOrCreateProfile(userId, displayName);
      
      if (profile) {
        const levelProgress = calculateLevelProgress(profile.total_xp);
        set({ profile, levelProgress, isLoading: false });
      } else {
        set({ error: 'Failed to fetch profile', isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ error: 'Failed to fetch profile', isLoading: false });
    }
  },

  updateStreak: async (userId: string) => {
    try {
      const profile = await db.updateStreak(userId);
      if (profile) {
        const levelProgress = calculateLevelProgress(profile.total_xp);
        set({ profile, levelProgress });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  },

  refreshProfile: async (userId: string) => {
    const profile = await db.getOrCreateProfile(userId);
    if (profile) {
      const levelProgress = calculateLevelProgress(profile.total_xp);
      set({ profile, levelProgress });
    }
  },

  clearProfile: () => {
    set({ profile: null, levelProgress: { current: 0, required: 100, percentage: 0 } });
  },
}));
