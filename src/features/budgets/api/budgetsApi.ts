import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type AllocationInsert = Omit<
  Database["public"]["Tables"]["budget_allocations"]["Insert"],
  "budget_id"
>;

interface AddBudgetPayload {
  budget: BudgetInsert;
  allocations: AllocationInsert[];
}

export const budgetsApi = createApi({
  reducerPath: "budgetsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addBudget: builder.mutation<void, AddBudgetPayload>({
      queryFn: async ({ budget, allocations }) => {
        const supabase = createClient();

        const { data: created, error: budgetError } = await supabase
          .from("budgets")
          .insert(budget)
          .select("id")
          .single();

        if (budgetError || !created) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: budgetError?.message ?? "Failed to create budget",
            },
          };
        }

        const { error: allocError } = await supabase
          .from("budget_allocations")
          .insert(allocations.map((a) => ({ ...a, budget_id: created.id })));

        if (allocError) {
          return { error: { status: "CUSTOM_ERROR", error: allocError.message } };
        }

        return { data: undefined };
      },
    }),
  }),
});

export const { useAddBudgetMutation } = budgetsApi;
