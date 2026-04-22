"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTransferMutation } from "@/features/wallets/api/walletsApi";
import { validateTransferForm } from "@/features/wallets/services/walletService";
import type { Wallet } from "@/types";

interface UseTransferFormOptions {
  userId: string;
  wallets: Wallet[];
  defaultFromWalletId?: string;
  onClose?: () => void;
}

export function useTransferForm({
  userId,
  wallets,
  defaultFromWalletId,
  onClose,
}: UseTransferFormOptions) {
  const router = useRouter();
  const [transfer] = useTransferMutation();

  const firstWallet = wallets[0]?.id ?? "";
  const secondWallet = wallets.length > 1 ? wallets[1]?.id : "";

  const [fromWalletId, setFromWalletId] = useState(defaultFromWalletId ?? firstWallet);
  const [toWalletId, setToWalletId] = useState(
    defaultFromWalletId
      ? wallets.find((w) => w.id !== defaultFromWalletId)?.id ?? secondWallet
      : secondWallet
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Transfer");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fromWallet = wallets.find((w) => w.id === fromWalletId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateTransferForm({
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount,
      description,
      date,
      notes,
    });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await transfer({
        p_user_id: userId,
        p_from_wallet_id: validation.data.from_wallet_id,
        p_to_wallet_id: validation.data.to_wallet_id,
        p_amount: validation.data.amount,
        p_description: validation.data.description,
        p_date: validation.data.date,
        p_notes: validation.data.notes ?? null,
      }).unwrap();
      router.refresh();
      onClose?.();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    fromWalletId, setFromWalletId,
    toWalletId, setToWalletId,
    amount, setAmount,
    description, setDescription,
    date, setDate,
    notes, setNotes,
    fromWallet,
    wallets,
    error,
    loading,
    handleSubmit,
  };
}
