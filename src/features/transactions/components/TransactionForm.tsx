"use client";

import { useTransactionForm } from "@/features/transactions/hooks/useTransactionForm";
import { daySuffix, CUTOFF_DAY_OPTIONS } from "@/features/transactions/services/transactionService";
import type { Category } from "@/types";

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
  const {
    description, setDescription,
    amount, setAmount,
    type,
    date, setDate,
    notes, setNotes,
    categoryId, setCategoryId,
    isRecurring, setIsRecurring,
    cutoffDay, setCutoffDay,
    filteredCategories,
    isEdit,
    error,
    loading,
    handleTypeChange,
    handleSubmit,
  } = useTransactionForm({ userId, categories, onClose, initialData });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* Recurring income — only shown on income tab for new transactions */}
      {type === "income" && !isEdit && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              This is recurring income (e.g. salary cutoff)
            </span>
          </label>

          {isRecurring && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Paid every month on…
              </p>
              <div className="flex flex-wrap gap-2">
                {CUTOFF_DAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setCutoffDay(day)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      cutoffDay === day
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-zinc-600 border border-zinc-300 hover:border-emerald-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {day === "end" ? "Last day" : `${day}${daySuffix(day as number)}`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                {cutoffDay === "end"
                  ? "Income will recur on the last day of every month."
                  : `Income will recur on the ${cutoffDay}${daySuffix(cutoffDay as number)} of every month.`}
              </p>
            </div>
          )}
        </div>
      )}

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
