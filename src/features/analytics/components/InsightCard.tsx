import { formatCurrency, formatPercent } from "@/lib/utils";
import { buildNarrative } from "@/features/analytics/services/analyticsService";
import type { SpendingByCategory } from "@/types";

interface InsightCardProps {
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  topCategory: SpendingByCategory | null;
  month: string;
}

export default function InsightCard({
  totalIncome,
  totalExpense,
  savingRate,
  topCategory,
  month,
}: InsightCardProps) {
  const net = totalIncome - totalExpense;

  const narrative = buildNarrative({
    totalIncome,
    totalExpense,
    savingRate,
    topCategory,
    month,
  });

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2">
        Monthly Insight
      </p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{narrative}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-emerald-100 pt-4 dark:border-emerald-900 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Income</p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Expenses</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Saving rate</p>
          <p className={`text-sm font-semibold ${savingRate >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatPercent(savingRate)}
          </p>
        </div>
      </div>
    </div>
  );
}
