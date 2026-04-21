"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BudgetForm from "./BudgetForm";
import type { Category } from "@/types";

interface AddBudgetButtonProps {
  categories: Category[];
  userId: string;
}

export default function AddBudgetButton({ categories, userId }: AddBudgetButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <Plus className="h-4 w-4" />
        New budget
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create Budget
            </h2>
            <BudgetForm
              userId={userId}
              categories={categories}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
