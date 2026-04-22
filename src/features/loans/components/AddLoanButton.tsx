"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import LoanForm from "./LoanForm";
import type { Wallet } from "@/types";

interface AddLoanButtonProps {
  userId: string;
  wallets: Wallet[];
}

export default function AddLoanButton({ userId, wallets }: AddLoanButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add loan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            style={{ maxHeight: "90dvh" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Add loan
            </h2>
            <LoanForm userId={userId} wallets={wallets} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
