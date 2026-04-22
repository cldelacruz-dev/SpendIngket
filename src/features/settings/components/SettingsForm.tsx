"use client";

import { useSettingsForm } from "@/features/settings/hooks/useSettingsForm";
import type { UserProfile } from "@/types";
import { Sun, Moon, Monitor } from "lucide-react";
import { useUIStore, type Theme } from "@/stores/useUIStore";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  profile: UserProfile | null;
  userId: string;
  email: string;
}

export default function SettingsForm({ profile, userId, email }: SettingsFormProps) {
  const { theme, setTheme } = useUIStore();
  const {
    displayName, setDisplayName,
    timezone, setTimezone,
    error,
    success,
    loading,
    handleSubmit,
  } = useSettingsForm({ profile, userId });

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Account
        </h2>
        <p className="text-sm text-zinc-500">
          Email: <span className="text-zinc-700 dark:text-zinc-300">{email}</span>
        </p>
      </div>

      {/* Profile form */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="Asia/Manila">Asia/Manila (PHT)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              Profile updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">Appearance</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Choose how SpendIngket looks for you.</p>
        <div className="flex gap-3">
          {([
            { value: "light", label: "Light", icon: Sun },
            { value: "dark",  label: "Dark",  icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ] as { value: Theme; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-4 text-sm font-medium transition-colors",
                theme === value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
