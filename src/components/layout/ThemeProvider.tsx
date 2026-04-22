"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    // system — follow prefers-color-scheme
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) => {
      if (dark) root.classList.add("dark");
      else root.classList.remove("dark");
    };
    apply(mq.matches);

    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
