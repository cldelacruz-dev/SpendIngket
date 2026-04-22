-- 004_wallets_loans_schema.sql
-- Adds wallet and loan tracking tables with atomic balance management

-- ============================================================
-- NEW ENUMS
-- ============================================================

CREATE TYPE wallet_type AS ENUM ('debit', 'credit', 'bank', 'cash', 'ewallet');
CREATE TYPE loan_status AS ENUM ('active', 'paid', 'overdue');

-- Extend transaction_type with wallet/loan transaction kinds
-- (ALTER TYPE ADD VALUE is non-transactional but safe here as a migration)
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'transfer';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'loan_received';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'loan_payment';

-- ============================================================
-- WALLETS
-- ============================================================

CREATE TABLE wallets (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       wallet_type  NOT NULL,
  balance    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  color      VARCHAR(7)   NOT NULL DEFAULT '#10b981',
  icon       VARCHAR(50)  NOT NULL DEFAULT '💳',
  notes      TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets (user_id);

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- LOANS
-- ============================================================

CREATE TABLE loans (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,
  lender            VARCHAR(100) NOT NULL,
  principal_amount  NUMERIC(12, 2) NOT NULL CHECK (principal_amount > 0),
  remaining_balance NUMERIC(12, 2) NOT NULL CHECK (remaining_balance >= 0),
  interest_rate     NUMERIC(5, 2),               -- nullable: annual %, e.g. 12.50
  start_date        DATE         NOT NULL,
  due_date          DATE,
  status            loan_status  NOT NULL DEFAULT 'active',
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loans_user ON loans (user_id);

CREATE TRIGGER trg_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ALTER TRANSACTIONS — add wallet & loan columns
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN wallet_id    UUID REFERENCES wallets(id) ON DELETE SET NULL,
  ADD COLUMN to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  ADD COLUMN loan_id      UUID REFERENCES loans(id)   ON DELETE SET NULL;

CREATE INDEX idx_transactions_wallet ON transactions (wallet_id) WHERE wallet_id IS NOT NULL;
CREATE INDEX idx_transactions_loan   ON transactions (loan_id)   WHERE loan_id   IS NOT NULL;
