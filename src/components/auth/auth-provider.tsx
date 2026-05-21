"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  clearSupabaseLocalSession,
  getCurrentSession,
  getOrCreateProfile,
  isRecoverableAuthSessionError,
  signOut as signOutUser,
} from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { UserProfile } from "@/types/subscription";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ANONYMOUS_AUTH_STATE: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isInitialized: false,
  });
  const syncIdRef = useRef(0);

  const applyAuthState = useCallback((nextState: Partial<AuthState>, syncId: number) => {
    if (syncId !== syncIdRef.current) return;
    setState((current) => ({ ...current, ...nextState }));
  }, []);

  const recoverAnonymousSession = useCallback(async () => {
    syncIdRef.current += 1;
    await clearSupabaseLocalSession();
    setState(ANONYMOUS_AUTH_STATE);
  }, []);

  const refreshSession = useCallback(async () => {
    const syncId = syncIdRef.current + 1;
    syncIdRef.current = syncId;
    setState((current) => ({ ...current, isLoading: true }));

    try {
      const current = await getCurrentSession();
      applyAuthState(
        {
          session: current.session,
          user: current.user,
          profile: current.profile,
          isLoading: false,
          isInitialized: true,
        },
        syncId,
      );
    } catch (error) {
      if (isRecoverableAuthSessionError(error)) {
        await clearSupabaseLocalSession();
      }

      applyAuthState(
        ANONYMOUS_AUTH_STATE,
        syncId,
      );
    }
  }, [applyAuthState]);

  const hydrateFromSession = useCallback(
    async (session: Session | null) => {
      const syncId = syncIdRef.current + 1;
      syncIdRef.current = syncId;
      const nextUser = session?.user ?? null;

      setState((current) => {
        const isSameInitializedUser = Boolean(current.isInitialized && current.user?.id && current.user.id === nextUser?.id);

        return {
          ...current,
          session,
          user: nextUser,
          profile: isSameInitializedUser ? current.profile : null,
          isLoading: !isSameInitializedUser,
        };
      });

      let nextProfile: UserProfile | null = null;
      try {
        nextProfile = nextUser ? await getOrCreateProfile(nextUser) : null;
      } catch {
        nextProfile = null;
      }

      applyAuthState(
        {
          session,
          user: nextUser,
          profile: nextProfile,
          isLoading: false,
          isInitialized: true,
        },
        syncId,
      );
    },
    [applyAuthState],
  );

  useEffect(() => {
    let mounted = true;

    const supabase = getSupabaseBrowserClient();
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      void hydrateFromSession(session);
    });

    queueMicrotask(() => {
      if (mounted) void refreshSession();
    });

    return () => {
      mounted = false;
      syncIdRef.current += 1;
      subscription?.data.subscription.unsubscribe();
    };
  }, [hydrateFromSession, refreshSession]);

  useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (!isRecoverableAuthSessionError(event.reason)) return;
      event.preventDefault();
      void recoverAnonymousSession();
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [recoverAnonymousSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      user: state.user,
      profile: state.profile,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      isAuthenticated: Boolean(state.user),
      refreshSession,
      signOut: async () => {
        syncIdRef.current += 1;
        setState(ANONYMOUS_AUTH_STATE);
        await signOutUser();
      },
    }),
    [refreshSession, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
