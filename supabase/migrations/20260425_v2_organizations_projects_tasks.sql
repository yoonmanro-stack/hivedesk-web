-- ============================================================
-- HiveDesk.ai — Migration v2.0
-- 신규 테이블: organizations, organization_members, projects, tasks
-- 기존 테이블: users, workspaces, onboarding_events (유지)
-- Author  : Iron (CTO)
-- Date    : 2026-04-25
-- Run on  : Supabase SQL Editor (schema.sql v1.0 적용 후 실행)
-- ============================================================

-- ============================================================
-- ④ organizations
-- workspaces의 상위 개념. 실제 "법인(가상 AI 주식회사)" 단위.
-- 유저 1명이 다수 조직을 소유하거나 멤버로 참여할 수 있다.
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name                VARCHAR(60) NOT NULL,
  slug                VARCHAR(60) UNIQUE NOT NULL,         -- URL-safe 식별자 (예: beesoap-hq)
  plan                VARCHAR(16) NOT NULL DEFAULT 'standard'
                        CHECK (plan IN ('standard', 'vvip')),
  industry            VARCHAR(32),                         -- 'ecommerce'|'sns'|'b2b'|'freelance'|'other'
  telegram_group_id   BIGINT,                              -- 메인 컨트롤 단톡방 chat_id
  sandbox_status      VARCHAR(16) NOT NULL DEFAULT 'idle'
                        CHECK (sandbox_status IN ('idle', 'provisioning', 'active', 'failed')),
  -- 예산 통제 (BUDGET_CONTROL_DESIGN.md 기반 — AI 직원 월급제)
  monthly_budget_usd  NUMERIC(10, 2) NOT NULL DEFAULT 30.00
                        CHECK (monthly_budget_usd >= 0),
  budget_used_usd     NUMERIC(10, 2) NOT NULL DEFAULT 0.00
                        CHECK (budget_used_usd >= 0),
  budget_reset_at     TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  -- 활성화된 AI 임원진 목록 (예: ["cto","cmo","cpo"])
  ai_executives       JSONB       NOT NULL DEFAULT '["cto","cmo"]'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT organizations_name_not_empty CHECK (trim(name) <> ''),
  CONSTRAINT organizations_slug_format    CHECK (slug ~ '^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$'),
  CONSTRAINT organizations_budget_check   CHECK (budget_used_usd <= monthly_budget_usd * 1.1)
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations (owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug     ON organizations (slug);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ⑤ organization_members
-- 멀티 테넌트: 한 유저가 여러 조직에 참여, 조직도 여러 멤버 보유.
-- ============================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  role        VARCHAR(16) NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at   TIMESTAMPTZ,

  UNIQUE (org_id, user_id)                                     -- 한 조직에 동일 유저 중복 불가
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id  ON organization_members (org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members (user_id);

-- ============================================================
-- ⑥ projects
-- AI TFT(Task Force Team) 단위. 유저가 목표를 던지면 하나의 프로젝트가 생성된다.
-- 예: "비건 비누 매출 20% 올려줘" → project 1건 + AI 임원 자동 배치
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by        UUID         NOT NULL REFERENCES users(id)         ON DELETE RESTRICT,
  title             VARCHAR(120) NOT NULL,
  goal              TEXT         NOT NULL,                    -- 유저가 입력한 원문 목표
  status            VARCHAR(16)  NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('planning','active','reviewing','completed','archived')),
  -- 이 프로젝트에 배치된 AI 임원진 (예: ["cto","cmo"])
  ai_agents         JSONB        NOT NULL DEFAULT '[]'::jsonb,
  telegram_group_id BIGINT,                                   -- TFT 전용 단톡방 chat_id
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
-- ⑦ tasks
-- 프로젝트 내 개별 작업 아이템. AI 임원이 생성하거나 유저가 직접 추가.
-- 대표님의 [승인/반려] 결재가 required 여부에 따라 흐른다.
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID         NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
  org_id         UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by     UUID         NOT NULL REFERENCES users(id)         ON DELETE RESTRICT,
  -- 담당 AI 임원 식별자 (cto | cmo | cpo | cs | cdo | human)
  assigned_agent VARCHAR(32)  NOT NULL DEFAULT 'cto'
                   CHECK (assigned_agent IN ('cto','cmo','cpo','cs','cdo','human')),
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  status         VARCHAR(16)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','in_progress','review','approved','rejected','done')),
  priority       VARCHAR(8)   NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low','medium','high','urgent')),
  -- AI 산출물: 링크, 파일명, 생성 텍스트 등 자유 형식
  output         JSONB,
  -- 결재 정보 (대표님 또는 admin이 승인한 경우)
  approved_by    UUID         REFERENCES users(id),
  approved_at    TIMESTAMPTZ,
  rejected_reason TEXT,
  -- 예산 소모 추적 (이 task에서 사용된 API 비용)
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
-- RLS — organizations, organization_members, projects, tasks
-- ============================================================

ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                ENABLE ROW LEVEL SECURITY;

-- service_role: 서버 사이드 풀 액세스
CREATE POLICY "service_role_all_organizations"
  ON organizations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_org_members"
  ON organization_members FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_projects"
  ON projects FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_tasks"
  ON tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- anon/authenticated: 자신이 속한 조직의 데이터만 조회
CREATE POLICY "members_select_own_org"
  ON organizations FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)
    )
  );

CREATE POLICY "members_select_own_projects"
  ON projects FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)
    )
  );

CREATE POLICY "members_select_own_tasks"
  ON tasks FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)
    )
  );
