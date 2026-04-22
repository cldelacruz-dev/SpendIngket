import { z } from "zod";

// ── Validation schemas ──────────────────────────────────────────────────────

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  timezone: z.string().min(1),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ── Validation helper ───────────────────────────────────────────────────────

export function validateProfileForm(raw: {
  display_name: string;
  timezone: string;
}): { success: true; data: ProfileFormData } | { success: false; error: string } {
  const result = profileSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}
