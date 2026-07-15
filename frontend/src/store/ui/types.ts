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
   * Explicitly sets the desktop sidebar collapsed state.
   */
  setSidebarCollapsed: (collapsed: boolean) => void;

  /**
   * Toggles the mobile sidebar overlay.
   */
  setMobileSidebarOpen: (open: boolean) => void;

  /**
   * Enables or disables the global application loading overlay.
   */
  setGlobalLoading: (loading: boolean) => void;
}

export type UIStore = UIState & UIActions;
