-- 005_wallets_loans_rls.sql
-- Row Level Security policies for wallets and loans tables

-- ============================================================
-- WALLETS
-- ============================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own"
  ON wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_delete_own"
  ON wallets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LOANS
-- ============================================================

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_select_own"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "loans_insert_own"
  ON loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loans_update_own"
  ON loans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loans_delete_own"
  ON loans FOR DELETE
  USING (auth.uid() = user_id);
