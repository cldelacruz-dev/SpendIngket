import { formatCurrency, formatPercent } from "@/lib/utils";
import type { SpendingByCategory } from "@/types";

export interface TrendDataPoint {
  label: string;
  income: number;
  expense: number;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  topCategory: SpendingByCategory | null;
}

/**
 * Aggregates raw transaction rows for a single month into a trend data point.
 */
export function computeTrendPoint(
  label: string,
  rows: { type: string; amount: number | string }[]
): TrendDataPoint {
  const income = rows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + Number(r.amount), 0);
  const expense = rows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount), 0);
  return { label, income, expense };
}

/**
 * Computes the analytics summary (income, expense, saving rate, top category)
 * from the period's transaction rows and spending-by-category data.
 */
export function computeAnalyticsSummary(
  rows: { type: string; amount: number | string }[],
  spendingByCategory: SpendingByCategory[]
): AnalyticsSummary {
  const totalIncome = rows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = rows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount), 0);
  const savingRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const topCategory = spendingByCategory[0] ?? null;
  return { totalIncome, totalExpense, savingRate, topCategory };
}

interface NarrativeInput {
  totalIncome: number;
  totalExpense: number;
  savingRate: number;
  topCategory: SpendingByCategory | null;
  month: string;
}

/**
 * Builds a human-readable monthly insight narrative from summary data.
 */
export function buildNarrative({
  totalIncome,
  totalExpense,
  savingRate,
  topCategory,
  month,
}: NarrativeInput): string {
  if (totalExpense === 0 && totalIncome === 0) {
    return `No transactions recorded for ${month}. Start logging your income and expenses to see insights here.`;
  }

  const parts: string[] = [];

  if (totalExpense > 0) {
    parts.push(`You spent ${formatCurrency(totalExpense)} in ${month}.`);
  }
  if (topCategory) {
    parts.push(
      `Your biggest expense category was ${topCategory.category_name} at ${formatPercent(topCategory.percentage)} of total spending.`
    );
  }
  if (savingRate > 0) {
    parts.push(`You saved ${formatPercent(savingRate)} of your income — keep it up.`);
  } else if (savingRate < 0) {
    parts.push(
      `Your expenses exceeded your income this month. Reviewing your top categories may help.`
    );
  }

  return parts.join(" ");
}
