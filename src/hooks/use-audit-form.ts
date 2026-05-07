import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import type { AuditEngineInput } from "@/lib/audit-engine";
import { auditFormSchema, createDefaultAuditFormValues, createDefaultToolEntry } from "@/lib/validation";
import type { AuditFormValues, AuditToolFormEntry } from "@/types/forms";
import type { AIToolId } from "@/types/pricing";

export function toAuditEngineInput(values: AuditFormValues): AuditEngineInput {
  return {
    teamSize: values.teamSize,
    primaryUseCase: values.primaryUseCase,
    tools: values.tools
      .filter((tool) => tool.isSelected)
      .map((tool) => ({
        toolId: tool.toolId,
        selectedPlanName: tool.selectedPlanName,
        monthlySpendUsd: tool.monthlySpendUsd,
        seats: tool.seatCount,
        primaryUseCase: tool.primaryUseCase,
      })),
  };
}

interface UseAuditFormOptions {
  initialValues?: Partial<AuditFormValues>;
}

export function useAuditForm(options?: UseAuditFormOptions) {
  const defaultValues = useMemo(
    () => ({
      ...createDefaultAuditFormValues(),
      ...options?.initialValues,
    }),
    [options?.initialValues],
  );

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const toolsFieldArray = useFieldArray({
    control: form.control,
    name: "tools",
    keyName: "fieldId",
  });

  function addTool(toolId: AIToolId) {
    toolsFieldArray.append({ ...createDefaultToolEntry(toolId), isSelected: true });
  }

  function updateTool(index: number, patch: Partial<AuditToolFormEntry>) {
    const current = form.getValues(`tools.${index}`);
    toolsFieldArray.update(index, { ...current, ...patch });
  }

  function removeTool(index: number) {
    toolsFieldArray.remove(index);
  }

  return {
    form,
    toolsFieldArray,
    addTool,
    updateTool,
    removeTool,
    toAuditEngineInput: (values?: AuditFormValues) =>
      toAuditEngineInput(values ?? form.getValues()),
  };
}
