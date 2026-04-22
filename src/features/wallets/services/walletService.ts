import { z } from "zod";
import type { WalletType } from "@/types";

// ── Constants ───────────────────────────────────────────────────────────────

export const WALLET_TYPES: {
  value: WalletType;
  label: string;
  icon: string;
  description: string;
}[] = [
  { value: "debit",   label: "Debit Card",   icon: "💳", description: "ATM / debit card" },
  { value: "credit",  label: "Credit Card",  icon: "🏦", description: "Credit card account" },
  { value: "bank",    label: "Bank Account", icon: "🏛️", description: "Savings / checking account" },
  { value: "cash",    label: "Cash",         icon: "💵", description: "Physical cash on hand" },
  { value: "ewallet", label: "E-Wallet",     icon: "📱", description: "GCash, PayMaya, etc." },
];

export const WALLET_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
] as const;

export const WALLET_TYPE_ICONS: Record<WalletType, string> = {
  debit:   "💳",
  credit:  "🏦",
  bank:    "🏛️",
  cash:    "💵",
  ewallet: "📱",
};

// ── Validation schemas ──────────────────────────────────────────────────────

export const walletSchema = z.object({
  name:    z.string().min(1, "Wallet name is required").max(100),
  type:    z.enum(["debit", "credit", "bank", "cash", "ewallet"]),
  balance: z.number().min(0, "Balance must be 0 or more"),
  color:   z.string().default("#10b981"),
  icon:    z.string().default("💳"),
  notes:   z.string().max(1000).optional(),
});

export const transferSchema = z.object({
  from_wallet_id: z.string().uuid("Select source wallet"),
  to_wallet_id:   z.string().uuid("Select destination wallet"),
  amount:         z.number().positive("Amount must be positive"),
  description:    z.string().min(1, "Description is required").max(255),
  date:           z.string(),
  notes:          z.string().max(1000).optional(),
});

export type WalletFormData = z.infer<typeof walletSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;

// ── Validation helpers ──────────────────────────────────────────────────────

export function validateWalletForm(raw: {
  name: string;
  type: string;
  balance: string;
  color: string;
  icon: string;
  notes: string;
}): { success: true; data: WalletFormData } | { success: false; error: string } {
  const result = walletSchema.safeParse({
    ...raw,
    balance: raw.balance === "" ? 0 : parseFloat(raw.balance),
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}

export function validateTransferForm(raw: {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: string;
  description: string;
  date: string;
  notes: string;
}): { success: true; data: TransferFormData } | { success: false; error: string } {
  if (raw.from_wallet_id && raw.from_wallet_id === raw.to_wallet_id) {
    return { success: false, error: "Source and destination wallets must be different" };
  }
  const result = transferSchema.safeParse({
    ...raw,
    amount: parseFloat(raw.amount),
    notes: raw.notes || undefined,
  });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }
  return { success: true, data: result.data };
}
