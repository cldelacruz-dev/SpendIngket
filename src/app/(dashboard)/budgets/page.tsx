import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BudgetList from "@/features/budgets/components/BudgetList";
import AddBudgetButton from "@/features/budgets/components/AddBudgetButton";

export const metadata: Metadata = { title: "Budgets" };

export default async function BudgetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: budgets }, { data: categories }] = await Promise.all([
    supabase
      .from("budgets")
      .select("*, budget_allocations(*, categories(id, name, icon, color))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_system.eq.true`)
      .eq("type", "expense")
      .order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Budgets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Set limits and track spending by category
          </p>
        </div>
        <AddBudgetButton categories={categories ?? []} userId={user.id} />
      </div>
      <BudgetList budgets={budgets ?? []} userId={user.id} />
    </div>
  );
}
