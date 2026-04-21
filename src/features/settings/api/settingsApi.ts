import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { createClient } from "@/lib/supabase/client";

interface UpdateProfilePayload {
  userId: string;
  display_name: string;
  timezone: string;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    updateProfile: builder.mutation<void, UpdateProfilePayload>({
      queryFn: async ({ userId, ...data }) => {
        const supabase = createClient();
        const { error } = await supabase
          .from("users")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", userId);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: undefined };
      },
    }),
  }),
});

export const { useUpdateProfileMutation } = settingsApi;
