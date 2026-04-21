import type { BudgetWithAllocations } from "@/types";
import BudgetCard from "./BudgetCard";
import EmptyState from "@/components/shared/EmptyState";
import { Wallet } from "lucide-react";

interface BudgetListProps {
  budgets: BudgetWithAllocations[];
  userId: string;
}

export default function BudgetList({ budgets }: BudgetListProps) {
  if (budgets.length === 0) {
    return (
      <EmptyState
        title="No budgets yet"
        description="Create your first budget to start tracking your spending limits."
        icon={<Wallet className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((b) => (
        <BudgetCard key={b.id} budget={b} />
      ))}
    </div>
  );
}
