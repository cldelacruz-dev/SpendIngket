"use client";

import { useState } from "react";
import LoanCard from "./LoanCard";
import EmptyState from "@/components/shared/EmptyState";
import { Landmark } from "lucide-react";
import type { Loan, LoanStatus } from "@/types";

type FilterValue = "all" | LoanStatus;

interface LoanListProps {
  loans: Loan[];
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function LoanList({ loans }: LoanListProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = loans.filter((l) => filter === "all" || l.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5 w-fit dark:border-zinc-700">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === value
                ? "bg-emerald-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-8 w-8" />}
          title={filter === "all" ? "No loans yet" : `No ${filter} loans`}
          description={
            filter === "all"
              ? "Add a loan to start tracking your debt repayment progress."
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
