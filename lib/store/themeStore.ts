import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const STORAGE_KEY = 'puddle-theme';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isLoading: boolean;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

/**
 * Theme Store
 * Manages dark/light mode with localStorage persistence
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      isLoading: false,

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Update document attribute for CSS
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          
          // Also add/remove 'dark' class for Tailwind dark mode
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const state = get();
        
        // Apply theme on initialization
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme);
          
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
