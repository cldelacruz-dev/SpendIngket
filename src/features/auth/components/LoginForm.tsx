"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { User, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";
import titleImg from "@/assets/title.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex w-full overflow-hidden rounded-2xl shadow-xl">
      {/* Left: Form panel */}
      <div className="flex-1 bg-white px-10 py-12">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-foreground">
          Login
        </h1>
        <p className="mt-2 text-sm text-slate/60">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate/5 px-4 py-3">
            <User className="h-4 w-4 shrink-0 text-slate/40" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="flex-1 bg-transparent text-sm text-foreground placeholder-slate/40 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate/5 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-slate/40" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="flex-1 bg-transparent text-sm text-foreground placeholder-slate/40 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login Now"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate/60">
          {"Don't have an account? "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>

      {/* Right: Decorative panel */}
      <div className="relative hidden w-80 overflow-hidden rounded-r-2xl bg-background md:flex md:flex-col md:items-center md:justify-between py-10">
        {/* Title image — centered */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={titleImg.src} alt={APP_NAME} className="max-w-[400px] object-contain" />
        </div>
        {/* Tagline — pinned to bottom */}
        <div className="relative z-10 mx-6 rounded-full bg-white px-3 py-2 text-center shadow">
          <p className="text-[11px] leading-snug text-foreground">
            <span className="mr-1">🩷</span>
            A{" "}
            <span className="font-semibold" style={{ color: "#F06292" }}>Personal</span>
            {" "}Spending Kit for a{" "}
            <span className="font-semibold" style={{ color: "#3B76F6" }}>Smarter</span>
            {" "}You.
          </p>
        </div>
      </div>
    </div>
  );
}