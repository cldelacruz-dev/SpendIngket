"use client";

import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import WalletCard from "./WalletCard";
import EmptyState from "@/components/shared/EmptyState";
import type { Wallet } from "@/types";

interface WalletOverviewProps {
  wallets: Wallet[];
}

export default function WalletOverview({ wallets }: WalletOverviewProps) {
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <section>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Wallets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Total balance:{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ₱{totalBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <Link
          href="/wallets"
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="No wallets yet"
          description="Add a wallet to start tracking your balances."
          action={
            <Link
              href="/wallets"
              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Go to Wallets
            </Link>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="w-60 shrink-0">
              <WalletCard wallet={wallet} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
