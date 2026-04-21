import type { BudgetWithAllocations } from "@/types";
import { formatCurrency, formatPercent, getProgressBarColor } from "@/lib/utils";
import Link from "next/link";

interface BudgetCardProps {
  budget: BudgetWithAllocations;
}

export default function BudgetCard({ budget }: BudgetCardProps) {
  const totalLimit = budget.budget_allocations.reduce(
    (sum, a) => sum + Number(a.amount_limit),
    0
  );

  return (
    <Link
      href={`/budgets/${budget.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{budget.name}</p>
          <p className="text-xs capitalize text-zinc-500">{budget.period_type} budget</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            budget.is_active
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
          }`}
        >
          {budget.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Total limit</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatCurrency(totalLimit)}
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          {budget.budget_allocations.length} categor
          {budget.budget_allocations.length === 1 ? "y" : "ies"}
        </div>
      </div>
    </Link>
  );
}
