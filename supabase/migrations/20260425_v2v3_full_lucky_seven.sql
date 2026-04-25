-- ============================================================
-- HiveDesk.ai — v2+v3 통합 마이그레이션 "Lucky Seven"
-- v1(users/workspaces/onboarding) 적용 후 실행
-- 포함: organizations → org_members → projects → tasks
--       plans → executives → org_executives → team_members → audit_logs
-- Author  : Ops Team Lead
-- Date    : 2026-04-25
-- ============================================================

-- ============================================================
-- STEP 1: users.plan 확장 (기존 v1 테이블 수정)
-- ============================================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users 
  ADD CONSTRAINT users_plan_check 
  CHECK (plan IN ('free', 'starter', 'pro', 'vvip'));
UPDATE users SET plan = 'free' WHERE plan = 'standard';

-- ============================================================
-- STEP 2: plans — 요금제 정의
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id                  VARCHAR(16) PRIMARY KEY,
  name                VARCHAR(32) NOT NULL,
  price_usd           NUMERIC(8,2) NOT NULL DEFAULT 0,
  max_executives      INT NOT NULL DEFAULT 3,
  max_team_per_exec   INT,  -- NULL = 무제한
  max_tft_groups      INT,  -- NULL = 무제한
  monthly_token_usd   NUMERIC(8,2) NOT NULL DEFAULT 0,
  has_premium_skills  BOOLEAN NOT NULL DEFAULT false,
  has_find_skill      BOOLEAN NOT NULL DEFAULT false,
  has_auto_hire       BOOLEAN NOT NULL DEFAULT false,
  has_audit_log       BOOLEAN NOT NULL DEFAULT false,
  has_debate_system   BOOLEAN NOT NULL DEFAULT false,
  has_sandbox         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (id, name, price_usd, max_executives, max_team_per_exec, max_tft_groups, monthly_token_usd, has_premium_skills, has_find_skill, has_auto_hire, has_audit_log, has_debate_system, has_sandbox)
