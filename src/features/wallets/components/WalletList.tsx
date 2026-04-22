"use client";

import WalletCard from "./WalletCard";
import EmptyState from "@/components/shared/EmptyState";
import { CreditCard } from "lucide-react";
import type { Wallet } from "@/types";

interface WalletListProps {
  wallets: Wallet[];
}

export default function WalletList({ wallets }: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-8 w-8" />}
        title="No wallets yet"
        description="Add your first wallet to start tracking your money across accounts."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </div>
  );
}
