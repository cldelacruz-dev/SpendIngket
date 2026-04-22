"use client";

import { useWalletForm } from "@/features/wallets/hooks/useWalletForm";
import {
  WALLET_TYPES,
  WALLET_COLORS,
  WALLET_TYPE_ICONS,
} from "@/features/wallets/services/walletService";
import type { Wallet, WalletType } from "@/types";

const INPUT_CLS =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

interface WalletFormProps {
  userId: string;
  wallet?: Wallet;
  onClose?: () => void;
}

export default function WalletForm({ userId, wallet, onClose }: WalletFormProps) {
  const {
    name, setName,
    type, handleTypeChange,
    balance, setBalance,
    color, setColor,
    icon, setIcon,
    notes, setNotes,
    isEdit,
    error,
    loading,
    handleSubmit,
  } = useWalletForm({ userId, wallet, onClose });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Wallet name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={INPUT_CLS}
          placeholder="e.g. GCash, BDO Savings"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Wallet type
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {WALLET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value as WalletType)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors text-left ${
                type === t.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <span>{t.icon}</span>
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Initial balance (only on create) */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Starting balance (₱)
          </label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            min="0"
            step="0.01"
            className={INPUT_CLS}
            placeholder="0.00"
          />
        </div>
      )}

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {WALLET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(WALLET_TYPE_ICONS).map(([, emoji]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`h-9 w-9 rounded-lg border text-lg transition-colors ${
                icon === emoji
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                  : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={INPUT_CLS}
          placeholder="Any details about this wallet…"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save changes" : "Add wallet"}
        </button>
      </div>
    </form>
  );
}
