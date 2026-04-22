"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAddContributionMutation } from "@/features/goals/api/goalsApi";
import { validateContributionForm } from "@/features/goals/services/goalService";

interface UseContributionFormOptions {
  goalId: string;
  userId: string;
  onSuccess?: () => void;
}

export function useContributionForm({ goalId, userId, onSuccess }: UseContributionFormOptions) {
  const router = useRouter();
  const [addContribution] = useAddContributionMutation();

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setAmount("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateContributionForm({ amount, notes });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await addContribution({
        goal_id: goalId,
        user_id: userId,
        amount: validation.data.amount,
        notes: validation.data.notes ?? null,
        contribution_date: format(new Date(), "yyyy-MM-dd"),
      }).unwrap();
      reset();
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    amount, setAmount,
    notes, setNotes,
    error,
    loading,
    handleSubmit,
    reset,
  };
}
