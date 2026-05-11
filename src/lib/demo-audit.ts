import { runAuditEngine, type AuditEngineResult } from "@/lib/audit-engine";

export function createDemoAuditResult(): AuditEngineResult {
  return runAuditEngine({
    teamSize: 18,
    primaryUseCase: "coding",
    tools: [
      {
        toolId: "chatgpt",
        selectedPlanName: "Team",
        seats: 18,
        primaryUseCase: "workflow",
      },
      {
        toolId: "cursor",
        selectedPlanName: "Pro",
        seats: 12,
        primaryUseCase: "coding",
      },
      {
        toolId: "github-copilot",
        selectedPlanName: "Business",
        seats: 10,
        primaryUseCase: "coding",
      },
      {
        toolId: "openai-api",
        selectedPlanName: "Pay-as-you-go",
        monthlySpendUsd: 620,
        seats: 1,
        primaryUseCase: "api-integration",
      },
      {
        toolId: "claude",
        selectedPlanName: "Team",
        seats: 2,
        primaryUseCase: "research",
      },
    ],
  });
}
