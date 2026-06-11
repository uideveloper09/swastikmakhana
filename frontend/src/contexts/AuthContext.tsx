"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGetMe, apiLogout } from "@/lib/auth-api";

const AUTH_KEY = "swastik-auth";

interface StoredAuth {
  token: string;
  phone: string;
}

interface AuthContextValue {
  phone: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (token: string, phone: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed?.token && parsed?.phone) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveAuth(auth: StoredAuth | null) {
  if (auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadAuth();
    if (!stored) {
      setReady(true);
      return;
    }

    apiGetMe(stored.token).then((me) => {
      if (me?.phone) {
        setToken(stored.token);
        setPhone(me.phone);
      } else {
        saveAuth(null);
      }
      setReady(true);
    });
  }, []);

  const login = useCallback((nextToken: string, nextPhone: string) => {
    setToken(nextToken);
    setPhone(nextPhone);
    saveAuth({ token: nextToken, phone: nextPhone });
  }, []);

  const logout = useCallback(async () => {
    if (token) await apiLogout(token);
    setToken(null);
    setPhone(null);
    saveAuth(null);
  }, [token]);

  const value = useMemo(
    () => ({
      phone,
      isAuthenticated: Boolean(token && phone),
      ready,
      login,
      logout,
    }),
    [phone, token, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
