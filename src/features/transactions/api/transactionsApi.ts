import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TransactionUpdate = { id: string } & Database["public"]["Tables"]["transactions"]["Update"];
type RecurringTransactionInsert = Database["public"]["Tables"]["recurring_transactions"]["Insert"];

interface AddTransactionPayload {
  user_id: string;
  wallet_id?: string | null;
  category_id: string;
  amount: number;
  type: "expense" | "income";
  description: string;
  transaction_date: string;
  notes?: string | null;
  recurring_transaction_id?: string;
}

interface UpdateTransactionPayload {
  id: string;
  user_id: string;
  wallet_id?: string | null;
  category_id: string;
  amount: number;
  type: "expense" | "income";
  description: string;
  transaction_date: string;
  notes?: string | null;
}

export const transactionsApi = createApi({
  reducerPath: "transactionsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addTransaction: builder.mutation<void, AddTransactionPayload>({
      queryFn: async ({ recurring_transaction_id, ...data }) => {
        const supabase = createClient();
        // If wallet_id provided, use RPC to keep balance in sync
        if (data.wallet_id) {
          const { error } = await supabase.rpc("add_transaction_with_balance", {
            p_user_id: data.user_id,
            p_wallet_id: data.wallet_id,
            p_category_id: data.category_id,
            p_amount: data.amount,
            p_type: data.type,
            p_description: data.description,
            p_transaction_date: data.transaction_date,
            p_notes: data.notes ?? null,
          });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        } else {
          const { error } = await supabase.from("transactions").insert({
            ...data,
            ...(recurring_transaction_id ? { recurring_transaction_id } : {}),
          });
          if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
        return { data: undefined };
      },
    }),

    updateTransaction: builder.mutation<void, UpdateTransactionPayload>({
      queryFn: async ({ id, user_id, wallet_id, ...rest }) => {
        const supabase = createClient();
        // Use RPC to reverse old balance and apply new balance
        const { error } = await supabase.rpc("update_transaction_with_balance", {
          p_transaction_id: id,
          p_user_id: user_id,
          p_new_wallet_id: wallet_id ?? null,
          p_category_id: rest.category_id,
          p_amount: rest.amount,
          p_type: rest.type,
          p_description: rest.description,
          p_transaction_date: rest.transaction_date,
          p_notes: rest.notes ?? null,
        });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    deleteTransaction: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const supabase = createClient();
        const { error } = await supabase.rpc("delete_transaction_with_balance", {
          p_transaction_id: id,
          p_user_id: userId,
        });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    addRecurringTransaction: builder.mutation<{ id: string }, RecurringTransactionInsert>({
      queryFn: async (data) => {
        const supabase = createClient();
        const { data: row, error } = await supabase
          .from("recurring_transactions")
          .insert(data)
          .select("id")
          .single();
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: row };
      },
    }),
  }),
});

export const {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useAddRecurringTransactionMutation,
} = transactionsApi;
