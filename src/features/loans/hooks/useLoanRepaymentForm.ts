"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useMakeRepaymentMutation } from "@/features/loans/api/loansApi";
import { validateRepaymentForm } from "@/features/loans/services/loanService";
import type { Wallet } from "@/types";

interface UseLoanRepaymentFormOptions {
  userId: string;
  loanId: string;
  remainingBalance: number;
  wallets: Wallet[];
  onClose?: () => void;
}

export function useLoanRepaymentForm({
  userId,
  loanId,
  remainingBalance,
  wallets,
  onClose,
}: UseLoanRepaymentFormOptions) {
  const router = useRouter();
  const [makeRepayment] = useMakeRepaymentMutation();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const afterRepayment = Math.max(0, remainingBalance - amountNum);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateRepaymentForm({
      amount,
      payment_date: paymentDate,
      wallet_id: walletId,
      notes,
    });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await makeRepayment({
        p_user_id: userId,
        p_loan_id: loanId,
        p_wallet_id: validation.data.wallet_id,
        p_amount: validation.data.amount,
        p_payment_date: validation.data.payment_date,
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
    amount, setAmount,
    paymentDate, setPaymentDate,
    walletId, setWalletId,
    notes, setNotes,
    amountNum,
    afterRepayment,
    error,
    loading,
    handleSubmit,
  };
}
