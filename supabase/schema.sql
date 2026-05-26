-- ============================================================
-- HiveDesk.ai — Supabase DB Schema (Full)
-- Version : 2.0.0
-- v1.0: users, workspaces, onboarding_events
-- v2.0: + organizations, organization_members, projects, tasks
-- Based on : PRD_TELEGRAM_ONBOARDING.md v1.1
-- Author  : Iron (CTO)
-- Updated : 2026-04-25
-- ============================================================

-- ① users
-- 텔레그램 계정으로만 가입. 이메일/패스워드 없음.
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id     BIGINT UNIQUE NOT NULL,      -- Telegram user_id (절대 변하지 않음)
  first_name      VARCHAR(64) NOT NULL,
  username        VARCHAR(64),                 -- @handle (optional)
  photo_url       TEXT,                        -- Telegram profile photo URL
  plan            VARCHAR(16) NOT NULL DEFAULT 'standard'
                    CHECK (plan IN ('standard', 'vvip')),
  stack           VARCHAR(32),                 -- VVIP 전용: 'nextjs' | 'python' | 'nodejs' | 'other'
  industry        VARCHAR(32),                 -- Standard 전용: 'ecommerce' | 'sns' | 'b2b' | 'freelance' | 'other'
  onboarding_step SMALLINT NOT NULL DEFAULT 0  -- 0=미시작, 1~4=진행중, 99=완료
                    CHECK (onboarding_step >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 텔레그램 ID 조회 (인증 콜백 핫패스)
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);

