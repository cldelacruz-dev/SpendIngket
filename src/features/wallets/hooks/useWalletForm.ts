"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAddWalletMutation,
  useUpdateWalletMutation,
} from "@/features/wallets/api/walletsApi";
import {
  validateWalletForm,
  WALLET_COLORS,
  WALLET_TYPE_ICONS,
} from "@/features/wallets/services/walletService";
import type { Wallet, WalletType } from "@/types";

interface UseWalletFormOptions {
  userId: string;
  wallet?: Wallet; // provided = edit mode
  onClose?: () => void;
}

export function useWalletForm({ userId, wallet, onClose }: UseWalletFormOptions) {
  const router = useRouter();
  const isEdit = !!wallet;

  const [addWallet] = useAddWalletMutation();
  const [updateWallet] = useUpdateWalletMutation();

  const [name, setName] = useState(wallet?.name ?? "");
  const [type, setType] = useState<WalletType>(wallet?.type ?? "cash");
  const [balance, setBalance] = useState(wallet?.balance?.toString() ?? "0");
  const [color, setColor] = useState(wallet?.color ?? WALLET_COLORS[0]);
  const [icon, setIcon] = useState(wallet?.icon ?? WALLET_TYPE_ICONS["cash"]);
  const [notes, setNotes] = useState(wallet?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleTypeChange(newType: WalletType) {
    setType(newType);
    setIcon(WALLET_TYPE_ICONS[newType]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateWalletForm({ name, type, balance, color, icon, notes });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && wallet) {
        await updateWallet({
          id: wallet.id,
          name: validation.data.name,
          type: validation.data.type,
          color: validation.data.color,
          icon: validation.data.icon,
          notes: validation.data.notes ?? null,
        }).unwrap();
      } else {
        await addWallet({
          ...validation.data,
          user_id: userId,
          notes: validation.data.notes ?? null,
        }).unwrap();
      }
      router.refresh();
      onClose?.();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    name, setName,
    type, handleTypeChange,
    balance, setBalance,
    color, setColor,
    icon, setIcon,
    notes, setNotes,
    isEdit,
    error,
    loading,
    handleSubmit,
  };
}
