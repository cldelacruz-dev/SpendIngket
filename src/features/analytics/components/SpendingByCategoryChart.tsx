"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SpendingByCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

interface SpendingByCategoryChartProps {
  data: SpendingByCategory[];
}

export default function SpendingByCategoryChart({ data }: SpendingByCategoryChartProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Spending by Category
      </h2>

      {data.length === 0 ? (
        <EmptyState
          title="No spending data"
          description="Add transactions to see your category breakdown."
          icon={<BarChart3 className="h-8 w-8" />}
          className="min-h-[200px]"
        />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.category_id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Spent"]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {data.map((d) => (
              <div key={d.category_id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {d.icon} {d.category_name}
                  </span>
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(d.total)}{" "}
                  <span className="text-zinc-400">({d.percentage.toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
