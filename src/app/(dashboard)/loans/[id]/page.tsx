import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoanDetail from "@/features/loans/components/LoanDetail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Loan ${id.slice(0, 8)} – SpendIngket` };
}

export default async function LoanDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: loan },
    { data: wallets },
    { data: transactions },
  ] = await Promise.all([
    supabase
      .from("loans")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("transactions")
      .select("*, categories(id,name,icon,color), wallets(id,name,color,icon)")
      .eq("user_id", user.id)
      .eq("loan_id", id)
      .order("transaction_date", { ascending: false }),
  ]);

  if (!loan) notFound();

  return (
    <LoanDetail
      loan={loan}
      wallets={wallets ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions={(transactions as any) ?? []}
      userId={user.id}
    />
  );
}
