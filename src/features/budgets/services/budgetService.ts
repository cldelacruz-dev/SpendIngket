import { z } from "zod";
import type { BudgetWithAllocations, BudgetUtilization } from "@/types";

// ── Validation schemas ──────────────────────────────────────────────────────

export const budgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  period_type: z.enum(["weekly", "monthly", "yearly"]),
  start_date: z.string(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

export interface AllocationRow {
  category_id: string;
  amount_limit: string;
}

// ── Business logic ──────────────────────────────────────────────────────────

/** Filters out incomplete rows and parses amounts. */
export function getValidAllocations(
  rows: AllocationRow[]
): { category_id: string; amount_limit: number }[] {
  return rows
    .filter((a) => a.category_id && parseFloat(a.amount_limit) > 0)
    .map((a) => ({ category_id: a.category_id, amount_limit: parseFloat(a.amount_limit) }));
}

/**
 * Validates budget form inputs.
 * Returns either the parsed data or a user-facing error string.
 */
export function validateBudgetForm(
  raw: { name: string; period_type: "weekly" | "monthly" | "yearly"; start_date: string },
  allocations: AllocationRow[]
):
  | { success: true; data: BudgetFormData; validAllocations: { category_id: string; amount_limit: number }[] }
  | { success: false; error: string } {
  const parsed = budgetSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const validAllocations = getValidAllocations(allocations);
  if (validAllocations.length === 0) {
    return { success: false, error: "Add at least one category allocation." };
  }

  const ids = validAllocations.map((a) => a.category_id);
  if (new Set(ids).size !== ids.length) {
    return { success: false, error: "Each category can only appear once." };
  }

  return { success: true, data: parsed.data, validAllocations };
}

// ── Computation ─────────────────────────────────────────────────────────────

export interface BudgetSummary {
  totalLimit: number;
  totalSpent: number;
  overallPct: number;
}

/**
 * Computes the overall budget utilization summary (total limit, spent, and
 * percentage) from a budget's allocations and its utilization rows.
 */
export function computeBudgetSummary(
  budget: BudgetWithAllocations,
  utilization: BudgetUtilization[]
): BudgetSummary {
  const totalLimit = budget.budget_allocations.reduce(
    (s, a) => s + Number(a.amount_limit),
    0
  );
  const totalSpent = utilization.reduce((s, u) => s + Number(u.amount_spent), 0);
  const overallPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  return { totalLimit, totalSpent, overallPct };
}
