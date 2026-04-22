import { z } from "zod";

// ── Validation schemas ──────────────────────────────────────────────────────

export const transactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(255),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["expense", "income"]),
  category_id: z.string().uuid("Select a category"),
  transaction_date: z.string(),
  notes: z.string().max(1000).optional(),
});

export const recurringIncomeSchema = z.object({
  cutoffDay: z.union([z.number().int().min(1).max(31), z.literal("end")]),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ── Business logic ──────────────────────────────────────────────────────────

/** Returns the ordinal suffix for a day number (1→"st", 2→"nd", 3→"rd", etc.) */
export function daySuffix(day: number): string {
  if (day === 1 || day === 21 || day === 31) return "st";
  if (day === 2 || day === 22) return "nd";
  if (day === 3 || day === 23) return "rd";
  return "th";
}

/**
 * Given a transaction date and a cutoff day, computes the ISO date string
 * for the recurring income start date within the same month.
 */
export function computeRecurringStartDate(
  txDate: string,
  day: number | "end"
): string {
  const d = new Date(txDate);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  if (day === "end") {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Validates raw form inputs and returns a parsed result. */
export function validateTransactionForm(raw: {
  description: string;
  amount: string;
  type: "expense" | "income";
  category_id: string;
  transaction_date: string;
  notes: string;
}): { success: true; data: TransactionFormData } | { success: false; error: string } {
  const result = transactionSchema.safeParse({
    ...raw,
    amount: parseFloat(raw.amount),
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

/** The preset cutoff days shown in the recurring income picker. */
export const CUTOFF_DAY_OPTIONS = [1, 5, 10, 15, 20, 25, "end"] as const;
export type CutoffDay = (typeof CUTOFF_DAY_OPTIONS)[number];
