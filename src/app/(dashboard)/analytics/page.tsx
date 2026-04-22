import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import SpendingByCategoryChart from "@/features/analytics/components/SpendingByCategoryChart";
import MonthlyTrendChart from "@/features/analytics/components/MonthlyTrendChart";
import InsightCard from "@/features/analytics/components/InsightCard";
import PeriodSelector from "@/features/analytics/components/PeriodSelector";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const refDate = month ? new Date(`${month}-01`) : new Date();
  const periodStart = format(startOfMonth(refDate), "yyyy-MM-dd");
  const periodEnd = format(endOfMonth(refDate), "yyyy-MM-dd");

  // Build last-6-months trend data
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(refDate, 5 - i);
    return {
      label: format(d, "MMM"),
      start: format(startOfMonth(d), "yyyy-MM-dd"),
      end: format(endOfMonth(d), "yyyy-MM-dd"),
    };
  });

  const [spendingByCategoryResult, trendResults, summaryResult] = await Promise.all([
    supabase.rpc("get_spending_by_category", {
      p_start_date: periodStart,
      p_end_date: periodEnd,
    }),
    Promise.all(
      trendMonths.map(({ start, end }) =>
        supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("transaction_date", start)
          .lte("transaction_date", end)
      )
    ),
    supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id)
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd),
  ]);

  const spendingByCategory = spendingByCategoryResult.data ?? [];

  const trendData = trendMonths.map(({ label }, i) => {
    const rows = trendResults[i].data ?? [];
    const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
    return { label, income, expense };
  });

  const summaryRows = summaryResult.data ?? [];
  const totalIncome = summaryRows.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = summaryRows.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
  const savingRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const topCategory = spendingByCategory[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Understand your spending patterns
          </p>
        </div>
        <PeriodSelector currentMonth={format(refDate, "yyyy-MM")} />
      </div>

      <InsightCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        savingRate={savingRate}
        topCategory={topCategory}
        month={format(refDate, "MMMM yyyy")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingByCategoryChart data={spendingByCategory} />
        <MonthlyTrendChart data={trendData} />
      </div>
    </div>
  );
}
