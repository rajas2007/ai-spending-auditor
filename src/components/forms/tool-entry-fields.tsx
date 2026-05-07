"use client";

import type { UseFormReturn } from "react-hook-form";

import { AI_TOOL_PRICING_BY_ID } from "@/data/pricing-data";
import { TOOL_SELECT_OPTIONS, TOOL_USE_CASE_OPTIONS } from "@/data/tool-options";
import type { AuditFormValues } from "@/types/forms";

interface ToolEntryFieldsProps {
  index: number;
  form: UseFormReturn<AuditFormValues>;
  onRemove: () => void;
}

export function ToolEntryFields({ index, form, onRemove }: ToolEntryFieldsProps) {
  const toolId = form.watch(`tools.${index}.toolId`);
  const selectedPlanName = form.watch(`tools.${index}.selectedPlanName`);
  const plans = AI_TOOL_PRICING_BY_ID[toolId]?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan.name === selectedPlanName);

  return (
    <div className="space-y-3 rounded-md border bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-700">Tool</span>
          <select className="w-full rounded border p-2" {...form.register(`tools.${index}.toolId`)}>
            {TOOL_SELECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-zinc-700">Plan</span>
          <select className="w-full rounded border p-2" {...form.register(`tools.${index}.selectedPlanName`)}>
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.name} value={plan.name}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-zinc-700">Monthly spend (USD)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded border p-2"
            placeholder="Optional override"
            {...form.register(`tools.${index}.monthlySpendUsd`, { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-zinc-700">Seats</span>
          <input
            type="number"
            min={1}
            className="w-full rounded border p-2"
            placeholder="Optional"
            {...form.register(`tools.${index}.seatCount`, { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="text-zinc-700">Primary use case</span>
          <select className="w-full rounded border p-2" {...form.register(`tools.${index}.primaryUseCase`)}>
            {TOOL_USE_CASE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedPlan ? (
        <p className="text-xs text-zinc-500">
          {selectedPlan.description}
          {selectedPlan.targetUseCase ? ` Use case: ${selectedPlan.targetUseCase}` : ""}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button type="button" onClick={onRemove} className="rounded border px-3 py-1 text-sm text-zinc-700">
          Remove tool
        </button>
      </div>
    </div>
  );
}
