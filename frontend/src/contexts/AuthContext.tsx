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
  email?: string;
  phone?: string;
}

interface AuthContextValue {
  email: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (token: string, identity: { email?: string; phone?: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed?.token && (parsed.email || parsed.phone)) return parsed;
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
  const [email, setEmail] = useState<string | null>(null);
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
      if (me?.email || me?.phone) {
        setToken(stored.token);
        setEmail(me.email ?? null);
        setPhone(me.phone ?? null);
      } else {
        saveAuth(null);
      }
      setReady(true);
    });
  }, []);

  const login = useCallback(
    (nextToken: string, identity: { email?: string; phone?: string }) => {
      setToken(nextToken);
      setEmail(identity.email ?? null);
      setPhone(identity.phone ?? null);
      saveAuth({ token: nextToken, ...identity });
    },
    [],
  );

  const logout = useCallback(async () => {
    if (token) await apiLogout(token);
    setToken(null);
    setEmail(null);
    setPhone(null);
    saveAuth(null);
  }, [token]);

  const value = useMemo(
    () => ({
      email,
      phone,
      isAuthenticated: Boolean(token && (email || phone)),
      ready,
      login,
      logout,
    }),
    [email, phone, token, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
