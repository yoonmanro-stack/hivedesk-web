-- ============================================================
-- HiveDesk.ai — Migration v3.0: 채용 시스템 + 3-Tier 요금제
-- Author  : Ops Team
-- Date    : 2026-04-29
-- ============================================================

-- ① plan 컬럼 확장: standard/vvip → free/pro/premium
-- users 테이블
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'pro', 'premium'));
UPDATE users SET plan = 'free' WHERE plan = 'standard';
UPDATE users SET plan = 'pro'  WHERE plan = 'vvip';

-- workspaces 테이블
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_plan_check;
ALTER TABLE workspaces ADD CONSTRAINT workspaces_plan_check
  CHECK (plan IN ('free', 'pro', 'premium'));
UPDATE workspaces SET plan = 'free' WHERE plan = 'standard';
UPDATE workspaces SET plan = 'pro'  WHERE plan = 'vvip';

-- organizations 테이블
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'premium'));
UPDATE organizations SET plan = 'free' WHERE plan = 'standard';
UPDATE organizations SET plan = 'pro'  WHERE plan = 'vvip';

-- ② hired_skills 테이블 신규 생성
CREATE TABLE IF NOT EXISTS hired_skills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hired_by        UUID NOT NULL REFERENCES users(id),
  assigned_exec   VARCHAR(32) NOT NULL DEFAULT 'cto'
                    CHECK (assigned_exec IN ('cto','cmo','cpo','cs','cdo')),
  -- SkillsMuse 스킬 정보
  skill_id        TEXT,
  skill_name      TEXT NOT NULL,
  skill_category  VARCHAR(60) NOT NULL,
  difficulty      VARCHAR(16) DEFAULT 'intermediate',
  quality_score   INTEGER DEFAULT 0,
  -- 상태
  status          VARCHAR(16) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','suspended','dismissed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hired_skills_org_exec
  ON hired_skills (org_id, assigned_exec, status);

-- RLS
ALTER TABLE hired_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_hired_skills"
  ON hired_skills FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "members_select_own_hired_skills"
  ON hired_skills FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)
    )
  );
