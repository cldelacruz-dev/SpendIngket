import type { BudgetWithAllocations } from "@/types";
import Link from "next/link";
import { Wallet } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { formatCurrency, formatPercent, getProgressBarColor } from "@/lib/utils";

interface BudgetOverviewProps {
  budgets: BudgetWithAllocations[];
}

export default function BudgetOverview({ budgets }: BudgetOverviewProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Active Budgets
        </h2>
        <Link
          href="/budgets"
          className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
        >
          View all
        </Link>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          title="No active budgets"
          icon={<Wallet className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const totalLimit = b.budget_allocations.reduce(
              (s, a) => s + Number(a.amount_limit),
              0
            );
            return (
              <Link key={b.id} href={`/budgets/${b.id}`} className="block">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {b.name}
                  </span>
                  <span className="text-zinc-500">{formatCurrency(totalLimit)}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: "0%" }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
