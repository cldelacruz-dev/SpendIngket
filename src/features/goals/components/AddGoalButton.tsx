"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import GoalForm from "./GoalForm";

interface AddGoalButtonProps {
  userId: string;
}

export default function AddGoalButton({ userId }: AddGoalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <Plus className="h-4 w-4" />
        New goal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900" style={{maxHeight: '90dvh'}}>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create Savings Goal
            </h2>
            <GoalForm userId={userId} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
