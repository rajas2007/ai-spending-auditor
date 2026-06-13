import { describe, expect, it } from "vitest";

import { PRICING_VERSION } from "@/config/pricing";
import { buildDeterministicAuditSummary } from "@/lib/audit-summary";
import { evaluateToolSpend, runAuditEngine } from "@/lib/audit-engine";

describe("audit-engine", () => {
  it("calculates total monthly and annual spend from selected plans", () => {
    const result = runAuditEngine({
      teamSize: 3,
      primaryUseCase: "coding",
      tools: [
        { toolId: "cursor", selectedPlanName: "Pro", seats: 3, primaryUseCase: "coding" },
        { toolId: "chatgpt", selectedPlanName: "Plus", primaryUseCase: "research" },
      ],
    });

    // Cursor Pro (20 * 3 seats) + ChatGPT Plus (20) = 80
    expect(result.totalMonthlySpendUsd).toBe(80);
    expect(result.totalAnnualSpendUsd).toBe(960);
  });

  it("attaches the pricing version and snapshot used for the audit", () => {
    const result = runAuditEngine({
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [{ toolId: "cursor", selectedPlanName: "Pro", seats: 1, primaryUseCase: "coding" }],
    });

    expect(result.pricingVersionUsed).toBe(PRICING_VERSION);
    expect(result.pricingSnapshotUsed?.version).toBe(PRICING_VERSION);
    expect(result.pricingSnapshotUsed?.tools.some((tool) => tool.toolId === "cursor")).toBe(true);
  });

  it("detects downgrade opportunity for team/business plans with very low seats", () => {
    const result = runAuditEngine({
      teamSize: 2,
      primaryUseCase: "coding",
      tools: [{ toolId: "claude", selectedPlanName: "Team", seats: 2, primaryUseCase: "coding" }],
    });

    const recommendation = result.recommendations.find(
      (item) => item.title === "Team plan may be overkill for very small usage",
    );

    expect(recommendation).toBeDefined();
    expect(recommendation?.type).toBe("switch-plan");
    expect(recommendation?.currentSituation).toContain("2 seat");
    expect(recommendation?.estimatedMonthlySavingsUsd).toBe(21);
  });

  it("detects duplicate coding assistant overlap", () => {
    const result = runAuditEngine({
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [
        { toolId: "cursor", selectedPlanName: "Pro", seats: 1, primaryUseCase: "coding" },
        { toolId: "github-copilot", selectedPlanName: "Individual", seats: 1, primaryUseCase: "coding" },
      ],
    });

    const overlapRecommendation = result.recommendations.find(
      (item) => item.title === "Multiple coding assistants may overlap",
    );

    expect(overlapRecommendation).toBeDefined();
    expect(overlapRecommendation?.type).toBe("consolidate-tools");
    expect(overlapRecommendation?.estimatedMonthlySavingsUsd).toBe(3);
  });

  it("returns honest optimized feedback when no cost rules are triggered", () => {
    const result = runAuditEngine({
      teamSize: 1,
      primaryUseCase: "research",
      tools: [{ toolId: "chatgpt", selectedPlanName: "Plus", primaryUseCase: "research" }],
    });

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]?.title).toBe("Current setup already looks cost-efficient");
    expect(result.recommendations[0]?.estimatedMonthlySavingsUsd).toBe(0);
  });

  it("sums recommendation savings into monthly and annual totals", () => {
    const result = runAuditEngine({
      teamSize: 2,
      primaryUseCase: "workflow",
      tools: [
        {
          toolId: "gemini",
          selectedPlanName: "Business Standard (Workspace add-on)",
          seats: 2,
          primaryUseCase: "workflow",
        },
        { toolId: "openai-api", selectedPlanName: "Pay-as-you-go", monthlySpendUsd: 220, primaryUseCase: "api-integration" },
      ],
    });

    // Expected recommendations in current deterministic rule set:
    // - Team/business overkill (Gemini): 40 * 0.35 = 14
    // - High per-seat low seat (OpenAI API spend interpreted as 2 seats): 220 * 0.2 = 44
    // - High API retail spend: 220 * 0.1 = 22
    expect(result.estimatedMonthlySavingsUsd).toBe(80);
    expect(result.estimatedAnnualSavingsUsd).toBe(960);
  });

  it("supports explicit monthly spend override for usage-based plans", () => {
    const breakdown = evaluateToolSpend({
      teamSize: 5,
      primaryUseCase: "api-integration",
      tools: [
        {
          toolId: "openai-api",
          selectedPlanName: "Pay-as-you-go",
          monthlySpendUsd: 150.75,
          primaryUseCase: "api-integration",
        },
      ],
    });

    expect(breakdown[0]?.computedMonthlyCostUsd).toBe(150.75);
  });

  it("falls back to provided spend when selected plan is unknown", () => {
    const result = runAuditEngine({
      teamSize: 4,
      primaryUseCase: "workflow",
      tools: [
        {
          toolId: "gemini",
          selectedPlanName: "Legacy Experimental Plan",
          monthlySpendUsd: 42,
          primaryUseCase: "workflow",
        },
      ],
    });

    expect(result.totalMonthlySpendUsd).toBe(42);
    expect(result.totalAnnualSpendUsd).toBe(504);
  });

  it("builds a deterministic fallback summary from calculated audit outputs", () => {
    const input = {
      teamSize: 2,
      primaryUseCase: "coding" as const,
      tools: [{ toolId: "claude" as const, selectedPlanName: "Team", seats: 2, primaryUseCase: "coding" as const }],
    };
    const result = runAuditEngine(input);
    const summary = buildDeterministicAuditSummary({ input, result });

    expect(summary).toContain("$60.00 per month");
    expect(summary).toContain(`$${result.estimatedMonthlySavingsUsd.toFixed(2)} in monthly savings`);
    expect(summary).toContain("Team plan may be overkill");
    expect(summary).toContain(`optimization score of ${result.optimizationScore}`);
  });
});
