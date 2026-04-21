import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TransactionDetail from "@/features/transactions/components/TransactionDetail";

export const metadata: Metadata = { title: "Transaction Detail" };

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: transaction }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(id, name, icon, color)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_system.eq.true`)
      .order("name"),
  ]);

  if (!transaction) notFound();

  return <TransactionDetail transaction={transaction} categories={categories ?? []} />;
}
