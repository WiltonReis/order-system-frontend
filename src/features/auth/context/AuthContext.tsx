import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userStorage } from "@/lib/api";
import { login as loginRequest, logout as logoutRequest } from "../api/authService";
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
  const queryClient = useQueryClient();
  const sessionExpiredRef = useRef(false);

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

  useEffect(() => {
    const handler = () => {
      // useRef evita double-fire em React StrictMode
      if (sessionExpiredRef.current) return;
      sessionExpiredRef.current = true;
      userStorage.clear();
      setUser(null);
      queryClient.clear();
      toast.error("Sessão expirada", {
        description: "Faça login novamente para continuar.",
      });
    };
    window.addEventListener("oms:auth-expired", handler);
    return () => window.removeEventListener("oms:auth-expired", handler);
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    sessionExpiredRef.current = false;
    const { user } = await loginRequest(email, password);
    userStorage.set(user);
    setUser(user);
  };

  const logout = () => {
    // Limpa estado local imediatamente e sinaliza ao backend para expirar o cookie
    userStorage.clear();
    setUser(null);
    queryClient.clear();
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
