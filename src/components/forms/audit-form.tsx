"use client";

import { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";

import { ToolEntryFields } from "@/components/forms/tool-entry-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditForm } from "@/hooks/use-audit-form";
import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";
import { runAuditEngine } from "@/lib/audit-engine";
import type { AuditUseCase } from "@/types/forms";

interface AuditFormProps {
  onResults: (result: AuditEngineResult, input: AuditEngineInput, website?: string) => void | Promise<void>;
  isBusy?: boolean;
}

export function AuditForm({ onResults, isBusy = false }: AuditFormProps) {
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
    // 1. Honeypot check
    if (values.website) {
      console.warn("[AUDIT FORM] Honeypot triggered");
      // Silently stop - legitimate users won't see this
      return;
    }

    const input = toAuditEngineInput();
    const result = runAuditEngine(input);
    void onResults(result, input, values.website);
  });

  return (
    <section className="relative min-w-0 space-y-5 rounded-2xl border border-border bg-card/60 p-5 shadow-elevated sm:p-6">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-primary">Audit</p>
        <h2 className="mt-1 break-words text-xl font-semibold">Spending audit inputs</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot field - hidden from users */}
        <div className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Team size</span>
            <Input type="number" min={1} className="h-10 bg-background/70" {...form.register("teamSize")} />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Global primary use case</span>
            <Select
              value={form.watch("primaryUseCase")}
              onValueChange={(value) => form.setValue("primaryUseCase", value as AuditUseCase)}
            >
              <SelectTrigger className="h-10 w-full bg-background/70">
                <SelectValue placeholder="Select use case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coding">Coding assistant</SelectItem>
                <SelectItem value="research">Research and analysis</SelectItem>
                <SelectItem value="content">Content and writing</SelectItem>
                <SelectItem value="support">Customer support automation</SelectItem>
                <SelectItem value="workflow">General workflow automation</SelectItem>
                <SelectItem value="api-integration">Backend API integration</SelectItem>
              </SelectContent>
            </Select>
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
            <p className="break-words text-sm text-zinc-500">Add at least one AI tool to run an audit.</p>
          )}
        </div>

        {formError ? <p className="break-words text-sm text-red-600">{formError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => addTool("chatgpt")} className="h-9">
            <Plus className="h-4 w-4" />
            Add tool
          </Button>
          <Button type="submit" className="h-9" disabled={isBusy}>
            {isBusy ? "Running audit..." : "Run audit"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
