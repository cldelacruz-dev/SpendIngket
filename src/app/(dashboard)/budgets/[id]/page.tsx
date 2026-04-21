import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BudgetDetail from "@/features/budgets/components/BudgetDetail";

export const metadata: Metadata = { title: "Budget Detail" };

export default async function BudgetDetailPage({
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

  const { data: budget } = await supabase
    .from("budgets")
    .select("*, budget_allocations(*, categories(id, name, icon, color))")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!budget) notFound();

  // Fetch utilization via RPC
  const { data: utilization } = await supabase.rpc("get_budget_utilization", {
    budget_id: id,
  });

  return <BudgetDetail budget={budget} utilization={utilization ?? []} />;
}
