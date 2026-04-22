"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useAddRecurringTransactionMutation,
} from "@/features/transactions/api/transactionsApi";
import {
  validateTransactionForm,
  computeRecurringStartDate,
  type CutoffDay,
} from "@/features/transactions/services/transactionService";
import type { Category, Wallet } from "@/types";

interface UseTransactionFormOptions {
  userId: string;
  categories: Category[];
  wallets?: Wallet[];
  defaultWalletId?: string;
  defaultType?: "expense" | "income";
  onClose?: () => void;
  initialData?: {
    id: string;
    description: string;
    amount: number;
    type: "expense" | "income";
    category_id: string;
    transaction_date: string;
    wallet_id?: string | null;
    notes?: string | null;
  };
}

export function useTransactionForm({
  userId,
  categories,
  wallets,
  defaultWalletId,
  defaultType,
  onClose,
  initialData,
}: UseTransactionFormOptions) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [addTransaction] = useAddTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [addRecurringTransaction] = useAddRecurringTransactionMutation();

  const [description, setDescription] = useState(initialData?.description ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [type, setType] = useState<"expense" | "income">(initialData?.type ?? defaultType ?? "expense");
  const [walletId, setWalletId] = useState<string>(initialData?.wallet_id ?? defaultWalletId ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [date, setDate] = useState(
    initialData?.transaction_date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [cutoffDay, setCutoffDay] = useState<CutoffDay>(15);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  function handleTypeChange(newType: "expense" | "income") {
    setType(newType);
    setCategoryId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateTransactionForm({
      description,
      amount,
      type,
      category_id: categoryId,
      transaction_date: date,
      wallet_id: walletId || undefined,
      notes,
    });

    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData) {
        await updateTransaction({
          id: initialData.id,
          user_id: userId,
          wallet_id: validation.data.wallet_id ?? null,
          category_id: validation.data.category_id,
          amount: validation.data.amount,
          type: validation.data.type,
          description: validation.data.description,
          transaction_date: validation.data.transaction_date,
          notes: validation.data.notes ?? null,
        }).unwrap();
      } else {
        let recurringTransactionId: string | undefined;
        if (type === "income" && isRecurring) {
          const startDate = computeRecurringStartDate(date, cutoffDay);
          const recurringRow = await addRecurringTransaction({
            user_id: userId,
            category_id: categoryId,
            amount: parseFloat(amount),
            type: "income",
            description,
            frequency: "monthly",
            start_date: startDate,
            is_active: true,
          }).unwrap();
          recurringTransactionId = recurringRow.id;
        }
        await addTransaction({
          user_id: userId,
          wallet_id: validation.data.wallet_id ?? null,
          category_id: validation.data.category_id,
          amount: validation.data.amount,
          type: validation.data.type,
          description: validation.data.description,
          transaction_date: validation.data.transaction_date,
          notes: validation.data.notes ?? null,
          ...(recurringTransactionId
            ? { recurring_transaction_id: recurringTransactionId }
            : {}),
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
    // Field state
    description,
    setDescription,
    amount,
    setAmount,
    type,
    date,
    setDate,
    notes,
    setNotes,
    categoryId,
    setCategoryId,
    walletId,
    setWalletId,
    isRecurring,
    setIsRecurring,
    cutoffDay,
    setCutoffDay,
    // Derived state
    filteredCategories,
    isEdit,
    error,
    loading,
    // Actions
    handleTypeChange,
    handleSubmit,
  };
}
