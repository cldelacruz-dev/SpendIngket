import { z } from "zod";

// ── Constants ───────────────────────────────────────────────────────────────

export const GOAL_ICONS = [
  "🎯", "🏠", "✈️", "💻", "🚗", "📚", "💍", "🏋️", "🎓", "🌴", "💰", "🎉",
] as const;

export const GOAL_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
] as const;

// ── Validation schemas ──────────────────────────────────────────────────────

export const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  target_amount: z.number().positive("Target must be positive"),
  target_date: z.string().optional(),
  icon: z.string().default("🎯"),
  color: z.string().default("#10b981"),
});

export const contributionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().max(1000).optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;

// ── Validation helpers ──────────────────────────────────────────────────────

export function validateGoalForm(raw: {
  name: string;
  target_amount: string;
  target_date: string;
  icon: string;
  color: string;
}): { success: true; data: GoalFormData } | { success: false; error: string } {
  const result = goalSchema.safeParse({
    ...raw,
    target_amount: parseFloat(raw.target_amount),
    target_date: raw.target_date || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

export function validateContributionForm(raw: {
  amount: string;
  notes: string;
}): { success: true; data: ContributionFormData } | { success: false; error: string } {
  const result = contributionSchema.safeParse({
    amount: parseFloat(raw.amount),
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

// ── Computation ─────────────────────────────────────────────────────────────

/**
 * Computes goal progress as a percentage (0–100+).
 */
export function computeGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return (currentAmount / targetAmount) * 100;
}
