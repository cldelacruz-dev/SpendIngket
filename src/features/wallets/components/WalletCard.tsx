"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { WALLET_TYPE_ICONS, WALLET_TYPES } from "@/features/wallets/services/walletService";
import type { Wallet } from "@/types";

interface WalletCardProps {
  wallet: Wallet;
  currencySymbol?: string;
}

export default function WalletCard({ wallet, currencySymbol = "₱" }: WalletCardProps) {
  const typeInfo = WALLET_TYPES.find((t) => t.value === wallet.type);
  const icon = wallet.icon || WALLET_TYPE_ICONS[wallet.type];

  return (
    <Link
      href={`/wallets/${wallet.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: wallet.color }}
      />

      <div className="ml-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                {wallet.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {typeInfo?.label ?? wallet.type}
              </p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: wallet.color + "20",
              color: wallet.color,
            }}
          >
            {typeInfo?.label ?? wallet.type}
          </span>
        </div>

        {/* Balance */}
        <div className="mt-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">
            Balance
          </p>
          <p
            className={cn(
              "text-xl font-bold tabular-nums",
              wallet.balance < 0
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-900 dark:text-zinc-50"
            )}
          >
            {currencySymbol}
            {Number(wallet.balance).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
