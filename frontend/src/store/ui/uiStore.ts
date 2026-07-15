import { create } from 'zustand';
import type { UIStore } from './types';

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalLoading: false,

  toggleSidebar: () => 
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    
  setSidebarCollapsed: (collapsed) => 
    set({ sidebarCollapsed: collapsed }),
    
  setMobileSidebarOpen: (open) => 
    set({ mobileSidebarOpen: open }),
    
  setGlobalLoading: (loading) => 
    set({ globalLoading: loading }),
}));
