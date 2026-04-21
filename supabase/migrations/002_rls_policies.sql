-- 002_rls_policies.sql
-- Row Level Security for all tables

-- ============================================================
-- Enable RLS
-- ============================================================

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- currencies: readable by all authenticated users
-- ============================================================

CREATE POLICY "currencies_read_all"
  ON currencies FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- users: own row only
-- ============================================================

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- categories: system categories visible to all; user categories own only
-- ============================================================

CREATE POLICY "categories_select"
  ON categories FOR SELECT
  TO authenticated
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "categories_insert_own"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_system = false AND auth.uid() = user_id);

CREATE POLICY "categories_update_own"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_system = false AND auth.uid() = user_id)
  WITH CHECK (is_system = false AND auth.uid() = user_id);

CREATE POLICY "categories_delete_own"
  ON categories FOR DELETE
  TO authenticated
  USING (is_system = false AND auth.uid() = user_id);

-- ============================================================
-- transactions: own rows only
-- ============================================================

CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- budgets: own rows only
-- ============================================================

CREATE POLICY "budgets_select_own"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_own"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_own"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_delete_own"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- budget_allocations: ownership via parent budget
-- ============================================================

CREATE POLICY "budget_allocations_select_own"
  ON budget_allocations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_allocations_insert_own"
  ON budget_allocations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_allocations_update_own"
  ON budget_allocations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_allocations_delete_own"
  ON budget_allocations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_id AND b.user_id = auth.uid()
    )
  );

-- ============================================================
-- savings_goals: own rows only
-- ============================================================

CREATE POLICY "savings_goals_select_own"
  ON savings_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "savings_goals_insert_own"
  ON savings_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_update_own"
  ON savings_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_delete_own"
  ON savings_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- goal_contributions: own rows, and goal must belong to user
-- ============================================================

CREATE POLICY "goal_contributions_select_own"
  ON goal_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "goal_contributions_insert_own"
  ON goal_contributions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM savings_goals g
      WHERE g.id = goal_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "goal_contributions_update_own"
  ON goal_contributions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goal_contributions_delete_own"
  ON goal_contributions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- recurring_transactions: own rows only
-- ============================================================

CREATE POLICY "recurring_transactions_select_own"
  ON recurring_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "recurring_transactions_insert_own"
  ON recurring_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_transactions_update_own"
  ON recurring_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_transactions_delete_own"
  ON recurring_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
