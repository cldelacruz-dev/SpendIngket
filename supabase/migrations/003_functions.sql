-- 003_functions.sql
-- RPC functions for computed aggregates used by the app

-- ============================================================
-- get_goal_progress(goal_id)
-- Returns progress for a single savings goal
-- ============================================================

CREATE OR REPLACE FUNCTION get_goal_progress(goal_id UUID)
RETURNS TABLE (
  goal_id          UUID,
  goal_name        VARCHAR,
  target_amount    NUMERIC,
  current_amount   NUMERIC,
  remaining        NUMERIC,
  progress_percent NUMERIC,
  status           goal_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    g.id                                              AS goal_id,
    g.name                                            AS goal_name,
    g.target_amount,
    COALESCE(SUM(gc.amount), 0)                       AS current_amount,
    GREATEST(g.target_amount - COALESCE(SUM(gc.amount), 0), 0) AS remaining,
    ROUND(
      LEAST(COALESCE(SUM(gc.amount), 0) / NULLIF(g.target_amount, 0) * 100, 100),
      2
    )                                                 AS progress_percent,
    g.status
  FROM savings_goals g
  LEFT JOIN goal_contributions gc ON gc.goal_id = g.id
  WHERE g.id = get_goal_progress.goal_id
    AND g.user_id = auth.uid()
  GROUP BY g.id;
$$;

-- ============================================================
-- get_budget_utilization(budget_id)
-- Returns per-allocation spending vs limit for a budget
-- ============================================================

CREATE OR REPLACE FUNCTION get_budget_utilization(budget_id UUID)
RETURNS TABLE (
  allocation_id    UUID,
  category_id      UUID,
  category_name    VARCHAR,
  color            VARCHAR,
  icon             VARCHAR,
  amount_limit     NUMERIC,
  amount_spent     NUMERIC,
  remaining        NUMERIC,
  utilization_pct  NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ba.id                                               AS allocation_id,
    c.id                                                AS category_id,
    c.name                                              AS category_name,
    c.color                                             AS color,
    c.icon                                              AS icon,
    ba.amount_limit,
    COALESCE(SUM(t.amount), 0)                         AS amount_spent,
    GREATEST(ba.amount_limit - COALESCE(SUM(t.amount), 0), 0) AS remaining,
    ROUND(
      LEAST(COALESCE(SUM(t.amount), 0) / NULLIF(ba.amount_limit, 0) * 100, 100),
      2
    )                                                   AS utilization_pct
  FROM budget_allocations ba
  JOIN categories c ON c.id = ba.category_id
  JOIN budgets b ON b.id = ba.budget_id
  LEFT JOIN transactions t ON
    t.user_id = b.user_id AND
    t.category_id = ba.category_id AND
    t.type = 'expense' AND
    t.transaction_date >= b.start_date AND
    (b.end_date IS NULL OR t.transaction_date <= b.end_date)
  WHERE ba.budget_id = get_budget_utilization.budget_id
    AND b.user_id = auth.uid()
  GROUP BY ba.id, c.id, c.name, c.color, c.icon, ba.amount_limit;
$$;

-- ============================================================
-- get_spending_by_category(p_start, p_end)
-- Returns spending totals per category for a date range
-- ============================================================

CREATE OR REPLACE FUNCTION get_spending_by_category(
  p_start_date DATE,
  p_end_date   DATE
)
RETURNS TABLE (
  category_id   UUID,
  category_name VARCHAR,
  icon          VARCHAR,
  color         VARCHAR,
  total         NUMERIC,
  percentage    NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH totals AS (
    SELECT
      c.id    AS category_id,
      c.name  AS category_name,
      c.icon,
      c.color,
      SUM(t.amount) AS total
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = auth.uid()
      AND t.type = 'expense'
      AND t.transaction_date >= p_start_date
      AND t.transaction_date <= p_end_date
    GROUP BY c.id, c.name, c.icon, c.color
  ),
  grand AS (
    SELECT COALESCE(SUM(total), 0) AS grand_total FROM totals
  )
  SELECT
    totals.category_id,
    totals.category_name,
    totals.icon,
    totals.color,
    totals.total,
    CASE WHEN grand.grand_total > 0
      THEN ROUND(totals.total / grand.grand_total * 100, 2)
      ELSE 0
    END AS percentage
  FROM totals, grand
  ORDER BY totals.total DESC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_goal_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_budget_utilization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_spending_by_category(DATE, DATE) TO authenticated;
