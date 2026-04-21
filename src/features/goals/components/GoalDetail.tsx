"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAddContributionMutation } from "@/features/goals/api/goalsApi";
import type { SavingsGoal, GoalContribution } from "@/types";
import { formatCurrency, formatDate, formatPercent, getProgressBarColor, cn } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const contributionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().max(1000).optional(),
});

interface GoalDetailProps {
  goal: SavingsGoal;
  contributions: GoalContribution[];
  currentAmount: number;
  userId: string;
}

export default function GoalDetail({
  goal,
  contributions,
  currentAmount,
  userId,
}: GoalDetailProps) {
  const router = useRouter();
  const [addContribution] = useAddContributionMutation();
  const [showContribution, setShowContribution] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pct = Number(goal.target_amount) > 0
    ? (currentAmount / Number(goal.target_amount)) * 100
    : 0;

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = contributionSchema.safeParse({
      amount: parseFloat(amount),
      notes: notes || undefined,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await addContribution({
        goal_id: goal.id,
        user_id: userId,
        amount: result.data.amount,
        notes: result.data.notes ?? null,
        contribution_date: format(new Date(), "yyyy-MM-dd"),
      }).unwrap();
      setAmount("");
      setNotes("");
      setShowContribution(false);
      router.refresh();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/goals" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back to goals
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{goal.name}</h1>
            {goal.target_date && (
              <p className="text-sm text-zinc-500">Target by {formatDate(goal.target_date)}</p>
            )}
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              goal.status === "completed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
            )}
          >
            {goal.status}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500">Saved</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(currentAmount)}{" "}
              <span className="font-normal text-zinc-400">
                / {formatCurrency(Number(goal.target_amount))}
              </span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn("h-3 rounded-full transition-all", getProgressBarColor(pct))}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">{formatPercent(pct)} complete</p>
        </div>

        {/* Add contribution */}
        {goal.status === "active" && (
          <>
            {!showContribution ? (
              <button
                onClick={() => setShowContribution(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add contribution
              </button>
            ) : (
              <form onSubmit={handleContribute} className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Add Contribution
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="Amount (₱)"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContribution(false)}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? "Saving…" : "Save contribution"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Contribution history */}
      {contributions.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Contribution History
          </h2>
          <div className="space-y-2">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0 dark:border-zinc-800"
              >
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {c.notes || "Contribution"}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(c.contribution_date)}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(Number(c.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
