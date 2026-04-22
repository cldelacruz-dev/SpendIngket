import type { Database } from "./database.types";

// Table row types
export type Currency = Database["public"]["Tables"]["currencies"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetAllocation = Database["public"]["Tables"]["budget_allocations"]["Row"];
export type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
export type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];
export type RecurringTransaction = Database["public"]["Tables"]["recurring_transactions"]["Row"];
export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type Loan = Database["public"]["Tables"]["loans"]["Row"];

// Insert types
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
export type BudgetAllocationInsert = Database["public"]["Tables"]["budget_allocations"]["Insert"];
export type SavingsGoalInsert = Database["public"]["Tables"]["savings_goals"]["Insert"];
export type GoalContributionInsert = Database["public"]["Tables"]["goal_contributions"]["Insert"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type WalletInsert = Database["public"]["Tables"]["wallets"]["Insert"];
export type WalletUpdate = Database["public"]["Tables"]["wallets"]["Update"];
export type LoanInsert = Database["public"]["Tables"]["loans"]["Insert"];
export type LoanUpdate = Database["public"]["Tables"]["loans"]["Update"];

// Update types
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];
export type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];
export type SavingsGoalUpdate = Database["public"]["Tables"]["savings_goals"]["Update"];
export type UserProfileUpdate = Database["public"]["Tables"]["users"]["Update"];

// Enum types
export type TransactionType = "expense" | "income" | "transfer" | "loan_received" | "loan_payment";
export type BudgetPeriodType = "weekly" | "monthly" | "yearly";
export type GoalStatus = "active" | "completed" | "paused" | "cancelled";
export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
export type CategoryType = "expense" | "income" | "both";
export type WalletType = "debit" | "credit" | "bank" | "cash" | "ewallet";
export type LoanStatus = "active" | "paid" | "overdue";

// Composite/enriched types
export type TransactionWithCategory = Transaction & {
  categories: Pick<Category, "id" | "name" | "icon" | "color">;
};

export type TransactionWithWalletAndCategory = Transaction & {
  categories: Pick<Category, "id" | "name" | "icon" | "color">;
  wallets: Pick<Wallet, "id" | "name" | "color" | "icon"> | null;
};

export type BudgetWithAllocations = Budget & {
  budget_allocations: (BudgetAllocation & {
    categories: Pick<Category, "id" | "name" | "icon" | "color">;
  })[];
};

export type BudgetUtilization = {
  category_id: string;
  category_name: string;
  color: string;
  icon: string;
  amount_limit: number;
  amount_spent: number;
  utilization_pct: number;
};

export type GoalWithProgress = SavingsGoal & {
  current_amount: number;
  progress_pct: number;
};

export type SpendingByCategory = {
  category_id: string;
  category_name: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
};

export type MonthlySummary = {
  total_income: number;
  total_expense: number;
  net: number;
  saving_rate: number;
  top_category: SpendingByCategory | null;
};

export type WalletWithBalance = Wallet & {
  // balance is stored directly on the wallet row
};

export type LoanWithProgress = Loan & {
  repayment_pct: number; // (principal - remaining) / principal * 100
};
