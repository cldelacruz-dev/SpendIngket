import type { TransactionWithCategory } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: TransactionWithCategory;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isExpense = transaction.type === "expense";
  const cat = transaction.categories;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: `${cat.color}20` }}
      >
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {transaction.description}
        </p>
        <p className="text-xs text-zinc-500">
          {cat.name} · {formatDate(transaction.transaction_date)}
        </p>
      </div>
      <span
        className={cn(
          "text-sm font-semibold",
          isExpense ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {isExpense ? "−" : "+"}
        {formatCurrency(Number(transaction.amount))}
      </span>
    </div>
  );
}
