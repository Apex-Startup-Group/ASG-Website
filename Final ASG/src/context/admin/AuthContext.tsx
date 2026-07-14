"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  isLoggedIn: boolean;
  adminEmail: string;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setAdminEmail(session?.user?.email || "");
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setAdminEmail(session?.user?.email || "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, adminEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

