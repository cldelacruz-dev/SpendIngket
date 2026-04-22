"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateProfileMutation } from "@/features/settings/api/settingsApi";
import { validateProfileForm } from "@/features/settings/services/settingsService";
import type { UserProfile } from "@/types";

interface UseSettingsFormOptions {
  profile: UserProfile | null;
  userId: string;
}

export function useSettingsForm({ profile, userId }: UseSettingsFormOptions) {
  const router = useRouter();
  const [updateProfile] = useUpdateProfileMutation();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "Asia/Manila");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = validateProfileForm({ display_name: displayName, timezone });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ userId, ...validation.data }).unwrap();
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError((err as { error: string }).error ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return {
    displayName, setDisplayName,
    timezone, setTimezone,
    error,
    success,
    loading,
    handleSubmit,
  };
}
