"use client";

import { useLoanRepaymentForm } from "@/features/loans/hooks/useLoanRepaymentForm";
import { computeRepaymentProgress } from "@/features/loans/services/loanService";
import type { Wallet } from "@/types";

const INPUT_CLS =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface LoanRepaymentFormProps {
  userId: string;
  loanId: string;
  principal: number;
  remainingBalance: number;
  wallets: Wallet[];
  onClose?: () => void;
}

export default function LoanRepaymentForm({
  userId,
  loanId,
  principal,
  remainingBalance,
  wallets,
  onClose,
}: LoanRepaymentFormProps) {
  const {
    amount, setAmount,
    paymentDate, setPaymentDate,
    walletId, setWalletId,
    notes, setNotes,
    amountNum,
    afterRepayment,
    error,
    loading,
    handleSubmit,
  } = useLoanRepaymentForm({ userId, loanId, remainingBalance, wallets, onClose });

  const progressBefore = computeRepaymentProgress(principal, remainingBalance);
  const progressAfter  = computeRepaymentProgress(principal, afterRepayment);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress preview */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>Repayment progress</span>
          <span>
            {amountNum > 0 ? `${progressBefore.toFixed(0)}% → ${progressAfter.toFixed(0)}%` : `${progressBefore.toFixed(0)}%`}
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-zinc-300 dark:bg-zinc-600 transition-all"
            style={{ width: `${progressBefore}%` }}
          />
          {amountNum > 0 && (
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progressAfter}%` }}
            />
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            Remaining: ₱{remainingBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
          {amountNum > 0 && (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              After: ₱{afterRepayment.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Payment amount (₱)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0.01"
          step="0.01"
          max={remainingBalance}
          className={INPUT_CLS}
          placeholder="0.00"
        />
      </div>

      {/* Payment date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Payment date
        </label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
          className={INPUT_CLS}
        />
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Pay from wallet
        </label>
        {wallets.length === 0 ? (
          <p className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
            No wallets available.
          </p>
        ) : (
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            required
            className={INPUT_CLS}
          >
            <option value="">Select wallet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.icon} {w.name}
              </option>
            ))}
          </select>
        )}
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
          placeholder="Payment reference, bank transfer details…"
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
          disabled={loading || wallets.length === 0}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Processing…" : "Make payment"}
        </button>
      </div>
    </form>
  );
}
