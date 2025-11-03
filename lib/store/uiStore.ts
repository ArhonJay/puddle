import { create } from 'zustand';

interface UIState {
  isSearchSidebarOpen: boolean;
  isNavbarTransparent: boolean;
  isMobileMenuOpen: boolean;
}

interface UIActions {
  openSearchSidebar: () => void;
  closeSearchSidebar: () => void;
  toggleSearchSidebar: () => void;
  setNavbarTransparent: (transparent: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export type UIStore = UIState & UIActions;

/**
 * UI Store
 * Manages UI state like sidebars, modals, and navbar appearance
 */
export const useUIStore = create<UIStore>((set) => ({
  // State
  isSearchSidebarOpen: false,
  isNavbarTransparent: true,
  isMobileMenuOpen: false,

  // Actions
  openSearchSidebar: () => set({ isSearchSidebarOpen: true }),
  
  closeSearchSidebar: () => set({ isSearchSidebarOpen: false }),
  
  toggleSearchSidebar: () =>
    set((state) => ({ isSearchSidebarOpen: !state.isSearchSidebarOpen })),
  
  setNavbarTransparent: (transparent: boolean) =>
    set({ isNavbarTransparent: transparent }),
  
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
