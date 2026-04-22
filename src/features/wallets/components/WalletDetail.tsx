"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Plus, Minus, Pencil, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useDeleteWalletMutation } from "@/features/wallets/api/walletsApi";
import { WALLET_TYPES } from "@/features/wallets/services/walletService";
import WalletForm from "./WalletForm";
import TransferForm from "./TransferForm";
import TransactionForm from "@/features/transactions/components/TransactionForm";
import type { Wallet, TransactionWithWalletAndCategory, Category } from "@/types";

type TxFilter = "all" | "income" | "expense" | "transfer";

interface WalletDetailProps {
  wallet: Wallet;
  wallets: Wallet[];
  transactions: TransactionWithWalletAndCategory[];
  categories: Category[];
  userId: string;
}

export default function WalletDetail({
  wallet,
  wallets,
  transactions,
  categories,
  userId,
}: WalletDetailProps) {
  const router = useRouter();
  const [deleteWallet, { isLoading: deleting }] = useDeleteWalletMutation();

  const [showEdit, setShowEdit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeInfo = WALLET_TYPES.find((t) => t.value === wallet.type);
  const [filter, setFilter] = useState<TxFilter>("all");

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "transfer") return t.type === "transfer";
    return t.type === filter;
  });

  async function handleDelete() {
    try {
      await deleteWallet({ id: wallet.id, userId }).unwrap();
      router.push("/wallets");
      router.refresh();
    } catch {
      // swallow — deletion will fail if transactions exist; could surface as toast
    }
  }

  const FILTERS: { value: TxFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "transfer", label: "Transfers" },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet header card */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: wallet.color }}
        />
        <div className="ml-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{wallet.icon}</span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {wallet.name}
                </h1>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: wallet.color + "20",
                    color: wallet.color,
                  }}
                >
                  {typeInfo?.label ?? wallet.type}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium">
              Current balance
            </p>
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                Number(wallet.balance) < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-50"
              )}
            >
              ₱{Number(wallet.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {wallet.notes && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{wallet.notes}</p>
          )}
        </div>
      </div>

        {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowAddIncome(true)}
          className="flex flex-1 sm:flex-none items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <Plus className="h-4 w-4" /> Add income
        </button>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex flex-1 sm:flex-none items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
        >
          <Minus className="h-4 w-4" /> Add expense
        </button>
        <button
          onClick={() => setShowTransfer(true)}
          className="flex flex-1 sm:flex-none items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeftRight className="h-4 w-4" /> Transfer
        </button>
      </div>

      {/* Transactions */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Transactions</h2>
          <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === value
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            No {filter === "all" ? "" : filter} transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => {
              const isExpense = t.type === "expense" || t.type === "loan_payment";
              const isTransfer = t.type === "transfer";
              const isLoanReceived = t.type === "loan_received";
              const cat = t.categories;

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {isTransfer ? "↔️" : isLoanReceived ? "💸" : t.type === "loan_payment" ? "🏦" : cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {t.description}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {isTransfer
                        ? "Transfer"
                        : isLoanReceived
                        ? "Loan received"
                        : t.type === "loan_payment"
                        ? "Loan payment"
                        : cat.name}{" "}
                      · {formatDate(t.transaction_date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isExpense
                        ? "text-red-600 dark:text-red-400"
                        : isTransfer
                        ? "text-zinc-500 dark:text-zinc-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {isExpense ? "−" : isTransfer ? "↔" : "+"}₱
                    {Number(t.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add income modal */}
      {showAddIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddIncome(false)} />
          <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900" style={{ maxHeight: "90dvh" }}>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add income</h2>
            <TransactionForm
              userId={userId}
              categories={categories}
              wallets={wallets}
              defaultWalletId={wallet.id}
              defaultType="income"
              onClose={() => setShowAddIncome(false)}
            />
          </div>
        </div>
      )}

      {/* Add expense modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddExpense(false)} />
          <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900" style={{ maxHeight: "90dvh" }}>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add expense</h2>
            <TransactionForm
              userId={userId}
              categories={categories}
              wallets={wallets}
              defaultWalletId={wallet.id}
              defaultType="expense"
              onClose={() => setShowAddExpense(false)}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEdit(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Edit wallet
            </h2>
            <WalletForm userId={userId} wallet={wallet} onClose={() => setShowEdit(false)} />
          </div>
        </div>
      )}

      {/* Transfer modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTransfer(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Transfer money
            </h2>
            <TransferForm
              userId={userId}
              wallets={wallets}
              defaultFromWalletId={wallet.id}
              onClose={() => setShowTransfer(false)}
            />
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Delete wallet?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This will delete <strong>{wallet.name}</strong>. Transactions linked to this wallet
              will have their wallet association removed but will not be deleted.
            </p>
            <div className="mt-4 flex gap-3">
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
