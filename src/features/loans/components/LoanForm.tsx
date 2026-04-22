"use client";

import { useLoanForm } from "@/features/loans/hooks/useLoanForm";
import type { Loan, Wallet, LoanStatus } from "@/types";

const INPUT_CLS =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface LoanFormProps {
  userId: string;
  wallets: Wallet[];
  loan?: Loan;
  onClose?: () => void;
}

const STATUSES: LoanStatus[] = ["active", "paid", "overdue"];

export default function LoanForm({ userId, wallets, loan, onClose }: LoanFormProps) {
  const {
    name, setName,
    lender, setLender,
    principal, setPrincipal,
    interestRate, setInterestRate,
    startDate, setStartDate,
    dueDate, setDueDate,
    walletId, setWalletId,
    status, setStatus,
    notes, setNotes,
    isEdit,
    error,
    loading,
    handleSubmit,
  } = useLoanForm({ userId, wallets, loan, onClose });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Loan name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={INPUT_CLS}
          placeholder="e.g. Motorcycle Loan"
        />
      </div>

      {/* Lender */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Lender
        </label>
        <input
          type="text"
          value={lender}
          onChange={(e) => setLender(e.target.value)}
          required
          className={INPUT_CLS}
          placeholder="e.g. BDO Bank / Juan dela Cruz"
        />
      </div>

      {/* Principal — only on create */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Loan amount (₱)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className={INPUT_CLS}
            placeholder="0.00"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Interest rate */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Interest rate (% / yr, optional)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            min="0"
            max="100"
            step="0.01"
            className={INPUT_CLS}
            placeholder="e.g. 12.5"
          />
        </div>

        {/* Status — only on edit */}
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LoanStatus)}
              className={INPUT_CLS}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Start date — only on create */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={INPUT_CLS}
            />
          </div>
        )}

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Disbursement wallet — only on create */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Receive to wallet (optional)
          </label>
          {wallets.length === 0 ? (
            <p className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
              No wallets available. You can still record the loan without linking it to a wallet.
            </p>
          ) : (
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">No wallet (e.g. housing loan, mortgage)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

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
          placeholder="Any details about this loan…"
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
          disabled={loading || (!isEdit && wallets.length === 0)}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Add loan"}
        </button>
      </div>
    </form>
  );
}
