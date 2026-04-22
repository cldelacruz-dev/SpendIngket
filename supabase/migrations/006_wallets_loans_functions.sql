-- 006_wallets_loans_functions.sql
-- Atomic SECURITY DEFINER functions for wallet balance management and loan operations.
-- All functions validate ownership via auth.uid() and run atomically.

-- ============================================================
-- 1. add_transaction_with_balance
--    Inserts a transaction and adjusts the wallet balance if
--    wallet_id is provided. Handles income (+) and expense (-).
--    For type='transfer' / 'loan_received' / 'loan_payment'
--    the caller (transfer_between_wallets / create_loan_with_disbursement
--    / make_loan_repayment) manages balance changes directly.
-- ============================================================

CREATE OR REPLACE FUNCTION add_transaction_with_balance(
  p_user_id          UUID,
  p_wallet_id        UUID,          -- nullable
  p_category_id      UUID,
  p_amount           NUMERIC,
  p_type             transaction_type,
  p_description      VARCHAR,
  p_transaction_date DATE,
  p_notes            TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id UUID;
BEGIN
  -- Ownership guard
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate wallet ownership if provided
  IF p_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
  END IF;

  -- Insert transaction
  INSERT INTO transactions (
    user_id, wallet_id, category_id, amount, type,
    description, transaction_date, notes
  ) VALUES (
    p_user_id, p_wallet_id, p_category_id, p_amount, p_type,
    p_description, p_transaction_date, p_notes
  )
  RETURNING id INTO v_tx_id;

  -- Adjust balance only for income/expense (not transfer/loan types)
  IF p_wallet_id IS NOT NULL AND p_type IN ('income', 'expense') THEN
    UPDATE wallets
    SET balance = balance + CASE WHEN p_type = 'income' THEN p_amount ELSE -p_amount END,
        updated_at = NOW()
    WHERE id = p_wallet_id;
  END IF;

  RETURN v_tx_id;
END;
$$;

-- ============================================================
-- 2. update_transaction_with_balance
--    Reverses the old wallet balance effect, updates the row,
--    and applies the new wallet balance effect.
-- ============================================================

CREATE OR REPLACE FUNCTION update_transaction_with_balance(
  p_transaction_id   UUID,
  p_user_id          UUID,
  p_new_wallet_id    UUID,          -- nullable
  p_category_id      UUID,
  p_amount           NUMERIC,
  p_type             transaction_type,
  p_description      VARCHAR,
  p_transaction_date DATE,
  p_notes            TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_wallet_id UUID;
  v_old_amount    NUMERIC;
  v_old_type      transaction_type;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Read old values
  SELECT wallet_id, amount, type
  INTO v_old_wallet_id, v_old_amount, v_old_type
  FROM transactions
  WHERE id = p_transaction_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;

  -- Validate new wallet ownership if provided
  IF p_new_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM wallets WHERE id = p_new_wallet_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
  END IF;

  -- Reverse old wallet effect (income/expense only)
  IF v_old_wallet_id IS NOT NULL AND v_old_type IN ('income', 'expense') THEN
    UPDATE wallets
    SET balance = balance - CASE WHEN v_old_type = 'income' THEN v_old_amount ELSE -v_old_amount END,
        updated_at = NOW()
    WHERE id = v_old_wallet_id;
  END IF;

  -- Update transaction row
  UPDATE transactions
  SET wallet_id        = p_new_wallet_id,
      category_id      = p_category_id,
      amount           = p_amount,
      type             = p_type,
      description      = p_description,
      transaction_date = p_transaction_date,
      notes            = p_notes,
      updated_at       = NOW()
  WHERE id = p_transaction_id AND user_id = auth.uid();

  -- Apply new wallet effect (income/expense only)
  IF p_new_wallet_id IS NOT NULL AND p_type IN ('income', 'expense') THEN
    UPDATE wallets
    SET balance = balance + CASE WHEN p_type = 'income' THEN p_amount ELSE -p_amount END,
        updated_at = NOW()
    WHERE id = p_new_wallet_id;
  END IF;
END;
$$;

-- ============================================================
-- 3. delete_transaction_with_balance
--    Reverses the wallet balance effect and deletes the row.
-- ============================================================

CREATE OR REPLACE FUNCTION delete_transaction_with_balance(
  p_transaction_id UUID,
  p_user_id        UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_amount    NUMERIC;
  v_type      transaction_type;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT wallet_id, amount, type
  INTO v_wallet_id, v_amount, v_type
  FROM transactions
  WHERE id = p_transaction_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;

  -- Reverse balance only for income/expense
  IF v_wallet_id IS NOT NULL AND v_type IN ('income', 'expense') THEN
    UPDATE wallets
    SET balance = balance - CASE WHEN v_type = 'income' THEN v_amount ELSE -v_amount END,
        updated_at = NOW()
    WHERE id = v_wallet_id;
  END IF;

  DELETE FROM transactions WHERE id = p_transaction_id AND user_id = auth.uid();
END;
$$;

-- ============================================================
-- 4. transfer_between_wallets
--    Moves money from one wallet to another atomically.
--    Inserts a single transaction with type='transfer'.
-- ============================================================

CREATE OR REPLACE FUNCTION transfer_between_wallets(
  p_user_id        UUID,
  p_from_wallet_id UUID,
  p_to_wallet_id   UUID,
  p_amount         NUMERIC,
  p_description    VARCHAR,
  p_date           DATE,
  p_notes          TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id      UUID;
  v_from_bal   NUMERIC;
  v_other_cat  UUID;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_from_wallet_id = p_to_wallet_id THEN
    RAISE EXCEPTION 'Source and destination wallets must be different';
  END IF;

  -- Validate ownership of both wallets
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_from_wallet_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Source wallet not found or access denied';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_to_wallet_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Destination wallet not found or access denied';
  END IF;

  -- Check sufficient balance
  SELECT balance INTO v_from_bal FROM wallets WHERE id = p_from_wallet_id;
  IF v_from_bal < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in source wallet';
  END IF;

  -- Get the "Other" system category for transfers
  SELECT id INTO v_other_cat FROM categories WHERE is_system = true AND name = 'Other' LIMIT 1;

  -- Insert transfer transaction (tracks from-wallet; to_wallet_id stored separately)
  INSERT INTO transactions (
    user_id, wallet_id, to_wallet_id, category_id, amount, type,
    description, transaction_date, notes
  ) VALUES (
    p_user_id, p_from_wallet_id, p_to_wallet_id, v_other_cat, p_amount, 'transfer',
    p_description, p_date, p_notes
  )
  RETURNING id INTO v_tx_id;

  -- Update balances
  UPDATE wallets SET balance = balance - p_amount, updated_at = NOW() WHERE id = p_from_wallet_id;
  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW() WHERE id = p_to_wallet_id;

  RETURN v_tx_id;
END;
$$;

-- ============================================================
-- 5. create_loan_with_disbursement
--    Creates a loan record and immediately disburses the
--    principal amount to the specified wallet.
-- ============================================================

CREATE OR REPLACE FUNCTION create_loan_with_disbursement(
  p_user_id         UUID,
  p_name            VARCHAR,
  p_lender          VARCHAR,
  p_principal       NUMERIC,
  p_interest_rate   NUMERIC,        -- nullable
  p_start_date      DATE,
  p_due_date        DATE,           -- nullable
  p_notes           TEXT,           -- nullable
  p_wallet_id       UUID DEFAULT NULL  -- nullable: omit for non-disbursed loans (e.g. housing)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_loan_id    UUID;
  v_other_cat  UUID;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate wallet ownership only when a wallet is provided
  IF p_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
  END IF;

  -- Create loan
  INSERT INTO loans (
    user_id, name, lender, principal_amount, remaining_balance,
    interest_rate, start_date, due_date, status, notes
  ) VALUES (
    p_user_id, p_name, p_lender, p_principal, p_principal,
    p_interest_rate, p_start_date, p_due_date, 'active', p_notes
  )
  RETURNING id INTO v_loan_id;

  -- Only create disbursement transaction when a wallet is specified
  IF p_wallet_id IS NOT NULL THEN
    -- Get system "Other" category
    SELECT id INTO v_other_cat FROM categories WHERE is_system = true AND name = 'Other' LIMIT 1;

    -- Insert loan_received transaction and add to wallet balance
    INSERT INTO transactions (
      user_id, wallet_id, loan_id, category_id, amount, type,
      description, transaction_date
    ) VALUES (
      p_user_id, p_wallet_id, v_loan_id, v_other_cat, p_principal, 'loan_received',
      'Loan received: ' || p_name, p_start_date
    );

    UPDATE wallets
    SET balance = balance + p_principal, updated_at = NOW()
    WHERE id = p_wallet_id;
  END IF;

  RETURN v_loan_id;
END;
$$;

-- ============================================================
-- 6. make_loan_repayment
--    Deducts from a wallet and reduces the loan remaining
--    balance. Marks loan as 'paid' when fully settled.
-- ============================================================

CREATE OR REPLACE FUNCTION make_loan_repayment(
  p_user_id      UUID,
  p_loan_id      UUID,
  p_wallet_id    UUID,
  p_amount       NUMERIC,
  p_payment_date DATE,
  p_notes        TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id         UUID;
  v_wallet_bal    NUMERIC;
  v_remaining_bal NUMERIC;
  v_loan_name     VARCHAR;
  v_other_cat     UUID;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate loan ownership and get details
  SELECT remaining_balance, name
  INTO v_remaining_bal, v_loan_name
  FROM loans
  WHERE id = p_loan_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found or access denied';
  END IF;

  IF p_amount > v_remaining_bal THEN
    RAISE EXCEPTION 'Payment amount exceeds remaining loan balance';
  END IF;

  -- Validate wallet ownership and check balance
  SELECT balance INTO v_wallet_bal
  FROM wallets
  WHERE id = p_wallet_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;

  IF v_wallet_bal < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Get system "Other" category
  SELECT id INTO v_other_cat FROM categories WHERE is_system = true AND name = 'Other' LIMIT 1;

  -- Insert loan_payment transaction
  INSERT INTO transactions (
    user_id, wallet_id, loan_id, category_id, amount, type,
    description, transaction_date, notes
  ) VALUES (
    p_user_id, p_wallet_id, p_loan_id, v_other_cat, p_amount, 'loan_payment',
    'Loan payment: ' || v_loan_name, p_payment_date, p_notes
  )
  RETURNING id INTO v_tx_id;

  -- Deduct from wallet
  UPDATE wallets
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE id = p_wallet_id;

  -- Reduce loan remaining balance; mark paid if fully settled
  UPDATE loans
  SET remaining_balance = remaining_balance - p_amount,
      status = CASE WHEN remaining_balance - p_amount <= 0 THEN 'paid' ELSE status END,
      updated_at = NOW()
  WHERE id = p_loan_id;

  RETURN v_tx_id;
END;
$$;
