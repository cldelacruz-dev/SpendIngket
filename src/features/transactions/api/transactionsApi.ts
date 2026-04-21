import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = { id: string } & Database["public"]["Tables"]["transactions"]["Update"];

export const transactionsApi = createApi({
  reducerPath: "transactionsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addTransaction: builder.mutation<void, TransactionInsert>({
      queryFn: async (data) => {
        const supabase = createClient();
        const { error } = await supabase.from("transactions").insert(data);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    updateTransaction: builder.mutation<void, TransactionUpdate>({
      queryFn: async ({ id, ...data }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("transactions")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    deleteTransaction: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),
  }),
});

export const {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionsApi;
