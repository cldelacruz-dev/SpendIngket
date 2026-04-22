import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AddWalletButton from "@/features/wallets/components/AddWalletButton";
import WalletList from "@/features/wallets/components/WalletList";

export const metadata: Metadata = { title: "Wallets – SpendIngket" };

export default async function WalletsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const totalBalance = (wallets ?? []).reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Wallets</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Total balance:{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ₱{totalBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <AddWalletButton userId={user.id} />
      </div>

      <WalletList wallets={wallets ?? []} />
    </div>
  );
}
