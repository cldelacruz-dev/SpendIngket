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
import type { Category } from "@/types";

interface UseTransactionFormOptions {
  userId: string;
  categories: Category[];
  onClose?: () => void;
  initialData?: {
    id: string;
    description: string;
    amount: number;
    type: "expense" | "income";
    category_id: string;
    transaction_date: string;
    notes?: string | null;
  };
}

export function useTransactionForm({
  userId,
  categories,
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
  const [type, setType] = useState<"expense" | "income">(initialData?.type ?? "expense");
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
      notes,
    });

    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData) {
        await updateTransaction({ id: initialData.id, ...validation.data }).unwrap();
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
          ...validation.data,
          user_id: userId,
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
