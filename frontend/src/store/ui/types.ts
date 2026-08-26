export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  globalLoading: boolean;
}

export interface UIActions {
  /**
   * Toggles the desktop sidebar collapsed state.
   */
  toggleSidebar: () => void;

  /**
   *  sets the desktop sidebar collapsed state.
   */
  setSidebarCollapsed: (collapsed: boolean) => void;

  setMobileSidebarOpen: (open: boolean) => void;

  setGlobalLoading: (loading: boolean) => void;
}

export type UIStore = UIState & UIActions;
