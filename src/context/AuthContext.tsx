import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStorage } from "@/lib/api";
import { login as loginRequest } from "@/services/authService";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "oms.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    const raw = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (token && raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        tokenStorage.clear();
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user } = await loginRequest(username, password);
    tokenStorage.set(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
