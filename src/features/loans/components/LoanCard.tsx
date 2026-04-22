"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LOAN_STATUS_CONFIG, computeRepaymentProgress } from "@/features/loans/services/loanService";
import type { Loan } from "@/types";

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  const progress = computeRepaymentProgress(
    Number(loan.principal_amount),
    Number(loan.remaining_balance)
  );
  const statusCfg = LOAN_STATUS_CONFIG[loan.status];
  const paid = Number(loan.principal_amount) - Number(loan.remaining_balance);

  return (
    <Link
      href={`/loans/${loan.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
            {loan.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{loan.lender}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Paid: ₱{paid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              loan.status === "paid"
                ? "bg-emerald-500"
                : loan.status === "overdue"
                ? "bg-red-500"
                : "bg-amber-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Remaining */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</p>
          <p className="text-base font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            ₱{Number(loan.remaining_balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>
        {loan.due_date && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Due</p>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{loan.due_date}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
