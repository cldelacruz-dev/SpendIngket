"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddGoalMutation } from "@/features/goals/api/goalsApi";
import { validateGoalForm } from "@/features/goals/services/goalService";

interface UseGoalFormOptions {
  userId: string;
  onClose?: () => void;
}

export function useGoalForm({ userId, onClose }: UseGoalFormOptions) {
  const router = useRouter();
  const [addGoal] = useAddGoalMutation();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState("#10b981");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateGoalForm({ name, target_amount: targetAmount, target_date: targetDate, icon, color });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await addGoal({ ...validation.data, user_id: userId }).unwrap();
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
    targetAmount, setTargetAmount,
    targetDate, setTargetDate,
    icon, setIcon,
    color, setColor,
    error,
    loading,
    handleSubmit,
  };
}
