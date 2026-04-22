"use client";

import { useBudgetForm } from "@/features/budgets/hooks/useBudgetForm";
import type { Category } from "@/types";

interface BudgetFormProps {
  userId: string;
  categories: Category[];
  onClose?: () => void;
}

export default function BudgetForm({ userId, categories, onClose }: BudgetFormProps) {
  const {
    name, setName,
    periodType, setPeriodType,
    startDate, setStartDate,
    allocations,
    addAllocation,
    removeAllocation,
    updateAllocation,
    error,
    loading,
    handleSubmit,
  } = useBudgetForm({ userId, categories, onClose });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Budget name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="e.g. April Budget"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Period
          </label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as typeof periodType)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category allocations
          </label>
          <button
            type="button"
            onClick={addAllocation}
            className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
          >
            + Add category
          </button>
        </div>
        <div className="space-y-2">
          {allocations.map((row, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={row.category_id}
                onChange={(e) => updateAllocation(i, "category_id", e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={row.amount_limit}
                onChange={(e) => updateAllocation(i, "amount_limit", e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="Limit"
                className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
              {allocations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllocation(i)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
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
          {loading ? "Creating…" : "Create budget"}
        </button>
      </div>
    </form>
  );
}
