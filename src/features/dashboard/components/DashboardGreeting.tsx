"use client";

import { useMemo } from "react";
import Image from "next/image";
import chatbotImg from "@/assets/chatbot.png";
import {
  getGreeting,
  getTodayLabel,
} from "@/features/dashboard/services/dashboardService";

interface DashboardGreetingProps {
  displayName: string;
  message: string;
}

export default function DashboardGreeting({
  displayName,
  message,
}: DashboardGreetingProps) {
  const greeting = useMemo(() => getGreeting(), []);
  const today = useMemo(() => getTodayLabel(), []);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold tracking-widest text-zinc-400 dark:text-zinc-500">
          {today}
        </p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {greeting}, <span>{displayName}!</span>
        </p>
      </div>

      <div className="flex items-end overflow-hidden rounded-2xl bg-emerald-600">
        <Image
          src={chatbotImg}
          alt="Dr. Yoshi"
          width={110}
          height={110}
          className="ml-4 mt-3 flex-shrink-0 self-end object-contain"
          priority
        />
        <div className="mx-4 my-4 flex-1 rounded-2xl bg-white p-4 dark:bg-zinc-900">
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Dr. Yoshi
          </p>
          <p className="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-300">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
