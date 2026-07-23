import { UserRole } from '../../types/roles';

export interface AuthUser {
  id: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

export interface AuthActions {
  /**
   * Called to save user and token after a successful login.
   */
  setCredentials: (user: AuthUser, token: string) => void;

  /**
   * Clears the user session and token.
   */
  logout: () => void;

  /**
   * Performs the login API call, updates state, and persists session.
   * Returns the authenticated user for immediate use in components.
   */
  login: (email: string, password: string) => Promise<AuthUser>;

  /**
   * Updates the current authentication lifecycle status.
   */
  setStatus: (status: AuthState['status']) => void;
}

export type AuthStore = AuthState & AuthActions;
