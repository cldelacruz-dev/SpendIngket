import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type LoanUpdate = { id: string } & Database["public"]["Tables"]["loans"]["Update"];

interface CreateLoanPayload {
  p_user_id: string;
  p_name: string;
  p_lender: string;
  p_principal: number;
  p_interest_rate: number | null;
  p_start_date: string;
  p_due_date: string | null;
  p_notes: string | null;
  p_wallet_id?: string | null;
}

interface RepaymentPayload {
  p_user_id: string;
  p_loan_id: string;
  p_wallet_id: string;
  p_amount: number;
  p_payment_date: string;
  p_notes?: string | null;
}

export const loansApi = createApi({
  reducerPath: "loansApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    createLoan: builder.mutation<string, CreateLoanPayload>({
      queryFn: async (payload) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("create_loan_with_disbursement", payload);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data as string };
      },
    }),

    updateLoan: builder.mutation<void, LoanUpdate>({
      queryFn: async ({ id, ...data }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("loans")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    deleteLoan: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("loans")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    makeRepayment: builder.mutation<string, RepaymentPayload>({
      queryFn: async (payload) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("make_loan_repayment", payload);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data as string };
      },
    }),
  }),
});

export const {
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useMakeRepaymentMutation,
} = loansApi;
