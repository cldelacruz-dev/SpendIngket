import type { TransactionWithCategory, Category } from "@/types";
import Link from "next/link";
import TransactionCard from "./TransactionCard";
import EmptyState from "@/components/shared/EmptyState";
import { ArrowLeftRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Transactions
        </h2>
        <Link
          href="/transactions"
          className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
        >
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Start by logging your first expense or income."
          icon={<ArrowLeftRight className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <Link key={t.id} href={`/transactions/${t.id}`}>
              <TransactionCard transaction={t} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
