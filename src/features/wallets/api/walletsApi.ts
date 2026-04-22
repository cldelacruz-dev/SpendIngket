import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type WalletInsert = Database["public"]["Tables"]["wallets"]["Insert"];
type WalletUpdate = { id: string } & Database["public"]["Tables"]["wallets"]["Update"];

interface TransferPayload {
  p_user_id: string;
  p_from_wallet_id: string;
  p_to_wallet_id: string;
  p_amount: number;
  p_description: string;
  p_date: string;
  p_notes?: string | null;
}

export const walletsApi = createApi({
  reducerPath: "walletsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addWallet: builder.mutation<void, WalletInsert>({
      queryFn: async (data) => {
        const supabase = createClient();
        const { error } = await supabase.from("wallets").insert(data);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    updateWallet: builder.mutation<void, WalletUpdate>({
      queryFn: async ({ id, ...data }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("wallets")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    deleteWallet: builder.mutation<void, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("wallets")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    transfer: builder.mutation<string, TransferPayload>({
      queryFn: async (payload) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("transfer_between_wallets", payload);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: data as string };
      },
    }),
  }),
});

export const {
  useAddWalletMutation,
  useUpdateWalletMutation,
  useDeleteWalletMutation,
  useTransferMutation,
} = walletsApi;
