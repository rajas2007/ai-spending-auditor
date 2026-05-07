"use client";

import { Trash2 } from "lucide-react";

import { AI_TOOL_PRICING_BY_ID } from "@/data/pricing-data";
import { TOOL_SELECT_OPTIONS, TOOL_USE_CASE_OPTIONS } from "@/data/tool-options";
import type { UseAuditFormReturn } from "@/hooks/use-audit-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditFormValues } from "@/types/forms";

interface ToolEntryFieldsProps {
  index: number;
  form: UseAuditFormReturn["form"];
  onRemove: () => void;
}

export function ToolEntryFields({ index, form, onRemove }: ToolEntryFieldsProps) {
  const toolId = form.watch(`tools.${index}.toolId`);
  const selectedPlanName = form.watch(`tools.${index}.selectedPlanName`);
  const plans = AI_TOOL_PRICING_BY_ID[toolId]?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan.name === selectedPlanName);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Tool</span>
          <Select
            value={form.watch(`tools.${index}.toolId`)}
            onValueChange={(value) =>
              form.setValue(`tools.${index}.toolId`, value as AuditFormValues["tools"][number]["toolId"])
            }
          >
            <SelectTrigger className="h-10 w-full bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOOL_SELECT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Plan</span>
          <Select
            value={form.watch(`tools.${index}.selectedPlanName`) || undefined}
            onValueChange={(value) => form.setValue(`tools.${index}.selectedPlanName`, value)}
          >
            <SelectTrigger className="h-10 w-full bg-background/60">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.name} value={plan.name}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Monthly spend (USD)</span>
          <Input
            type="number"
            min={0}
            step="0.01"
            className="h-10 bg-background/60"
            placeholder="Optional override"
            {...form.register(`tools.${index}.monthlySpendUsd`, { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Seats</span>
          <Input
            type="number"
            min={1}
            className="h-10 bg-background/60"
            placeholder="Optional"
            {...form.register(`tools.${index}.seatCount`, { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="text-muted-foreground">Primary use case</span>
          <Select
            value={form.watch(`tools.${index}.primaryUseCase`)}
            onValueChange={(value) =>
              form.setValue(
                `tools.${index}.primaryUseCase`,
                value as AuditFormValues["tools"][number]["primaryUseCase"],
              )
            }
          >
            <SelectTrigger className="h-10 w-full bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOOL_USE_CASE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {selectedPlan ? (
        <p className="text-xs text-muted-foreground">
          {selectedPlan.description}
          {selectedPlan.targetUseCase ? ` Use case: ${selectedPlan.targetUseCase}` : ""}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" onClick={onRemove} variant="ghost" size="sm" className="text-muted-foreground">
          <Trash2 className="h-4 w-4" />
          Remove tool
        </Button>
      </div>
    </div>
  );
}
