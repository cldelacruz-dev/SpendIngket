"use client";

import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { LOAN_STATUS_CONFIG, computeRepaymentProgress } from "@/features/loans/services/loanService";
import EmptyState from "@/components/shared/EmptyState";
import type { Loan } from "@/types";

interface LoansSummaryProps {
  loans: Loan[];
}

export default function LoansSummary({ loans }: LoansSummaryProps) {
  const totalOutstanding = loans.reduce((sum, l) => sum + Number(l.remaining_balance), 0);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Active Loans
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Total outstanding:{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              ₱{totalOutstanding.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <Link
          href="/loans"
          className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loans.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-6 w-6" />}
          title="No active loans"
          description="Track your loans and monitor repayment progress here."
        />
      ) : (
        <div className="space-y-3">
          {loans.slice(0, 3).map((loan) => {
            const progress = computeRepaymentProgress(
              Number(loan.principal_amount),
              Number(loan.remaining_balance)
            );
            const statusCfg = LOAN_STATUS_CONFIG[loan.status];

            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: statusCfg.bgColor }}
                >
                  <Landmark className="h-5 w-5" style={{ color: statusCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {loan.name}
                    </p>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      ₱{Number(loan.remaining_balance).toLocaleString("en-PH", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: statusCfg.color }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {progress.toFixed(0)}% paid · {loan.lender}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
