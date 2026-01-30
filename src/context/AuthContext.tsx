/**
 * @fileoverview Authentication Context
 * Manages global user state, session persistence, and multi-business memberships.
 * Provides hooks for login/logout and profile synchronization across the application.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "../apis/auth";

// --- Interfaces ---

/**
 * Minimal business information embedded within the user's membership array.
 */
export interface BusinessSummary {
  _id: string;
  name: string;
  logo?: string;
}

/**
 * Defines the user's relationship with a specific business entity.
 */
export interface Membership {
  businessId: BusinessSummary;
  role: "Admin" | "Manager" | "Viewer" | "Deliver";
  title?: string;
}

/**
 * Full authenticated user profile structure.
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  memberships: Membership[];
}

/**
 * Global authentication state and control methods.
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  /** Direct access to update user state for synchronization after profile/business edits */
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps the application to share auth state.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [loading, setLoading] = useState(true);

  /**
   * Re-fetches the user profile from the API to synchronize state.
   * Useful after business creation or membership changes.
   */
  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

  /**
   * Session Initialization:
   * On mount, checks for a stored token and attempts to validate the session.
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const freshUser = await authApi.getProfile();
        setUser(freshUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Session restoration failed", error);
        logout(); // Clear invalid tokens
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  /**
   * Handles the post-authentication workflow.
   * Persists the token to local storage and updates global state.
   */
  const login = (newToken: string, userData: User) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    setUser(userData);
  };

  /**
   * Resets the application state and clears stored credentials.
   */
  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext safely.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
