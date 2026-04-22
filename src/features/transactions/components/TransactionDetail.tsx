"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteTransactionMutation } from "@/features/transactions/api/transactionsApi";
import type { TransactionWithCategory, Category } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import TransactionForm from "./TransactionForm";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TransactionDetailProps {
  transaction: TransactionWithCategory;
  categories: Category[];
}

export default function TransactionDetail({
  transaction,
  categories,
}: TransactionDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteTransaction] = useDeleteTransactionMutation();

  async function handleDelete() {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    try {
      await deleteTransaction({ id: transaction.id, userId: transaction.user_id }).unwrap();
      router.push("/transactions");
      router.refresh();
    } catch {
      // navigation already handles the outcome
    }
  }

  const cat = transaction.categories;

  if (editing) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/transactions" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Edit Transaction
          </h2>
          <TransactionForm
            userId={transaction.user_id}
            categories={categories}
            onClose={() => { setEditing(false); router.refresh(); }}
            initialData={{
              id: transaction.id,
              description: transaction.description,
              amount: Number(transaction.amount),
              type: transaction.type as "expense" | "income",
              category_id: transaction.category_id,
              transaction_date: transaction.transaction_date,
              notes: transaction.notes,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <Link href="/transactions" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> Back to transactions
      </Link>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: `${cat.color}20` }}
            >
              {cat.icon}
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {transaction.description}
              </p>
              <p className="text-sm text-zinc-500">{cat.name}</p>
            </div>
          </div>
          <span
            className={`text-xl font-bold ${
              transaction.type === "expense"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {transaction.type === "expense" ? "−" : "+"}
            {formatCurrency(Number(transaction.amount))}
          </span>
        </div>

        <dl className="mt-6 space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex justify-between text-sm">
            <dt className="text-zinc-500">Date</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {formatDate(transaction.transaction_date)}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-zinc-500">Type</dt>
            <dd className="capitalize text-zinc-900 dark:text-zinc-100">
              {transaction.type}
            </dd>
          </div>
          {transaction.notes && (
            <div className="flex justify-between text-sm">
              <dt className="text-zinc-500">Notes</dt>
              <dd className="text-zinc-900 dark:text-zinc-100">{transaction.notes}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
