"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAddBudgetMutation } from "@/features/budgets/api/budgetsApi";
import {
  validateBudgetForm,
  type AllocationRow,
} from "@/features/budgets/services/budgetService";
import type { Category } from "@/types";

interface UseBudgetFormOptions {
  userId: string;
  categories: Category[];
  onClose?: () => void;
}

export function useBudgetForm({ userId, categories, onClose }: UseBudgetFormOptions) {
  const router = useRouter();
  const [addBudget] = useAddBudgetMutation();

  const [name, setName] = useState("");
  const [periodType, setPeriodType] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [allocations, setAllocations] = useState<AllocationRow[]>([
    { category_id: "", amount_limit: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addAllocation() {
    setAllocations((prev) => [...prev, { category_id: "", amount_limit: "" }]);
  }

  function removeAllocation(index: number) {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAllocation(index: number, field: keyof AllocationRow, value: string) {
    setAllocations((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateBudgetForm(
      { name, period_type: periodType, start_date: startDate },
      allocations
    );

    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await addBudget({
        budget: { ...validation.data, user_id: userId },
        allocations: validation.validAllocations,
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
    // Field state
    name,
    setName,
    periodType,
    setPeriodType,
    startDate,
    setStartDate,
    allocations,
    // Allocation actions
    addAllocation,
    removeAllocation,
    updateAllocation,
    // Status
    error,
    loading,
    categories,
    // Actions
    handleSubmit,
  };
}
