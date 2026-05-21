"use client";

import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { UserProfile } from "@/types/subscription";

const LOCAL_AUTH_KEY = "aethra.local.auth";

interface LocalAuthState {
  user: User;
  profile: UserProfile;
}

function nowIso() {
  return new Date().toISOString();
}

function createLocalUser(email: string): User {
  return {
    id: `local-${email.toLowerCase()}`,
    aud: "authenticated",
    role: "authenticated",
    email,
    app_metadata: {},
    user_metadata: {},
    created_at: nowIso(),
  };
}

function readLocalAuth(): LocalAuthState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LocalAuthState;
  } catch {
    window.localStorage.removeItem(LOCAL_AUTH_KEY);
    return null;
  }
}

function writeLocalAuth(state: LocalAuthState | null) {
  if (typeof window === "undefined") return;
  if (!state) {
    window.localStorage.removeItem(LOCAL_AUTH_KEY);
    return;
  }
  window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(state));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return String(error ?? "");
}

export function isRecoverableAuthSessionError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("refresh token") ||
    message.includes("invalid session") ||
    message.includes("session not found") ||
    message.includes("jwt expired")
  );
}

function clearStoredSupabaseAuthTokens() {
  if (typeof window === "undefined") return;
  const storageBuckets = [window.localStorage, window.sessionStorage];

  for (const storage of storageBuckets) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        storage.removeItem(key);
      }
    }
  }
}

export async function clearSupabaseLocalSession() {
  clearStoredSupabaseAuthTokens();
  writeLocalAuth(null);

  const supabase = getSupabaseBrowserClient();

  try {
    await supabase?.auth.signOut({ scope: "local" });
  } catch {
    // The local session may already be invalid or partially cleared.
  } finally {
    clearStoredSupabaseAuthTokens();
  }
}

export function getLocalAuthState() {
  return readLocalAuth();
}

export async function getCurrentSession(): Promise<{ session: Session | null; user: User | null; profile: UserProfile | null }> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (isRecoverableAuthSessionError(error)) {
          await clearSupabaseLocalSession();
        }

        return { session: null, user: null, profile: null };
      }

      const user = data.session?.user ?? null;
      return {
        session: data.session,
        user,
        profile: user ? await getOrCreateProfile(user) : null,
      };
    } catch (error) {
      if (isRecoverableAuthSessionError(error)) {
        await clearSupabaseLocalSession();
        return { session: null, user: null, profile: null };
      }

      throw error;
    }
  }

  const local = readLocalAuth();
  return { session: null, user: local?.user ?? null, profile: local?.profile ?? null };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const user = data.user;
    return { user, profile: user ? await getOrCreateProfile(user) : null };
  }

  const user = createLocalUser(email);
  const profile = await getOrCreateProfile(user);
  writeLocalAuth({ user, profile });
  return { user, profile };
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName?: string;
  company?: string;
  teamSize?: number;
  monthlyAiSpendUsd?: number;
}) {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          company: input.company,
          team_size: input.teamSize,
          monthly_ai_spend_usd: input.monthlyAiSpendUsd,
        },
      },
    });
    if (error) throw new Error(error.message);
    const user = data.user;
    return { user, profile: user ? await getOrCreateProfile(user, input) : null };
  }

  const user = createLocalUser(input.email);
  const profile = await getOrCreateProfile(user, input);
  writeLocalAuth({ user, profile });
  return { user, profile };
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (isRecoverableAuthSessionError(error)) {
        await clearSupabaseLocalSession();
      } else {
        throw new Error(error.message);
      }
    }
  }
  writeLocalAuth(null);
}

export async function getOrCreateProfile(
  user: User,
  input?: Partial<Omit<UserProfile, "id" | "email" | "subscriptionTier" | "createdAt">>,
): Promise<UserProfile> {
  const supabase = getSupabaseBrowserClient();

  if (supabase && isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id,email,full_name,company,team_size,monthly_ai_spend_usd,subscription_tier,created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        email: existing.email,
        fullName: existing.full_name ?? undefined,
        company: existing.company ?? undefined,
        teamSize: existing.team_size ?? undefined,
        monthlyAiSpendUsd: existing.monthly_ai_spend_usd ?? undefined,
        subscriptionTier: existing.subscription_tier ?? "free",
        createdAt: existing.created_at,
      };
    }

    const profileRow = {
      id: user.id,
      email: user.email ?? "",
      full_name: input?.fullName ?? user.user_metadata?.full_name ?? null,
      company: input?.company ?? user.user_metadata?.company ?? null,
      team_size: input?.teamSize ?? user.user_metadata?.team_size ?? null,
      monthly_ai_spend_usd: input?.monthlyAiSpendUsd ?? user.user_metadata?.monthly_ai_spend_usd ?? null,
      subscription_tier: "free",
    };

    const { data: created, error } = await supabase
      .from("profiles")
      .upsert(profileRow, { onConflict: "id" })
      .select("id,email,full_name,company,team_size,monthly_ai_spend_usd,subscription_tier,created_at")
      .single();

    if (!error && created) {
      return {
        id: created.id,
        email: created.email,
        fullName: created.full_name ?? undefined,
        company: created.company ?? undefined,
        teamSize: created.team_size ?? undefined,
        monthlyAiSpendUsd: created.monthly_ai_spend_usd ?? undefined,
        subscriptionTier: created.subscription_tier ?? "free",
        createdAt: created.created_at,
      };
    }
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: input?.fullName,
    company: input?.company,
    teamSize: input?.teamSize,
    monthlyAiSpendUsd: input?.monthlyAiSpendUsd,
    subscriptionTier: "free",
    createdAt: user.created_at ?? nowIso(),
  };
}
