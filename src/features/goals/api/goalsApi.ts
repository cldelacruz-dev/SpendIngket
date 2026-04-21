import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type GoalInsert = Database["public"]["Tables"]["savings_goals"]["Insert"];
type ContributionInsert = Database["public"]["Tables"]["goal_contributions"]["Insert"];

export const goalsApi = createApi({
  reducerPath: "goalsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    addGoal: builder.mutation<void, GoalInsert>({
      queryFn: async (data) => {
        const supabase = createClient();
        const { error } = await supabase.from("savings_goals").insert(data);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),

    addContribution: builder.mutation<void, ContributionInsert>({
      queryFn: async (data) => {
        const supabase = createClient();
        const { error } = await supabase.from("goal_contributions").insert(data);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),
  }),
});

export const { useAddGoalMutation, useAddContributionMutation } = goalsApi;
