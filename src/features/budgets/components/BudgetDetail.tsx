import type { BudgetWithAllocations, BudgetUtilization } from "@/types";
import { formatCurrency, formatPercent, formatDate, getProgressBarColor, cn } from "@/lib/utils";
import { computeBudgetSummary } from "@/features/budgets/services/budgetService";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BudgetDetailProps {
  budget: BudgetWithAllocations;
  utilization: BudgetUtilization[];
}

export default function BudgetDetail({ budget, utilization }: BudgetDetailProps) {
  const { totalLimit, totalSpent, overallPct } = computeBudgetSummary(budget, utilization);

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/budgets"
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to budgets
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {budget.name}
            </h1>
            <p className="text-sm capitalize text-zinc-500">{budget.period_type} · starts {formatDate(budget.start_date)}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              budget.is_active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500"
            )}
          >
            {budget.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Overall progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500">Total spent</span>
            <span className="font-medium">
              {formatCurrency(totalSpent)} / {formatCurrency(totalLimit)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn("h-3 rounded-full transition-all", getProgressBarColor(overallPct))}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">{formatPercent(overallPct)} of budget used</p>
        </div>

        {/* Per-category breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Category breakdown
          </h2>
          {utilization.length === 0
            ? budget.budget_allocations.map((a) => {
                const cat = a.categories;
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                      </span>
                      <span className="text-zinc-500">₱0 / {formatCurrency(Number(a.amount_limit))}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: "0%" }} />
                    </div>
                  </div>
                );
              })
            : utilization.map((u) => {
                const alloc = budget.budget_allocations.find(
                  (a) => a.category_id === u.category_id
                );
                const cat = alloc?.categories;
                return (
                  <div key={u.category_id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        {cat && <span>{cat.icon}</span>}
                        <span className="text-zinc-700 dark:text-zinc-300">{u.category_name}</span>
                      </span>
                      <span className="text-zinc-500">
                        {formatCurrency(u.amount_spent)} / {formatCurrency(u.amount_limit)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={cn("h-2 rounded-full", getProgressBarColor(u.utilization_pct))}
                        style={{ width: `${Math.min(u.utilization_pct, 100)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">{formatPercent(u.utilization_pct)} used</p>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
