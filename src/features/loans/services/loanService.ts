import { z } from "zod";
import type { LoanStatus } from "@/types";

// ── Constants ───────────────────────────────────────────────────────────────

export const LOAN_STATUS_CONFIG: Record<
  LoanStatus,
  { label: string; color: string; bgColor: string }
> = {
  active:  { label: "Active",  color: "#f59e0b", bgColor: "#fef3c7" },
  paid:    { label: "Paid",    color: "#10b981", bgColor: "#d1fae5" },
  overdue: { label: "Overdue", color: "#ef4444", bgColor: "#fee2e2" },
};

// ── Validation schemas ──────────────────────────────────────────────────────

export const loanSchema = z.object({
  name:           z.string().min(1, "Loan name is required").max(100),
  lender:         z.string().min(1, "Lender is required").max(100),
  principal:      z.number().positive("Principal amount must be positive"),
  interest_rate:  z.number().min(0).max(100).optional(),
  start_date:     z.string(),
  due_date:       z.string().optional(),
  wallet_id:      z.string().uuid("Invalid wallet selected").optional(),
  notes:          z.string().max(1000).optional(),
});

export const loanUpdateSchema = z.object({
  name:          z.string().min(1, "Loan name is required").max(100),
  lender:        z.string().min(1, "Lender is required").max(100),
  interest_rate: z.number().min(0).max(100).optional(),
  due_date:      z.string().optional(),
  status:        z.enum(["active", "paid", "overdue"]),
  notes:         z.string().max(1000).optional(),
});

export const repaymentSchema = z.object({
  amount:       z.number().positive("Amount must be positive"),
  payment_date: z.string(),
  wallet_id:    z.string().uuid("Select a wallet"),
  notes:        z.string().max(1000).optional(),
});

export type LoanFormData = z.infer<typeof loanSchema>;
export type LoanUpdateData = z.infer<typeof loanUpdateSchema>;
export type RepaymentFormData = z.infer<typeof repaymentSchema>;

// ── Validation helpers ──────────────────────────────────────────────────────

export function validateLoanForm(raw: {
  name: string;
  lender: string;
  principal: string;
  interest_rate: string;
  start_date: string;
  due_date: string;
  wallet_id: string;
  notes: string;
}): { success: true; data: LoanFormData } | { success: false; error: string } {
  const result = loanSchema.safeParse({
    ...raw,
    principal: parseFloat(raw.principal),
    interest_rate: raw.interest_rate ? parseFloat(raw.interest_rate) : undefined,
    due_date: raw.due_date || undefined,
    wallet_id: raw.wallet_id || undefined,
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

export function validateLoanUpdateForm(raw: {
  name: string;
  lender: string;
  interest_rate: string;
  due_date: string;
  status: string;
  notes: string;
}): { success: true; data: LoanUpdateData } | { success: false; error: string } {
  const result = loanUpdateSchema.safeParse({
    ...raw,
    interest_rate: raw.interest_rate ? parseFloat(raw.interest_rate) : undefined,
    due_date: raw.due_date || undefined,
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

export function validateRepaymentForm(raw: {
  amount: string;
  payment_date: string;
  wallet_id: string;
  notes: string;
}): { success: true; data: RepaymentFormData } | { success: false; error: string } {
  const result = repaymentSchema.safeParse({
    ...raw,
    amount: parseFloat(raw.amount),
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Computes repayment progress as a 0–100 percentage.
 * (principal - remaining) / principal × 100
 */
export function computeRepaymentProgress(principal: number, remaining: number): number {
  if (principal <= 0) return 0;
  const paid = principal - remaining;
  return Math.min(100, Math.max(0, (paid / principal) * 100));
}
