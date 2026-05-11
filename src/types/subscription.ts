export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  company?: string;
  teamSize?: number;
  monthlyAiSpendUsd?: number;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export const FREE_AUDIT_HISTORY_LIMIT = 5;
