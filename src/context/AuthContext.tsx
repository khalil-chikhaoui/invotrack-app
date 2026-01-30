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
import { useTranslation } from "react-i18next"; // <--- 1. IMPORT THIS
import { authApi } from "../apis/auth";

// --- Interfaces ---

export interface BusinessSummary {
  _id: string;
  name: string;
  logo?: string;
}

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
  isVerified: boolean; 
  language: string; // <--- 2. ADD THIS FIELD (Backend guarantees a default)
  memberships: Membership[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [loading, setLoading] = useState(true);
  
  // <--- 3. HOOK INTO i18n
  const { i18n } = useTranslation(); 

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

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
        logout(); 
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // <--- 4. THE MAGIC SYNC EFFECT
  // Whenever 'user' changes (Login, Refresh, Init), check the language.
  useEffect(() => {
    if (user && user.language) {
      // Only switch if it's actually different to avoid loops
      if (i18n.language !== user.language) {
        i18n.changeLanguage(user.language);
      }
    }
  }, [user, i18n]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
    // Optional: Reset to browser default or 'en' on logout
    // i18n.changeLanguage('en'); 
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};