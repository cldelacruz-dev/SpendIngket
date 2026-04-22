import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddLoanButton from "@/features/loans/components/AddLoanButton";
import LoanList from "@/features/loans/components/LoanList";

export const metadata: Metadata = { title: "Loans – SpendIngket" };

export default async function LoansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: loans }, { data: wallets }] = await Promise.all([
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Loans</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your debt and repayment progress
          </p>
        </div>
        <AddLoanButton userId={user.id} wallets={wallets ?? []} />
      </div>

      <LoanList loans={loans ?? []} />
    </div>
  );
}
