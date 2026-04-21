import type { SavingsGoal } from "@/types";
import Link from "next/link";
import GoalCard from "./GoalCard";
import EmptyState from "@/components/shared/EmptyState";
import { Target } from "lucide-react";

interface GoalsSummaryProps {
  goals: SavingsGoal[];
}

export default function GoalsSummary({ goals }: GoalsSummaryProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Savings Goals
        </h2>
        <Link
          href="/goals"
          className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
        >
          View all
        </Link>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No active goals"
          icon={<Target className="h-8 w-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
