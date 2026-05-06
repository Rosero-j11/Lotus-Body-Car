"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: (allDevices?: boolean) => void;
  updateUser: (data: Partial<User>) => void;
  deleteAccount: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lotus_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // Ignore parse errors
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("lotus_user", JSON.stringify(userData));
    setCookie("lotus_auth", userData.id, COOKIE_MAX_AGE);
    setCookie("lotus_role", userData.rol, COOKIE_MAX_AGE);
    setCookie("lotus_email", userData.email, COOKIE_MAX_AGE);
    setCookie("lotus_name", encodeURIComponent(userData.name), COOKIE_MAX_AGE);
  };

  const logout = (allDevices = false) => {
    setUser(null);
    localStorage.removeItem("lotus_user");
    if (allDevices) {
      // En producción: llamar a /api/auth/logout-all para invalidar tokens en DB
      localStorage.removeItem("lotus_sessions");
    }
    clearCookie("lotus_auth");
    clearCookie("lotus_role");
    clearCookie("lotus_email");
    clearCookie("lotus_name");
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("lotus_user", JSON.stringify(updated));
      if (data.rol) setCookie("lotus_role", data.rol, COOKIE_MAX_AGE);
      return updated;
    });
  };

  const deleteAccount = () => {
    // Soft delete: anonimiza datos y cierra sesión
    // En producción: llamar a /api/auth/delete con contraseña
    localStorage.removeItem("lotus_user");
    setUser(null);
    clearCookie("lotus_auth");
    clearCookie("lotus_role");
    clearCookie("lotus_email");
    clearCookie("lotus_name");
  };

  return (
    <UserContext.Provider
      value={{ user, login, logout, updateUser, deleteAccount, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
