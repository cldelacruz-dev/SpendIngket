"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
} from "@/features/transactions/api/transactionsApi";
import type { Category } from "@/types";
import { format } from "date-fns";

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required").max(255),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["expense", "income"]),
  category_id: z.string().uuid("Select a category"),
  transaction_date: z.string(),
  notes: z.string().max(1000).optional(),
});

interface TransactionFormProps {
  userId: string;
  categories: Category[];
  onClose?: () => void;
  initialData?: {
    id: string;
    description: string;
    amount: number;
    type: "expense" | "income";
    category_id: string;
    transaction_date: string;
    notes?: string | null;
  };
}

export default function TransactionForm({
  userId,
  categories,
  onClose,
  initialData,
}: TransactionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [addTransaction] = useAddTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();

  const [description, setDescription] = useState(initialData?.description ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [type, setType] = useState<"expense" | "income">(initialData?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [date, setDate] = useState(
    initialData?.transaction_date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = transactionSchema.safeParse({
      description,
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      transaction_date: date,
      notes: notes || undefined,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData) {
        await updateTransaction({ id: initialData.id, ...result.data }).unwrap();
      } else {
        await addTransaction({ ...result.data, user_id: userId }).unwrap();
      }
      router.refresh();
      onClose?.();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(""); }}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              type === t
                ? t === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-emerald-600 text-white"
                : "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="e.g. Lunch at Jollibee"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount (₱)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">Select a category</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="Any additional notes…"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Update" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
