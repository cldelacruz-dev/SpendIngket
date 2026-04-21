-- 001_initial_schema.sql
-- SpendIngket — Full Database Schema (3NF Normalized)

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE transaction_type AS ENUM ('expense', 'income');
CREATE TYPE budget_period_type AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'yearly');
CREATE TYPE category_type AS ENUM ('expense', 'income', 'both');

-- ============================================================
-- CURRENCIES (lookup table — eliminates transitive dependency
-- on users: user_id → currency_code → symbol)
-- ============================================================

CREATE TABLE currencies (
  code   VARCHAR(3)  PRIMARY KEY,
  name   VARCHAR(50) NOT NULL,
  symbol VARCHAR(5)  NOT NULL
);

INSERT INTO currencies (code, name, symbol) VALUES
  ('PHP', 'Philippine Peso', '₱'),
  ('USD', 'US Dollar', '$'),
  ('SGD', 'Singapore Dollar', 'S$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£');

-- ============================================================
-- USERS (profile table extending auth.users)
-- ============================================================

CREATE TABLE users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  currency_code VARCHAR(3)  NOT NULL DEFAULT 'PHP' REFERENCES currencies(code),
  timezone      VARCHAR(50) NOT NULL DEFAULT 'Asia/Manila',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(50)   NOT NULL,
  icon       VARCHAR(50)   NOT NULL,
  color      VARCHAR(7)    NOT NULL,
  type       category_type NOT NULL DEFAULT 'expense',
  is_system  BOOLEAN       NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- System categories (user_id = NULL)
INSERT INTO categories (id, user_id, name, icon, color, type, is_system) VALUES
  (gen_random_uuid(), NULL, 'Food',          '🍔', '#f59e0b', 'expense', true),
  (gen_random_uuid(), NULL, 'Transport',     '🚌', '#3b82f6', 'expense', true),
  (gen_random_uuid(), NULL, 'Utilities',     '💡', '#8b5cf6', 'expense', true),
  (gen_random_uuid(), NULL, 'Entertainment', '🎬', '#ec4899', 'expense', true),
  (gen_random_uuid(), NULL, 'Health',        '🏥', '#ef4444', 'expense', true),
  (gen_random_uuid(), NULL, 'Shopping',      '🛍️', '#f97316', 'expense', true),
  (gen_random_uuid(), NULL, 'Housing',       '🏠', '#06b6d4', 'expense', true),
  (gen_random_uuid(), NULL, 'Education',     '📚', '#84cc16', 'expense', true),
  (gen_random_uuid(), NULL, 'Other',         '📦', '#6b7280', 'expense', true),
  (gen_random_uuid(), NULL, 'Salary',        '💰', '#10b981', 'income',  true),
  (gen_random_uuid(), NULL, 'Freelance',     '💻', '#10b981', 'income',  true),
  (gen_random_uuid(), NULL, 'Investment',    '📈', '#10b981', 'income',  true);

-- ============================================================
-- RECURRING TRANSACTIONS (referenced by transactions)
-- ============================================================

CREATE TABLE recurring_transactions (
  id                   UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id          UUID                 NOT NULL REFERENCES categories(id),
  amount               NUMERIC(12, 2)       NOT NULL CHECK (amount > 0),
  type                 transaction_type     NOT NULL,
  description          VARCHAR(255)         NOT NULL,
  frequency            recurring_frequency  NOT NULL,
  start_date           DATE                 NOT NULL,
  end_date             DATE,
  last_generated_date  DATE,
  is_active            BOOLEAN              NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
  id                       UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id              UUID             NOT NULL REFERENCES categories(id),
  amount                   NUMERIC(12, 2)   NOT NULL CHECK (amount > 0),
  type                     transaction_type NOT NULL,
  description              VARCHAR(255)     NOT NULL,
  transaction_date         DATE             NOT NULL,
  notes                    TEXT,
  recurring_transaction_id UUID             REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- Index for common query patterns
CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON transactions (user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions (user_id, type);

-- ============================================================
-- BUDGETS
-- ============================================================

CREATE TABLE budgets (
  id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100)       NOT NULL,
  period_type budget_period_type NOT NULL,
  start_date  DATE               NOT NULL,
  end_date    DATE,
  is_active   BOOLEAN            NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUDGET ALLOCATIONS (per-category limits, separate from
-- budget metadata — satisfies 3NF: no transitive dependency)
-- ============================================================

CREATE TABLE budget_allocations (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id    UUID           NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id  UUID           NOT NULL REFERENCES categories(id),
  amount_limit NUMERIC(12, 2) NOT NULL CHECK (amount_limit > 0),
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (budget_id, category_id)
);

-- ============================================================
-- SAVINGS GOALS
-- ============================================================

CREATE TABLE savings_goals (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  target_date   DATE,
  icon          VARCHAR(50)  NOT NULL DEFAULT '🎯',
  color         VARCHAR(7)   NOT NULL DEFAULT '#10b981',
  status        goal_status  NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- NOTE: current_amount is NOT stored here — it is computed via
-- SUM(goal_contributions.amount) to prevent update anomalies (3NF).

-- ============================================================
-- GOAL CONTRIBUTIONS
-- ============================================================

CREATE TABLE goal_contributions (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id           UUID           NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount            NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  contribution_date DATE           NOT NULL DEFAULT CURRENT_DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goal_contributions_goal ON goal_contributions (goal_id);

-- ============================================================
-- TRIGGER: auto-updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_budget_allocations_updated_at
  BEFORE UPDATE ON budget_allocations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER: auto-complete savings goal when target is reached
-- ============================================================

CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_total      NUMERIC;
  v_target     NUMERIC;
BEGIN
  SELECT SUM(amount) INTO v_total
  FROM goal_contributions
  WHERE goal_id = NEW.goal_id;

  SELECT target_amount INTO v_target
  FROM savings_goals
  WHERE id = NEW.goal_id;

  IF v_total >= v_target THEN
    UPDATE savings_goals
    SET status = 'completed', updated_at = NOW()
    WHERE id = NEW.goal_id AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_goal_completion
  AFTER INSERT ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- ============================================================
-- TRIGGER: create user profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
