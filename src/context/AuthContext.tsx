import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { userStorage } from "@/lib/api";
import { login as loginRequest, logout as logoutRequest } from "@/services/authService";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaura dados de display do usuário do localStorage.
    // O cookie httpOnly (token) é enviado automaticamente pelo browser —
    // se expirar, o interceptor de 401 limpa o estado e redireciona para /login.
    const stored = userStorage.get();
    if (stored) {
      setUser(stored as User);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await loginRequest(email, password);
    userStorage.set(user);
    setUser(user);
  };

  const logout = () => {
    // Limpa estado local imediatamente e sinaliza ao backend para expirar o cookie
    userStorage.clear();
    setUser(null);
    logoutRequest().catch(() => {});
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
