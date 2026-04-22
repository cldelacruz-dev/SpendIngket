"use client";

import { useTransferForm } from "@/features/wallets/hooks/useTransferForm";
import type { Wallet } from "@/types";

const INPUT_CLS =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface TransferFormProps {
  userId: string;
  wallets: Wallet[];
  defaultFromWalletId?: string;
  onClose?: () => void;
}

export default function TransferForm({
  userId,
  wallets,
  defaultFromWalletId,
  onClose,
}: TransferFormProps) {
  const {
    fromWalletId, setFromWalletId,
    toWalletId, setToWalletId,
    amount, setAmount,
    description, setDescription,
    date, setDate,
    notes, setNotes,
    fromWallet,
    error,
    loading,
    handleSubmit,
  } = useTransferForm({ userId, wallets, defaultFromWalletId, onClose });

  if (wallets.length < 2) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
        You need at least two wallets to transfer money between them.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* From wallet */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          From wallet
        </label>
        <select
          value={fromWalletId}
          onChange={(e) => setFromWalletId(e.target.value)}
          required
          className={INPUT_CLS}
        >
          <option value="">Select source wallet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.icon} {w.name} — ₱{Number(w.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </option>
          ))}
        </select>
        {fromWallet && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Available: ₱{Number(fromWallet.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* To wallet */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          To wallet
        </label>
        <select
          value={toWalletId}
          onChange={(e) => setToWalletId(e.target.value)}
          required
          className={INPUT_CLS}
        >
          <option value="">Select destination wallet</option>
          {wallets
            .filter((w) => w.id !== fromWalletId)
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.icon} {w.name}
              </option>
            ))}
        </select>
      </div>

      {/* Amount */}
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
          className={INPUT_CLS}
          placeholder="0.00"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={INPUT_CLS}
          placeholder="e.g. Moving funds to savings"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={INPUT_CLS}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={INPUT_CLS}
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
          {loading ? "Transferring…" : "Transfer"}
        </button>
      </div>
    </form>
  );
}
