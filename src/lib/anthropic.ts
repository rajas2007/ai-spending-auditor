import Anthropic from "@anthropic-ai/sdk";

import {
  buildAuditSummaryPrompt,
  buildDeterministicAuditSummary,
  type AuditSummaryPayload,
  type AuditSummaryResult,
} from "@/lib/audit-summary";

const ANTHROPIC_MODEL = "claude-3-haiku-20240307";
const SUMMARY_TIMEOUT_MS = 10000;

function extractTextContent(message: Anthropic.Messages.Message) {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSummary(summary: string) {
  return summary.replace(/^["']|["']$/g, "").trim();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Anthropic summary request timed out.")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function generatePersonalizedAuditSummary(
  payload: AuditSummaryPayload,
): Promise<AuditSummaryResult> {
  const fallback = buildDeterministicAuditSummary(payload);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { summary: fallback, source: "fallback" };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await withTimeout(
      anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 180,
        temperature: 0.2,
        system:
          "You are a finance-focused SaaS spend analyst. You write only grounded summaries from provided audit data and never invent calculations or claims.",
        messages: [
          {
            role: "user",
            content: buildAuditSummaryPrompt(payload),
          },
        ],
      }),
      SUMMARY_TIMEOUT_MS,
    );
    const summary = cleanSummary(extractTextContent(response));

    if (!summary) {
      return { summary: fallback, source: "fallback" };
    }

    return { summary, source: "ai" };
  } catch {
    return { summary: fallback, source: "fallback" };
  }
}
