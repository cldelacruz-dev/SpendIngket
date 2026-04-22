"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  useCreateLoanMutation,
  useUpdateLoanMutation,
} from "@/features/loans/api/loansApi";
import {
  validateLoanForm,
  validateLoanUpdateForm,
} from "@/features/loans/services/loanService";
import type { Loan, Wallet, LoanStatus } from "@/types";

interface UseLoanFormOptions {
  userId: string;
  loan?: Loan;      // provided = edit mode
  wallets: Wallet[];
  onClose?: () => void;
}

export function useLoanForm({ userId, loan, wallets, onClose }: UseLoanFormOptions) {
  const router = useRouter();
  const isEdit = !!loan;

  const [createLoan] = useCreateLoanMutation();
  const [updateLoan] = useUpdateLoanMutation();

  const [name, setName] = useState(loan?.name ?? "");
  const [lender, setLender] = useState(loan?.lender ?? "");
  const [principal, setPrincipal] = useState(loan?.principal_amount?.toString() ?? "");
  const [interestRate, setInterestRate] = useState(loan?.interest_rate?.toString() ?? "");
  const [startDate, setStartDate] = useState(
    loan?.start_date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [dueDate, setDueDate] = useState(loan?.due_date ?? "");
  const [walletId, setWalletId] = useState("");
  const [status, setStatus] = useState<LoanStatus>(loan?.status ?? "active");
  const [notes, setNotes] = useState(loan?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      if (isEdit && loan) {
        const validation = validateLoanUpdateForm({
          name, lender, interest_rate: interestRate, due_date: dueDate, status, notes,
        });
        if (!validation.success) { setError(validation.error); return; }
        await updateLoan({
          id: loan.id,
          name: validation.data.name,
          lender: validation.data.lender,
          interest_rate: validation.data.interest_rate ?? null,
          due_date: validation.data.due_date ?? null,
          status: validation.data.status,
          notes: validation.data.notes ?? null,
        }).unwrap();
      } else {
        const validation = validateLoanForm({
          name, lender, principal, interest_rate: interestRate,
          start_date: startDate, due_date: dueDate, wallet_id: walletId, notes,
        });
        if (!validation.success) { setError(validation.error); return; }
        await createLoan({
          p_user_id: userId,
          p_name: validation.data.name,
          p_lender: validation.data.lender,
          p_principal: validation.data.principal,
          p_interest_rate: validation.data.interest_rate ?? null,
          p_start_date: validation.data.start_date,
          p_due_date: validation.data.due_date ?? null,
          p_notes: validation.data.notes ?? null,
          p_wallet_id: validation.data.wallet_id ?? null,
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
    lender, setLender,
    principal, setPrincipal,
    interestRate, setInterestRate,
    startDate, setStartDate,
    dueDate, setDueDate,
    walletId, setWalletId,
    status, setStatus,
    notes, setNotes,
    isEdit,
    error,
    loading,
    handleSubmit,
  };
}