-- ② workspaces
-- 유저 1명이 최초에는 1개 워크스페이스를 갖는다. (추후 멀티 워크스페이스 확장 가능)
CREATE TABLE IF NOT EXISTS workspaces (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(30) NOT NULL,       -- 2~30자, /, \, <, > 불가
  plan              VARCHAR(16) NOT NULL
                      CHECK (plan IN ('standard', 'vvip')),
  sandbox_status    VARCHAR(16) NOT NULL DEFAULT 'idle'
                      CHECK (sandbox_status IN ('idle', 'provisioning', 'active', 'failed')),
  telegram_group_id BIGINT,                     -- 생성된 TFT 단톡방 chat_id
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 이름 유효성: 공백만 있는 이름 방지
  CONSTRAINT workspaces_name_not_empty CHECK (trim(name) <> '')
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces (owner_id);

-- ③ onboarding_events
-- 단계별 퍼널 분석용 이벤트 로그. 쓰기만 하고 수정하지 않는다 (append-only).
CREATE TABLE IF NOT EXISTS onboarding_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step       SMALLINT NOT NULL CHECK (step >= 0),
  event      VARCHAR(32) NOT NULL
               CHECK (event IN ('started', 'completed', 'dropped', 'resumed')),
  meta       JSONB,                             -- 자유 형식 추가 데이터 (e.g. {"industry":"ecommerce"})
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 유저별 이벤트 시계열 조회용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_step
  ON onboarding_events (user_id, step, created_at DESC);

-- ============================================================
-- RLS (Row Level Security) — 기본 활성화
-- 서버 사이드 서비스 롤만 풀 액세스. 클라이언트는 자신의 행만.
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- service_role 은 Supabase 서버 사이드에서만 사용 (BOT_TOKEN과 함께 절대 클라이언트 노출 금지)
CREATE POLICY "service_role_all_users"
  ON users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_workspaces"
  ON workspaces FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_onboarding_events"
  ON onboarding_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

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

-- ============================================================
-- ⑧ hired_skills (v2 — SkillsMuse 34카테고리 + quality_grade 연동)
-- HiveDesk 임원이 채용한 AI 팀원(스킬) 이력 관리
-- SkillsMuse의 quality_grade(A/B/C/D) 연동으로 인재 품질 추적
-- ============================================================

CREATE TABLE IF NOT EXISTS hired_skills (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hired_by        UUID         NOT NULL REFERENCES users(id),
  assigned_exec   VARCHAR(16)  NOT NULL DEFAULT 'cto'
                    CHECK (assigned_exec IN ('ceo','cto','cmo','cpo','cfo','cs','cdo','coo')),
  skill_id        TEXT,
  skill_name      VARCHAR(200) NOT NULL,
  skill_category  VARCHAR(100) NOT NULL,
  difficulty      VARCHAR(16)  NOT NULL DEFAULT 'intermediate'
                    CHECK (difficulty IN ('beginner','intermediate','advanced')),
  quality_score   SMALLINT     NOT NULL DEFAULT 0
                    CHECK (quality_score BETWEEN 0 AND 100),
  -- SkillsMuse v3.1 grade 시스템 (A=최우선, B=중요, C=일반, D=저우선)
  quality_grade   VARCHAR(2)   NOT NULL DEFAULT 'C'
                    CHECK (quality_grade IN ('A','B','C','D')),
  status          VARCHAR(16)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','suspended','dismissed')),
  hired_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT hired_skills_name_not_empty     CHECK (trim(skill_name) <> ''),
  CONSTRAINT hired_skills_category_not_empty CHECK (trim(skill_category) <> '')
);

CREATE INDEX IF NOT EXISTS idx_hired_skills_org_exec   ON hired_skills (org_id, assigned_exec, status);
CREATE INDEX IF NOT EXISTS idx_hired_skills_org_id     ON hired_skills (org_id);
CREATE INDEX IF NOT EXISTS idx_hired_skills_grade      ON hired_skills (quality_grade);
CREATE INDEX IF NOT EXISTS idx_hired_skills_hired_at   ON hired_skills (hired_at DESC);

CREATE TRIGGER trg_hired_skills_updated_at
  BEFORE UPDATE ON hired_skills
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE hired_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_hired_skills"
  ON hired_skills FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "members_select_own_hired_skills"
  ON hired_skills FOR SELECT TO authenticated
  USING (org_id IN (
    SELECT om.org_id::text FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE u.telegram_id = (auth.uid())::bigint
  ));

-- ============================================================
-- ⑨ hired_agents (v1 — HiveDesk × SkillsMuse 에이전트 팀원 시스템)
-- "에이전트 = 팀원 1명" 개념: 스킬 3~5개를 번들한 완성형 AI 팀원
--
-- 설계 원칙:
--   • Pro 요금제: 임원당 최대 5명의 에이전트(팀원) 채용 가능
--   • 각 에이전트는 skill_ids[] 배열로 3~5개 스킬을 묶음
--   • SkillsMuse Type C (Custom Builder) 연동으로 커스텀 에이전트 생성 가능
--   • hired_skills는 스킬 원자 단위 기록용 (레거시 유지)
-- ============================================================

CREATE TABLE IF NOT EXISTS hired_agents (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hired_by        UUID         NOT NULL REFERENCES users(id),
  assigned_exec   VARCHAR(16)  NOT NULL DEFAULT 'cto'
                    -- 채용 임원: CHRO(chro)는 채용 관리자이므로 제외
                    CHECK (assigned_exec IN ('ceo','cto','cmo','cpo','cfo','cdo','coo','clo')),
  -- 에이전트 기본 정보
  agent_name      VARCHAR(100) NOT NULL,             -- 팀원 이름 (예: Alex, Luna)
  agent_role      VARCHAR(200) NOT NULL,             -- 역할/포지션 (예: React Developer)
  agent_persona   TEXT,                              -- 페르소나 설명 (SkillsMuse Type C 연동)
  -- 스킬 번들 (3~5개)
  skill_ids       TEXT[]       NOT NULL DEFAULT '{}', -- hired_skills.id 참조 배열
  skill_slugs     TEXT[]       NOT NULL DEFAULT '{}', -- SkillsMuse slug 배열 (참조용)
  skill_count     SMALLINT     NOT NULL DEFAULT 0
                    CHECK (skill_count BETWEEN 0 AND 10),
  -- 주 카테고리 (가장 핵심 스킬 기준)
  primary_category VARCHAR(100) NOT NULL DEFAULT '',
  -- 품질 집계 (번들 스킬들의 평균)
  avg_quality_score SMALLINT   NOT NULL DEFAULT 0
                    CHECK (avg_quality_score BETWEEN 0 AND 100),
  quality_grade   VARCHAR(2)   NOT NULL DEFAULT 'C'
                    CHECK (quality_grade IN ('A','B','C','D')),
  -- 에이전트 타입
  agent_type      VARCHAR(16)  NOT NULL DEFAULT 'type_a'
                    CHECK (agent_type IN (
                      'type_a',   -- n8n Factory 자동 생성 스킬 번들
                      'type_b',   -- 큐레이션/검수 스킬 번들
                      'type_c'    -- SkillsMuse Custom Builder 커스텀 에이전트
                    )),
  -- 상태 관리
  status          VARCHAR(16)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','suspended','dismissed')),
  -- 메타
  hired_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT hired_agents_name_not_empty CHECK (trim(agent_name) <> ''),
  CONSTRAINT hired_agents_role_not_empty CHECK (trim(agent_role) <> '')
);

-- 임원별 에이전트 목록 조회 (대시보드 핵심 쿼리)
CREATE INDEX IF NOT EXISTS idx_hired_agents_org_exec   ON hired_agents (org_id, assigned_exec, status);
CREATE INDEX IF NOT EXISTS idx_hired_agents_org_id     ON hired_agents (org_id);
CREATE INDEX IF NOT EXISTS idx_hired_agents_grade      ON hired_agents (quality_grade);
CREATE INDEX IF NOT EXISTS idx_hired_agents_hired_at   ON hired_agents (hired_at DESC);

CREATE TRIGGER trg_hired_agents_updated_at
  BEFORE UPDATE ON hired_agents
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE hired_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_hired_agents"
  ON hired_agents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "members_select_own_hired_agents"
  ON hired_agents FOR SELECT TO authenticated
  USING (org_id IN (
    SELECT om.org_id FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE u.telegram_id = (auth.uid())::bigint
  ));

-- ============================================================
-- ⑩ meetings — 회의 관리 테이블
-- Version : 3.1.0
-- Author  : CTO 뮤즈
-- Date    : 2026-05-10
-- ============================================================

CREATE TABLE IF NOT EXISTS meetings (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID          REFERENCES projects(id) ON DELETE SET NULL,
  created_by      UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  title           VARCHAR(200)  NOT NULL,
  description     TEXT,

  meeting_type    VARCHAR(32)   NOT NULL DEFAULT 'general'
                    CHECK (meeting_type IN (
                      'general', 'tft', 'review', 'brainstorm', 'standup', 'retrospective'
                    )),

  status          VARCHAR(16)   NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'in_progress', 'done', 'cancelled')),

  scheduled_at    TIMESTAMPTZ   NOT NULL,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  duration_min    SMALLINT      GENERATED ALWAYS AS (
                    CASE
                      WHEN started_at IS NOT NULL AND ended_at IS NOT NULL
                      THEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
                      ELSE NULL
                    END::SMALLINT
                  ) STORED,

  participants    JSONB         NOT NULL DEFAULT '[]'::jsonb,
  agenda          TEXT,
  minutes         TEXT,
  action_items    JSONB         NOT NULL DEFAULT '[]'::jsonb,
  ai_summary      TEXT,

  telegram_msg_id BIGINT,
  cost_usd        NUMERIC(8, 4) NOT NULL DEFAULT 0.0000
                    CHECK (cost_usd >= 0),

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT meetings_title_not_empty   CHECK (trim(title) <> ''),
  CONSTRAINT meetings_time_order        CHECK (ended_at IS NULL OR ended_at > started_at),
  CONSTRAINT meetings_done_requires_end CHECK (status <> 'done' OR ended_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_meetings_org_scheduled ON meetings (org_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_project_id    ON meetings (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meetings_org_status    ON meetings (org_id, status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by    ON meetings (created_by);

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE FUNCTION fn_meetings_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, target_type, target_id, details, cost_usd)
    VALUES (
      NEW.org_id, 'human', NEW.created_by::TEXT, 'meeting_completed', 'meeting', NEW.id,
      jsonb_build_object(
        'title', NEW.title, 'meeting_type', NEW.meeting_type,
        'duration_min', NEW.duration_min, 'participants', NEW.participants,
        'action_items', jsonb_array_length(NEW.action_items)
      ),
      NEW.cost_usd
    );
  END IF;
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, target_type, target_id, details)
    VALUES (
      NEW.org_id, 'human', NEW.created_by::TEXT, 'meeting_cancelled', 'meeting', NEW.id,
      jsonb_build_object('title', NEW.title, 'scheduled_at', NEW.scheduled_at)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_meetings_audit
  AFTER UPDATE OF status ON meetings
  FOR EACH ROW EXECUTE FUNCTION fn_meetings_audit();

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_meetings"
  ON meetings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "members_select_own_meetings"
  ON meetings FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
