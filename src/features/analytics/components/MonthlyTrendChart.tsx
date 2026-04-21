"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TrendDataPoint {
  label: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: TrendDataPoint[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Income vs Expenses (6 months)
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0)),
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
          <Legend />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income" />
          <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