VALUES
  ('free',    'Free',    0.00,   3, 0,    1,    0.00,   false, false, false, false, false, false),
  ('starter', 'Starter', 29.00,  7, 5,    3,    50.00,  false, true,  false, false, false, false),
  ('pro',     'Pro',     79.00,  7, NULL, NULL,  200.00, true,  true,  true,  true,  true,  false),
  ('vvip',    'VVIP',    299.00, 7, NULL, NULL,  500.00, true,  true,  true,  true,  true,  true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: executives — 럭키세븐 임원 마스터
-- ============================================================
CREATE TABLE IF NOT EXISTS executives (
  id          VARCHAR(8)   PRIMARY KEY,
  title       VARCHAR(32)  NOT NULL,
  title_ko    VARCHAR(32)  NOT NULL,
  emoji       VARCHAR(4)   NOT NULL,
  description TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT true
);

INSERT INTO executives (id, title, title_ko, emoji, description, sort_order)
VALUES
  ('cto',  'Chief Technology Officer',   '기술 임원',   '⚙️', '코드 작성, 아키텍처 설계, 배포 자동화, 기술 스택 관리',          1),
  ('cmo',  'Chief Marketing Officer',    '마케팅 임원', '📢', 'SNS 마케팅, SEO, 광고 집행, 콘텐츠 전략, 그로스 해킹',          2),
  ('cfo',  'Chief Financial Officer',    '재무 임원',   '💰', 'AI 토큰 예산 관리, 비용 분석, ROI 추적, 수익 리포트',            3),
  ('cpo',  'Chief Product Officer',      '제품 임원',   '🎨', '제품 기획, UX 설계, 사용자 리서치, 기능 우선순위 관리',           4),
  ('coo',  'Chief Operating Officer',    '운영 임원',   '🏭', '고객 지원, 물류 관리, 일상 운영, 프로세스 최적화',               5),
  ('chro', 'Chief HR Officer',           '채용 임원',   '🔍', 'SkillsMuse 4,500+ 인재풀에서 팀원 검색·추천·채용·배치',         6),
  ('cao',  'Chief Audit Officer',        '감사 임원',   '🛡️', '행동 감사 로그, 비용 이상 감지, 컴플라이언스, 월간 리포트',      7)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 4: organizations (v2 원본 + plan CHECK 수정)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name                VARCHAR(60) NOT NULL,
  slug                VARCHAR(60) UNIQUE NOT NULL,
  plan                VARCHAR(16) NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free', 'starter', 'pro', 'vvip')),
  industry            VARCHAR(32),
  telegram_group_id   BIGINT,
  sandbox_status      VARCHAR(16) NOT NULL DEFAULT 'idle'
                        CHECK (sandbox_status IN ('idle', 'provisioning', 'active', 'failed')),
  monthly_budget_usd  NUMERIC(10, 2) NOT NULL DEFAULT 30.00
                        CHECK (monthly_budget_usd >= 0),
  budget_used_usd     NUMERIC(10, 2) NOT NULL DEFAULT 0.00
                        CHECK (budget_used_usd >= 0),
  budget_reset_at     TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  ai_executives       JSONB       NOT NULL DEFAULT '["cto","cmo","chro"]'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT organizations_name_not_empty CHECK (trim(name) <> ''),
  CONSTRAINT organizations_slug_format    CHECK (slug ~ '^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$'),
  CONSTRAINT organizations_budget_check   CHECK (budget_used_usd <= monthly_budget_usd * 1.1)
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations (owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug     ON organizations (slug);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- STEP 5: organization_members
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  role        VARCHAR(16) NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at   TIMESTAMPTZ,

  UNIQUE (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id  ON organization_members (org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members (user_id);

-- ============================================================
-- STEP 6: org_executives — 조직별 임원 배치
-- ============================================================
CREATE TABLE IF NOT EXISTS org_executives (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  executive_id  VARCHAR(8)  NOT NULL REFERENCES executives(id),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  system_prompt TEXT,
  activated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (org_id, executive_id)
);

CREATE INDEX IF NOT EXISTS idx_org_executives_org_id ON org_executives (org_id);

-- ============================================================
-- STEP 7: team_members — SkillsMuse 기반 팀원
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  executive_id    VARCHAR(8)   NOT NULL REFERENCES executives(id),
  skill_id        VARCHAR(128) NOT NULL,
  skill_name      VARCHAR(200) NOT NULL,
  skill_grade     VARCHAR(2),
  skill_category  VARCHAR(64),
  status          VARCHAR(16)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'terminated')),
  hired_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  terminated_at   TIMESTAMPTZ,
  total_cost_usd  NUMERIC(10,4) NOT NULL DEFAULT 0,

  UNIQUE (org_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members (org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_exec   ON team_members (org_id, executive_id);

-- ============================================================
-- STEP 8: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by        UUID         NOT NULL REFERENCES users(id)         ON DELETE RESTRICT,
  title             VARCHAR(120) NOT NULL,
  goal              TEXT         NOT NULL,
  status            VARCHAR(16)  NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('planning','active','reviewing','completed','archived')),
  ai_agents         JSONB        NOT NULL DEFAULT '[]'::jsonb,
  telegram_group_id BIGINT,
  due_date          DATE,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT projects_title_not_empty CHECK (trim(title) <> ''),
  CONSTRAINT projects_goal_not_empty  CHECK (trim(goal)  <> '')
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id     ON projects (org_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects (created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects (org_id, status);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- STEP 9: tasks (Lucky Seven 버전 — 7임원 + team_member)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID         NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
  org_id         UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by     UUID         NOT NULL REFERENCES users(id)         ON DELETE RESTRICT,
  assigned_agent VARCHAR(32)  NOT NULL DEFAULT 'cto'
                   CHECK (assigned_agent IN ('cto','cmo','cfo','cpo','coo','chro','cao','team_member','human')),
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  status         VARCHAR(16)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','in_progress','review','approved','rejected','done')),
  priority       VARCHAR(8)   NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low','medium','high','urgent')),
  output         JSONB,
  approved_by    UUID         REFERENCES users(id),
  approved_at    TIMESTAMPTZ,
  rejected_reason TEXT,
  cost_usd       NUMERIC(8, 4) NOT NULL DEFAULT 0.0000
                   CHECK (cost_usd >= 0),
  due_date       DATE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT tasks_title_not_empty     CHECK (trim(title) <> ''),
  CONSTRAINT tasks_approval_consistent CHECK (
    (status IN ('approved','rejected') AND approved_by IS NOT NULL) OR
    (status NOT IN ('approved','rejected'))
  )
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id     ON tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id         ON tasks (org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status         ON tasks (project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON tasks (org_id, assigned_agent, status);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- STEP 10: audit_logs — CAO 감사 로그 (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_type  VARCHAR(16)  NOT NULL CHECK (actor_type IN ('executive', 'team_member', 'human', 'system')),
  actor_id    VARCHAR(128) NOT NULL,
  action      VARCHAR(64)  NOT NULL,
  target_type VARCHAR(32),
  target_id   UUID,
  details     JSONB,
  cost_usd    NUMERIC(8,4) DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON audit_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor    ON audit_logs (org_id, actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action   ON audit_logs (org_id, action);

-- ============================================================
-- STEP 11: CFO 예산 감시 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION fn_budget_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.budget_used_usd >= NEW.monthly_budget_usd * 0.8 
     AND OLD.budget_used_usd < OLD.monthly_budget_usd * 0.8 THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, details)
    VALUES (NEW.id, 'system', 'cfo', 'budget_warning_80',
      jsonb_build_object('budget_limit', NEW.monthly_budget_usd, 'budget_used', NEW.budget_used_usd,
        'percentage', ROUND((NEW.budget_used_usd / NEW.monthly_budget_usd * 100)::numeric, 1)));
  END IF;
  
  IF NEW.budget_used_usd >= NEW.monthly_budget_usd 
     AND OLD.budget_used_usd < OLD.monthly_budget_usd THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, details)
    VALUES (NEW.id, 'system', 'cfo', 'budget_exceeded_100',
      jsonb_build_object('budget_limit', NEW.monthly_budget_usd, 'budget_used', NEW.budget_used_usd,
        'action_taken', 'auto_pause_pending'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_budget_alert
  AFTER UPDATE OF budget_used_usd ON organizations
  FOR EACH ROW EXECUTE FUNCTION fn_budget_alert();

-- ============================================================
-- STEP 12: RLS — 전체 테이블
-- ============================================================
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans                ENABLE ROW LEVEL SECURITY;
ALTER TABLE executives           ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_executives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (마스터 데이터)
CREATE POLICY "anyone_read_plans"      ON plans      FOR SELECT TO authenticated USING (true);
CREATE POLICY "anyone_read_executives" ON executives  FOR SELECT TO authenticated USING (true);

-- service_role 풀 액세스
CREATE POLICY "service_all_orgs"        ON organizations        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_org_members" ON organization_members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_projects"    ON projects             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tasks"       ON tasks                FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_org_execs"   ON org_executives       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_team"        ON team_members         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_audit"       ON audit_logs           FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated: 자기 조직만 조회
CREATE POLICY "members_select_own_org" ON organizations FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "members_select_own_projects" ON projects FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "members_select_own_tasks" ON tasks FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "members_select_org_execs" ON org_executives FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "members_select_team" ON team_members FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "members_select_audit" ON audit_logs FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));

-- ============================================================
-- ✅ v2+v3 통합 마이그레이션 완료 — Lucky Seven
-- 
-- 총 테이블: 12개
-- v1: users, workspaces, onboarding_events
-- v2: organizations, organization_members, projects, tasks
-- v3: plans, executives, org_executives, team_members, audit_logs
-- 트리거: updated_at 자동갱신, CFO 예산 감시
-- ============================================================
