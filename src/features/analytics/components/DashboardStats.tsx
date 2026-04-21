import { formatCurrency, formatPercent } from "@/lib/utils";
import type { SpendingByCategory } from "@/types";

interface DashboardStatsProps {
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export default function DashboardStats({
  totalIncome,
  totalExpense,
  net,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Income"
        value={formatCurrency(totalIncome)}
        valueClass="text-emerald-600 dark:text-emerald-400"
      />
      <StatCard
        label="Total Expenses"
        value={formatCurrency(totalExpense)}
        valueClass="text-red-600 dark:text-red-400"
      />
      <StatCard
        label="Net Balance"
        value={formatCurrency(net)}
        valueClass={net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
