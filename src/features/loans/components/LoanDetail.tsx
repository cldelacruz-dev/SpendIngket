"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDeleteLoanMutation } from "@/features/loans/api/loansApi";
import {
  LOAN_STATUS_CONFIG,
  computeRepaymentProgress,
} from "@/features/loans/services/loanService";
import LoanForm from "./LoanForm";
import LoanRepaymentForm from "./LoanRepaymentForm";
import type { Loan, Wallet, TransactionWithWalletAndCategory } from "@/types";
import { formatDate } from "@/lib/utils";

interface LoanDetailProps {
  loan: Loan;
  wallets: Wallet[];
  transactions: TransactionWithWalletAndCategory[];
  userId: string;
}

export default function LoanDetail({
  loan,
  wallets,
  transactions,
  userId,
}: LoanDetailProps) {
  const router = useRouter();
  const [deleteLoan, { isLoading: deleting }] = useDeleteLoanMutation();

  const [showEdit, setShowEdit] = useState(false);
  const [showRepayment, setShowRepayment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCfg = LOAN_STATUS_CONFIG[loan.status];
  const progress = computeRepaymentProgress(
    Number(loan.principal_amount),
    Number(loan.remaining_balance)
  );
  const paidAmount = Number(loan.principal_amount) - Number(loan.remaining_balance);

  async function handleDelete() {
    try {
      await deleteLoan({ id: loan.id, userId }).unwrap();
      router.push("/loans");
    } catch {
      // Remain on page — future: surface error
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/loans"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" />
        All loans
      </Link>

      {/* Loan header card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
              {loan.name}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{loan.lender}</p>

            {/* Status badge */}
            <span
              className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span>
              Paid: ₱{paidAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: statusCfg.color }}
            />
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-xs text-zinc-400">₱0</span>
            <span className="text-xs text-zinc-400">
              ₱{Number(loan.principal_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Remaining balance */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            ₱{Number(loan.remaining_balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">remaining</p>
        </div>

        {/* Metadata */}
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div>
            <dt className="text-zinc-400">Principal</dt>
            <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
              ₱{Number(loan.principal_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </dd>
          </div>
          {loan.interest_rate != null && (
            <div>
              <dt className="text-zinc-400">Interest rate</dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {loan.interest_rate}% / yr
              </dd>
            </div>
          )}
          <div>
            <dt className="text-zinc-400">Start date</dt>
            <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
              {loan.start_date}
            </dd>
          </div>
          {loan.due_date && (
            <div>
              <dt className="text-zinc-400">Due date</dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {loan.due_date}
              </dd>
            </div>
          )}
        </dl>

        {loan.notes && (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 italic">{loan.notes}</p>
        )}

        {/* Make payment CTA */}
        {loan.status !== "paid" && (
          <button
            onClick={() => setShowRepayment(true)}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Make a payment
          </button>
        )}
      </div>

      {/* Payment history */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Payment history
        </h2>
        {transactions.length === 0 ? (
          <p className="rounded-xl border border-zinc-100 bg-white p-6 text-sm text-center text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
            No payments recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {tx.description}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(tx.transaction_date)}</p>
                  {tx.notes && (
                    <p className="mt-0.5 text-xs text-zinc-400 italic">{tx.notes}</p>
                  )}
                </div>
                <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                  -₱{Number(tx.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEdit(false)}
          />
          <div
            className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            style={{ maxHeight: "90dvh" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Edit loan
            </h2>
            <LoanForm
              userId={userId}
              wallets={wallets}
              loan={loan}
              onClose={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}

      {/* Repayment modal */}
      {showRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRepayment(false)}
          />
          <div
            className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            style={{ maxHeight: "90dvh" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Make a payment
            </h2>
            <LoanRepaymentForm
              userId={userId}
              loanId={loan.id}
              principal={Number(loan.principal_amount)}
              remainingBalance={Number(loan.remaining_balance)}
              wallets={wallets}
              onClose={() => setShowRepayment(false)}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Delete loan?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This will permanently delete &ldquo;{loan.name}&rdquo; and all its payment records. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
