import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/features/settings/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account preferences
        </p>
      </div>
      <SettingsForm profile={profile} userId={user.id} email={user.email ?? ""} />
    </div>
  );
}
