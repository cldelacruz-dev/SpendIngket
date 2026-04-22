"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteTransactionMutation } from "@/features/transactions/api/transactionsApi";
import type { TransactionWithCategory, Category } from "@/types";
import TransactionCard from "./TransactionCard";
import TransactionForm from "./TransactionForm";
import EmptyState from "@/components/shared/EmptyState";
import { ArrowLeftRight, Pencil, Trash2 } from "lucide-react";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  userId: string;
}

export default function TransactionList({
  transactions,
  categories,
  userId,
}: TransactionListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTransaction] = useDeleteTransactionMutation();

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction({ id, userId }).unwrap();
      router.refresh();
    } catch {
      // Errors are non-critical in list context; suppress
    }
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Log your first expense or income to get started."
        icon={<ArrowLeftRight className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => {
        if (editingId === t.id) {
          return (
            <div
              key={t.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <TransactionForm
                userId={userId}
                categories={categories}
                onClose={() => setEditingId(null)}
                initialData={{
                  id: t.id,
                  description: t.description,
                  amount: Number(t.amount),
                  type: t.type as "expense" | "income",
                  category_id: t.category_id,
                  transaction_date: t.transaction_date,
                  notes: t.notes,
                }}
              />
            </div>
          );
        }

        return (
          <div key={t.id} className="group relative">
            <div className="pr-20">
              <TransactionCard transaction={t} />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {(t.type === "income" || t.type === "expense") && (
                <button
                  onClick={() => setEditingId(t.id)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(t.id)}
                className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

        );
      })}
    </div>
  );
}
