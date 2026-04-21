import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GoalList from "@/features/goals/components/GoalList";
import AddGoalButton from "@/features/goals/components/AddGoalButton";

export const metadata: Metadata = { title: "Savings Goals" };

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Savings Goals
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Set goals and track your progress
          </p>
        </div>
        <AddGoalButton userId={user.id} />
      </div>
      <GoalList goals={goals ?? []} userId={user.id} />
    </div>
  );
}
