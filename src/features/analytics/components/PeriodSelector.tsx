"use client";

import { useRouter, usePathname } from "next/navigation";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PeriodSelectorProps {
  currentMonth: string; // "yyyy-MM"
}

export default function PeriodSelector({ currentMonth }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current = new Date(`${currentMonth}-01`);
  const prev = format(subMonths(current, 1), "yyyy-MM");
  const next = format(addMonths(current, 1), "yyyy-MM");
  const isCurrentMonth = currentMonth === format(new Date(), "yyyy-MM");

  function navigate(month: string) {
    router.push(`${pathname}?month=${month}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(prev)}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 text-center">
        {format(current, "MMMM yyyy")}
      </span>
      <button
        onClick={() => navigate(next)}
        disabled={isCurrentMonth}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
