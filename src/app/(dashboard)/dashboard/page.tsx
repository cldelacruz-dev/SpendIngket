import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { startOfMonth, endOfMonth, format } from "date-fns";
import DashboardStats from "@/features/analytics/components/DashboardStats";
import RecentTransactions from "@/features/transactions/components/RecentTransactions";
import BudgetOverview from "@/features/budgets/components/BudgetOverview";
import GoalsSummary from "@/features/goals/components/GoalsSummary";
import DashboardGreeting from "@/features/dashboard/components/DashboardGreeting";
import { buildDrYoshiAIMessage } from "@/features/dashboard/services/aiDashboardService";
import WalletOverview from "@/features/wallets/components/WalletOverview";
import LoansSummary from "@/features/loans/components/LoansSummary";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const periodStart = format(startOfMonth(now), "yyyy-MM-dd");
  const periodEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const [
    { data: transactions },
    { data: budgets },
    { data: goals },
    { data: profile },
    { data: wallets },
    { data: activeLoans },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(id, name, icon, color)")
      .eq("user_id", user.id)
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)
      .order("transaction_date", { ascending: false }),
    supabase
      .from("budgets")
      .select("*, budget_allocations(*, categories(id, name, icon, color))")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(3),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(3),
    supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(3),
  ]);

  const allTransactions = transactions ?? [];
  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const displayName = profile?.display_name ?? "there";

  const savingRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Find top expense category from this month's transactions
  const categoryTotals: Record<string, { name: string; total: number }> = {};
  for (const t of allTransactions) {
    if (t.type === "expense" && t.categories) {
      const cat = t.categories as { id: string; name: string };
      if (!categoryTotals[cat.id]) {
        categoryTotals[cat.id] = { name: cat.name, total: 0 };
      }
      categoryTotals[cat.id].total += Number(t.amount);
    }
  }
  const topCategory =
    Object.values(categoryTotals).sort((a, b) => b.total - a.total)[0]?.name ??
    null;

  const message = await buildDrYoshiAIMessage({
    displayName,
    totalIncome,
    totalExpense,
    savingRate,
    topCategory,
    activeLoansCount: activeLoans?.length ?? 0,
    activeGoalsCount: goals?.length ?? 0,
    month: format(now, "MMMM"),
  });

  return (
    <div className="space-y-6">
      <DashboardGreeting displayName={displayName} message={message} />

      <WalletOverview wallets={wallets ?? []} />

      <DashboardStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        net={totalIncome - totalExpense}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions transactions={allTransactions.slice(0, 5)} />
        <BudgetOverview budgets={budgets ?? []} />
      </div>

      <LoansSummary loans={activeLoans ?? []} />

      <GoalsSummary goals={goals ?? []} />
    </div>
  );
}
