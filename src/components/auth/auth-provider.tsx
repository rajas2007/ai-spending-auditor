"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getCurrentSession, getOrCreateProfile, signOut as signOutUser } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { UserProfile } from "@/types/subscription";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    const current = await getCurrentSession();
    setUser(current.user);
    setProfile(current.profile);
  }

  useEffect(() => {
    let mounted = true;

    getCurrentSession()
      .then((current) => {
        if (!mounted) return;
        setUser(current.user);
        setProfile(current.profile);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const supabase = getSupabaseBrowserClient();
    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setProfile(nextUser ? await getOrCreateProfile(nextUser) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshSession,
      signOut: async () => {
        await signOutUser();
        setUser(null);
        setProfile(null);
      },
    }),
    [isLoading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
