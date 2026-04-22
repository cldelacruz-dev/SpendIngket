import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WalletDetail from "@/features/wallets/components/WalletDetail";

export const metadata: Metadata = { title: "Wallet – SpendIngket" };

export default async function WalletDetailPage({
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

  const [
    { data: wallet },
    { data: wallets },
    { data: transactions },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("*, categories(id, name, icon, color), wallets(id, name, color, icon)")
      .eq("user_id", user.id)
      .eq("wallet_id", id)
      .order("transaction_date", { ascending: false })
      .limit(100),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_system.eq.true`)
      .order("name"),
  ]);

  if (!wallet) notFound();

  return (
    <WalletDetail
      wallet={wallet}
      wallets={wallets ?? []}
      transactions={(transactions ?? []) as never}
      categories={categories ?? []}
      userId={user.id}
    />
  );
}
