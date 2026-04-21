import type { SavingsGoal } from "@/types";
import GoalCard from "./GoalCard";
import EmptyState from "@/components/shared/EmptyState";
import { Target } from "lucide-react";

interface GoalListProps {
  goals: SavingsGoal[];
  userId: string;
}

export default function GoalList({ goals }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <EmptyState
        title="No goals yet"
        description="Set your first savings goal and start working towards it."
        icon={<Target className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((g) => (
        <GoalCard key={g.id} goal={g} />
      ))}
    </div>
  );
}
