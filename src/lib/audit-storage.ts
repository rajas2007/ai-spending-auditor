"use client";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeStoredAudit } from "@/lib/audit-normalization";
import { clearSupabaseLocalSession, isRecoverableAuthSessionError } from "@/lib/auth";
import { PRICING_VERSION, getPricingSnapshot } from "@/config/pricing";
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
  const resultObject = rawResult && typeof rawResult === "object" ? rawResult as Record<string, unknown> : {};

  const audit: StoredAudit = {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    input: row.input as StoredAudit["input"],
    result: rawResult as StoredAudit["result"],
    pricingVersionUsed: typeof row.pricing_version_used === "string"
      ? row.pricing_version_used
      : typeof resultObject.pricingVersionUsed === "string"
        ? resultObject.pricingVersionUsed
        : undefined,
    pricingSnapshotUsed: row.pricing_snapshot_used
      ? row.pricing_snapshot_used as StoredAudit["pricingSnapshotUsed"]
      : resultObject.pricingSnapshotUsed as StoredAudit["pricingSnapshotUsed"],
    createdAt: String(row.created_at),
  };
  // Normalize the result to ensure consistent structure after DB round-trip
  return normalizeStoredAudit(audit);
}

async function getCurrentSupabaseAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (isRecoverableAuthSessionError(error)) {
        await clearSupabaseLocalSession();
      }
      return null;
    }

    return data.session?.access_token ?? null;
  } catch (error) {
    if (isRecoverableAuthSessionError(error)) {
      await clearSupabaseLocalSession();
      return null;
    }

    throw error;
  }
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
      .select("id,user_id,input,result,pricing_version_used,pricing_snapshot_used,created_at")
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
    if (data && userId && (data as { user_id: string }).user_id !== userId) {
      return null;
    }
    return data ? toStoredAudit(data as Record<string, unknown>) : null;
  }

  return readLocalAudits().find((audit) => audit.userId === userId && audit.id === auditId) ?? null;
}

export async function saveAudit(
  audit: Omit<StoredAudit, "id" | "createdAt" | "userId"> & { userId?: string; website?: string }
): Promise<StoredAudit> {
  const supabase = getSupabaseBrowserClient();
  const createdAt = new Date().toISOString();

  if (supabase && isSupabaseConfigured()) {
    const accessToken = await getCurrentSupabaseAccessToken();
    const response = await fetch("/api/audits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        input: audit.input,
        result: audit.result,
        pricingVersionUsed: audit.pricingVersionUsed ?? audit.result.pricingVersionUsed ?? PRICING_VERSION,
        pricingSnapshotUsed: audit.pricingSnapshotUsed ?? audit.result.pricingSnapshotUsed ?? getPricingSnapshot(),
      }),
    });

    const payload = (await response.json()) as {
      audit?: Record<string, unknown>;
      error?: string;
    };

    if (!response.ok || !payload.audit) {
      throw new Error(payload.error || "Audit could not be saved.");
    }

    return toStoredAudit(payload.audit);
  }

  const storedAudit: StoredAudit = {
    ...audit,
    pricingVersionUsed: audit.pricingVersionUsed ?? audit.result.pricingVersionUsed ?? PRICING_VERSION,
    pricingSnapshotUsed: audit.pricingSnapshotUsed ?? audit.result.pricingSnapshotUsed ?? getPricingSnapshot(),
    id: crypto.randomUUID(),
    createdAt,
  };
  writeLocalAudits(sortNewestFirst([storedAudit, ...readLocalAudits()]));
  return storedAudit;
}
