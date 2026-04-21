export const APP_NAME = "SpendIngket";
export const DEFAULT_CURRENCY = "PHP";
export const DEFAULT_TIMEZONE = "Asia/Manila";

export const TRANSACTION_TYPES = {
  EXPENSE: "expense",
  INCOME: "income",
} as const;

export const BUDGET_PERIODS = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export const GOAL_STATUSES = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
} as const;

export const RECURRING_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export const SYSTEM_CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚌",
  Utilities: "💡",
  Entertainment: "🎬",
  Health: "🏥",
  Shopping: "🛍️",
  Housing: "🏠",
  Education: "📚",
  Savings: "🏦",
  Income: "💰",
  Other: "📦",
};
