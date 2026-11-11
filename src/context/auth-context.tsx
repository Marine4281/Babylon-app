// src/context/auth-context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import API, { setUnauthorizedHandler } from "@/api/axios";

export type User = {
  _id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  country?: string;
  role: string;
  wallet?: { balance: number; earnedToday: number; totalWithdrawn: number };
};

type Session = { token: string; user: User };

export type LoginForm = { identifier: string; password: string };

export type RegisterForm = {
  fullName: string;
  email?: string;
  phone?: string;
  phoneCountry?: string;
  gender?: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (form: LoginForm) => Promise<void>;
  register: (form: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [token, saved] = await Promise.all([
          SecureStore.getItemAsync("token"),
          SecureStore.getItemAsync("user"),
        ]);
        if (token && saved) setUser(JSON.parse(saved));
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const saveSession = async ({ token, user }: Session) => {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (form: LoginForm) => {
    const { data } = await API.post<Session>("/auth/login", form);
    await saveSession(data);
  };

  const register = async (form: RegisterForm) => {
    const { data } = await API.post<Session>("/auth/register", form);
    await saveSession(data);
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
