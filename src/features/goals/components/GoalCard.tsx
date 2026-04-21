import type { SavingsGoal } from "@/types";
import Link from "next/link";
import { formatCurrency, formatDate, formatPercent, getProgressBarColor, cn } from "@/lib/utils";

interface GoalCardProps {
  goal: SavingsGoal;
  currentAmount?: number;
}

export default function GoalCard({ goal, currentAmount = 0 }: GoalCardProps) {
  const pct = goal.target_amount > 0 ? (currentAmount / Number(goal.target_amount)) * 100 : 0;

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: `${goal.color}20` }}
        >
          {goal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">{goal.name}</p>
          {goal.target_date && (
            <p className="text-xs text-zinc-500">By {formatDate(goal.target_date)}</p>
          )}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            goal.status === "completed"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : goal.status === "active"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              : "bg-zinc-100 text-zinc-500"
          )}
        >
          {goal.status}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-500">Progress</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatCurrency(currentAmount)} / {formatCurrency(Number(goal.target_amount))}
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={cn("h-2 rounded-full", getProgressBarColor(pct))}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-400">{formatPercent(pct)} complete</p>
      </div>
    </Link>
  );
}
