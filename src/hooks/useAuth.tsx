
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface SupabaseUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUser = useCallback(async () => {
    setLoading(true);
    const { data: { user: supaUser }, error } = await supabase.auth.getUser();
    if (supaUser) {
      // Fetch user profile from Supabase 'users' table
      const { data, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supaUser.id)
        .single();
      if (data) {
        setUser({ ...data });
      } else {
        // Create user profile if not exists
        const newUser = {
          id: supaUser.id,
          email: supaUser.email || '',
          displayName: supaUser.user_metadata?.full_name || '',
          photoURL: supaUser.user_metadata?.avatar_url || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await supabase.from('users').insert([newUser]);
        setUser(newUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndSetUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchAndSetUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [fetchAndSetUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await fetchAndSetUser();
  }, [fetchAndSetUser]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    await fetchAndSetUser();
  }, [fetchAndSetUser]);

  const refetchUser = useCallback(async () => {
    await fetchAndSetUser();
  }, [fetchAndSetUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithEmail, signUpWithEmail, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
