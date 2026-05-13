"use client";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeStoredAudit } from "@/lib/audit-normalization";
import type { StoredAudit } from "@/types/stored-audit";
import type { SubscriptionTier } from "@/types/subscription";
import { FREE_AUDIT_HISTORY_LIMIT } from "@/types/subscription";

const LOCAL_AUDITS_KEY = "aethra.local.audits";

function readLocalAudits(): StoredAudit[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_AUDITS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredAudit[];
  } catch {
    window.localStorage.removeItem(LOCAL_AUDITS_KEY);
    return [];
  }
}

function writeLocalAudits(audits: StoredAudit[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AUDITS_KEY, JSON.stringify(audits));
}

function sortNewestFirst(audits: StoredAudit[]) {
  return [...audits].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function toStoredAudit(row: Record<string, unknown>): StoredAudit {
  // If the DB returned the analytics flattened on the row rather than in a result column,
  // we fallback to using the entire row as the raw result object.
  const rawResult = row.result !== undefined && row.result !== null ? row.result : row;

  const audit: StoredAudit = {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    input: row.input as StoredAudit["input"],
    result: rawResult as StoredAudit["result"],
    createdAt: String(row.created_at),
  };
  // Normalize the result to ensure consistent structure after DB round-trip
  return normalizeStoredAudit(audit);
}

export function splitAuditsByTier(audits: StoredAudit[], tier: SubscriptionTier) {
  const sorted = sortNewestFirst(audits);

  if (tier === "pro") {
    return { visibleAudits: sorted, lockedAudits: [] };
  }

  return {
    visibleAudits: sorted.slice(0, FREE_AUDIT_HISTORY_LIMIT),
    lockedAudits: sorted.slice(FREE_AUDIT_HISTORY_LIMIT),
  };
}

export async function listAuditsForUser(userId: string): Promise<StoredAudit[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("audits")
      .select("id,user_id,input,result,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => toStoredAudit(row));
  }

  return sortNewestFirst(readLocalAudits().filter((audit) => audit.userId === userId));
}

export async function getAuditForUser(userId: string, auditId: string): Promise<StoredAudit | null> {
  const supabase = getSupabaseBrowserClient();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .rpc("get_public_audit_by_id", { p_audit_id: auditId })
      .maybeSingle();

    if (error) throw new Error(error.message);
    
    // Enforce ownership if a user ID is provided
    if (data && userId && data.user_id !== userId) {
      return null;
    }
    return data ? toStoredAudit(data) : null;
  }

  return readLocalAudits().find((audit) => audit.userId === userId && audit.id === auditId) ?? null;
}

export async function saveAudit(audit: Omit<StoredAudit, "id" | "createdAt" | "userId"> & { userId?: string }): Promise<StoredAudit> {
  const supabase = getSupabaseBrowserClient();
  const createdAt = new Date().toISOString();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("audits")
      .insert({
        user_id: audit.userId,
        input: audit.input,
        result: audit.result,
      })
      .select("id,user_id,input,result,created_at")
      .single();

    if (error) throw new Error(error.message);
    return toStoredAudit(data);
  }

  const storedAudit: StoredAudit = {
    ...audit,
    id: crypto.randomUUID(),
    createdAt,
  };
  writeLocalAudits(sortNewestFirst([storedAudit, ...readLocalAudits()]));
  return storedAudit;
}
