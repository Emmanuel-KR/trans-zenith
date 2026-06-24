import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { databaseService } from "@/services/database.service";
import type { Credentials } from "@/utilities/shared/types";

const STORAGE_KEY = "tz.auth.user";

interface AuthContextValue {
  user: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY),
  );

  const login = useCallback(async (credentials: Credentials) => {
    const username = await databaseService.login(credentials);
    window.localStorage.setItem(STORAGE_KEY, username);
    setUser(username);
  }, []);

  const logout = useCallback(() => {
    databaseService.logout();
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
