import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TransactionList from "@/features/transactions/components/TransactionList";
import AddTransactionButton from "@/features/transactions/components/AddTransactionButton";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: transactions }, { data: categories }, { data: wallets }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(id, name, icon, color)")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(50),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.eq.${user.id},is_system.eq.true`)
      .order("name"),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Transactions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your income and expenses
          </p>
        </div>
        <AddTransactionButton categories={categories ?? []} userId={user.id} wallets={wallets ?? []} />
      </div>
      <TransactionList transactions={transactions ?? []} categories={categories ?? []} userId={user.id} />
    </div>
  );
}
