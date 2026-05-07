"use client";

import { useMemo } from "react";

import { ToolEntryFields } from "@/components/forms/tool-entry-fields";
import { useAuditForm } from "@/hooks/use-audit-form";
import type { AuditEngineResult } from "@/lib/audit-engine";
import { runAuditEngine } from "@/lib/audit-engine";

interface AuditFormProps {
  onResults: (result: AuditEngineResult) => void;
}

export function AuditForm({ onResults }: AuditFormProps) {
  const { form, toolsFieldArray, addTool, removeTool, toAuditEngineInput } = useAuditForm({
    // Start with one row for simpler MVP interaction.
    initialValues: {
      tools: [
        {
          toolId: "chatgpt",
          isSelected: true,
          selectedPlanName: "Plus",
          monthlySpendUsd: undefined,
          seatCount: 1,
          primaryUseCase: "coding",
        },
      ],
    },
  });

  const hasTools = toolsFieldArray.fields.length > 0;

  const formError = useMemo(
    () => form.formState.errors.tools?.message?.toString(),
    [form.formState.errors.tools],
  );

  const onSubmit = form.handleSubmit((values) => {
    const input = toAuditEngineInput(values);
    const result = runAuditEngine(input);
    onResults(result);
  });

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Spending Audit Inputs</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-zinc-700">Team size</span>
            <input type="number" min={1} className="w-full rounded border p-2" {...form.register("teamSize")} />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-zinc-700">Global primary use case</span>
            <select className="w-full rounded border p-2" {...form.register("primaryUseCase")}>
              <option value="coding">Coding assistant</option>
              <option value="research">Research and analysis</option>
              <option value="content">Content and writing</option>
              <option value="support">Customer support automation</option>
              <option value="workflow">General workflow automation</option>
              <option value="api-integration">Backend API integration</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {hasTools ? (
            toolsFieldArray.fields.map((field, index) => (
              <ToolEntryFields
                key={field.fieldId}
                index={index}
                form={form}
                onRemove={() => removeTool(index)}
              />
            ))
          ) : (
            <p className="text-sm text-zinc-500">Add at least one AI tool to run an audit.</p>
          )}
        </div>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addTool("chatgpt")}
            className="rounded border px-3 py-2 text-sm text-zinc-700"
          >
            Add tool
          </button>
          <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
            Run audit
          </button>
        </div>
      </form>
    </section>
  );
}
