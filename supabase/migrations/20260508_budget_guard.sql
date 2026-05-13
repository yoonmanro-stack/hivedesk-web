-- ============================================================
-- HiveDesk.ai — Migration: BudgetGuard + 요금제 v2 확정
-- Author  : CTO 뮤즈 (CFO 알렉스 설계 기반)
-- Date    : 2026-05-08
-- ============================================================

-- ① organizations 요금제 constraint 확장 (v2 4-Tier)
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'vvip'));

-- 기존 'premium' → 'vvip' 마이그레이션
UPDATE organizations SET plan = 'vvip' WHERE plan = 'premium';

-- ② hired_skills: quality_grade 컬럼 추가 (API에서 이미 사용 중)
ALTER TABLE hired_skills
  ADD COLUMN IF NOT EXISTS quality_grade VARCHAR(2) DEFAULT 'C'
    CHECK (quality_grade IN ('A', 'B', 'C', 'D'));

-- ③ bot_budgets 테이블 — 조직별 월 AI 예산 (CFO 확정값)
-- Starter $12 / Pro $55 / VVIP $160
CREATE TABLE IF NOT EXISTS bot_budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  monthly_usd NUMERIC(8,2)  NOT NULL DEFAULT 0,
  used_usd    NUMERIC(10,6) NOT NULL DEFAULT 0,
  reset_at    TIMESTAMPTZ   NOT NULL,
  status      VARCHAR(16)   NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'overtime')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_budgets_org ON bot_budgets(org_id);

ALTER TABLE bot_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_bot_budgets"
  ON bot_budgets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ④ token_usage_logs 테이블 — AI 사용량 감사 로그 (append-only)
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  model         VARCHAR(64) NOT NULL,
  input_tokens  INTEGER     NOT NULL DEFAULT 0,
  output_tokens INTEGER     NOT NULL DEFAULT 0,
  cost_usd      NUMERIC(10,6) NOT NULL,
  endpoint      VARCHAR(128),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_org_date
  ON token_usage_logs(org_id, created_at DESC);

ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_token_logs"
  ON token_usage_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ⑤ 원자적 used_usd 증가 함수 (레이스 컨디션 방지)
CREATE OR REPLACE FUNCTION increment_used_usd(p_org_id UUID, p_amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bot_budgets
     SET used_usd   = used_usd + p_amount,
         updated_at = now()
   WHERE org_id = p_org_id;
END;
$$;
