import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GoalDetail from "@/features/goals/components/GoalDetail";

export const metadata: Metadata = { title: "Goal Detail" };

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: goal }, { data: contributions }] = await Promise.all([
    supabase
      .from("savings_goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("goal_contributions")
      .select("*")
      .eq("goal_id", id)
      .order("contribution_date", { ascending: false }),
  ]);

  if (!goal) notFound();

  const currentAmount = (contributions ?? []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  return (
    <GoalDetail
      goal={goal}
      contributions={contributions ?? []}
      currentAmount={currentAmount}
      userId={user.id}
    />
  );
}
