-- ============================================================
-- HiveDesk.ai — v3.0 "Lucky Seven" Migration
-- 럭키세븐 임원 체제 + SkillsMuse 팀원 채용 + 감사 로그
-- Author  : Ops Team Lead
-- Date    : 2026-04-25
-- ============================================================

-- ============================================================
-- ① plans — 요금제 정의
-- Free / Starter / Pro / VVIP 4단계
-- ============================================================

CREATE TABLE IF NOT EXISTS plans (
  id                  VARCHAR(16) PRIMARY KEY,  -- 'free','starter','pro','vvip'
  name                VARCHAR(32) NOT NULL,
  price_usd           NUMERIC(8,2) NOT NULL DEFAULT 0,
  max_executives      INT NOT NULL DEFAULT 3,
  max_team_per_exec   INT,  -- NULL = 무제한
  max_tft_groups      INT,  -- NULL = 무제한
  monthly_token_usd   NUMERIC(8,2) NOT NULL DEFAULT 0,
  has_premium_skills  BOOLEAN NOT NULL DEFAULT false,
  has_find_skill      BOOLEAN NOT NULL DEFAULT false,
  has_auto_hire       BOOLEAN NOT NULL DEFAULT false,  -- CHRO 자동 채용 권한
  has_audit_log       BOOLEAN NOT NULL DEFAULT false,
  has_debate_system   BOOLEAN NOT NULL DEFAULT false,
  has_sandbox         BOOLEAN NOT NULL DEFAULT false,  -- VVIP Docker 샌드박스
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기본 요금제 데이터 삽입
INSERT INTO plans (id, name, price_usd, max_executives, max_team_per_exec, max_tft_groups, monthly_token_usd, has_premium_skills, has_find_skill, has_auto_hire, has_audit_log, has_debate_system, has_sandbox)
VALUES
  ('free',    'Free',    0.00,   3, 0,    1,    0.00,   false, false, false, false, false, false),
  ('starter', 'Starter', 29.00,  7, 5,    3,    50.00,  false, true,  false, false, false, false),
  ('pro',     'Pro',     79.00,  7, NULL, NULL,  200.00, true,  true,  true,  true,  true,  false),
  ('vvip',    'VVIP',    299.00, 7, NULL, NULL,  500.00, true,  true,  true,  true,  true,  true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ② executives — 럭키세븐 임원 정의 (시스템 테이블)
-- 모든 조직에 동일하게 적용되는 임원 마스터 데이터
-- ============================================================

CREATE TABLE IF NOT EXISTS executives (
  id          VARCHAR(8)   PRIMARY KEY,  -- 'cto','cmo','cfo','cpo','coo','chro','cao'
  title       VARCHAR(32)  NOT NULL,     -- 'Chief Technology Officer'
  title_ko    VARCHAR(32)  NOT NULL,     -- '기술 임원'
  emoji       VARCHAR(4)   NOT NULL,     -- 직관적 아이콘
  description TEXT         NOT NULL,     -- 역할 설명
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
-- ③ org_executives — 조직별 임원 배치 현황
-- 요금제에 따라 활성화되는 임원이 다름
-- ============================================================

CREATE TABLE IF NOT EXISTS org_executives (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  executive_id  VARCHAR(8)  NOT NULL REFERENCES executives(id),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  system_prompt TEXT,        -- 임원별 커스텀 시스템 프롬프트 (선택)
  activated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (org_id, executive_id)
);

CREATE INDEX IF NOT EXISTS idx_org_executives_org_id ON org_executives (org_id);

-- ============================================================
-- ④ team_members — SkillsMuse 스킬 기반 팀원
-- CHRO가 채용하는 실무 인력. 각 임원 산하에 배치.
-- ============================================================

CREATE TABLE IF NOT EXISTS team_members (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  executive_id    VARCHAR(8)   NOT NULL REFERENCES executives(id),    -- 소속 임원
  skill_id        VARCHAR(128) NOT NULL,  -- SkillsMuse 스킬 고유 ID
  skill_name      VARCHAR(200) NOT NULL,  -- 표시 이름 (예: 'SNS Marketing Specialist')
  skill_grade     VARCHAR(2),             -- S / A / B 등급
  skill_category  VARCHAR(64),            -- SkillsMuse 카테고리
  status          VARCHAR(16)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'terminated')),
  hired_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  terminated_at   TIMESTAMPTZ,
  total_cost_usd  NUMERIC(10,4) NOT NULL DEFAULT 0,  -- 누적 비용

  UNIQUE (org_id, skill_id)  -- 한 조직에 동일 스킬 중복 채용 불가
);

CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members (org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_exec   ON team_members (org_id, executive_id);

-- ============================================================
-- ⑤ audit_logs — CAO 감사 로그 (append-only, 절대 수정/삭제 불가)
-- 모든 에이전트 행동을 기록. Paperclip 벤치마킹 핵심.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_type  VARCHAR(16)  NOT NULL CHECK (actor_type IN ('executive', 'team_member', 'human', 'system')),
  actor_id    VARCHAR(128) NOT NULL,  -- executive_id 또는 team_member UUID 또는 user UUID
  action      VARCHAR(64)  NOT NULL,  -- 'task_created', 'message_sent', 'hire_approved', 'budget_alert' 등
  target_type VARCHAR(32),            -- 'task', 'project', 'team_member', 'budget' 등
  target_id   UUID,
  details     JSONB,                  -- 자유 형식 상세 데이터
  cost_usd    NUMERIC(8,4) DEFAULT 0, -- 이 행동에 소모된 비용
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 시계열 조회 최적화
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON audit_logs (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor    ON audit_logs (org_id, actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action   ON audit_logs (org_id, action);

-- ============================================================
-- ⑥ tasks 테이블 — assigned_agent CHECK 제약 수정
-- 기존 5명 → 7명 + team_member 지원
-- ============================================================

-- 기존 CHECK 제약 삭제 후 재생성
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_agent_check;
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_assigned_agent_check 
  CHECK (assigned_agent IN ('cto','cmo','cfo','cpo','coo','chro','cao','team_member','human'));

-- ============================================================
-- ⑦ users 테이블 — plan 컬럼 확장
-- 기존 'standard','vvip' → 4단계 요금제
-- ============================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users 
  ADD CONSTRAINT users_plan_check 
  CHECK (plan IN ('free', 'starter', 'pro', 'vvip'));

-- 기존 'standard' → 'free'로 마이그레이션
UPDATE users SET plan = 'free' WHERE plan = 'standard';

-- ============================================================
-- ⑧ organizations — budget 트리거 (CFO 예산 감시)
-- 예산 80% 도달 시 경고 로그 자동 생성
-- ============================================================

CREATE OR REPLACE FUNCTION fn_budget_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- 80% 예산 소진 시 감사 로그에 경고 기록
  IF NEW.budget_used_usd >= NEW.monthly_budget_usd * 0.8 
     AND OLD.budget_used_usd < OLD.monthly_budget_usd * 0.8 THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, details)
    VALUES (
      NEW.id, 
      'system', 
      'cfo',
      'budget_warning_80',
      jsonb_build_object(
        'budget_limit', NEW.monthly_budget_usd,
        'budget_used', NEW.budget_used_usd,
        'percentage', ROUND((NEW.budget_used_usd / NEW.monthly_budget_usd * 100)::numeric, 1)
      )
    );
  END IF;
  
  -- 100% 예산 소진 시 긴급 경고
  IF NEW.budget_used_usd >= NEW.monthly_budget_usd 
     AND OLD.budget_used_usd < OLD.monthly_budget_usd THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, details)
    VALUES (
      NEW.id, 
      'system', 
      'cfo',
      'budget_exceeded_100',
      jsonb_build_object(
        'budget_limit', NEW.monthly_budget_usd,
        'budget_used', NEW.budget_used_usd,
        'action_taken', 'auto_pause_pending'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_budget_alert
  AFTER UPDATE OF budget_used_usd ON organizations
  FOR EACH ROW EXECUTE FUNCTION fn_budget_alert();

-- ============================================================
-- ⑨ RLS — 새 테이블들
-- ============================================================

ALTER TABLE plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE executives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- plans, executives는 공개 읽기 가능 (마스터 데이터)
CREATE POLICY "anyone_read_plans"      ON plans      FOR SELECT TO authenticated USING (true);
CREATE POLICY "anyone_read_executives" ON executives  FOR SELECT TO authenticated USING (true);

-- service_role 풀 액세스
CREATE POLICY "service_all_org_execs"   ON org_executives FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_team"        ON team_members   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_audit"       ON audit_logs     FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated: 자기 조직만
CREATE POLICY "members_select_org_execs" ON org_executives FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)));

CREATE POLICY "members_select_team" ON team_members FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)));

CREATE POLICY "members_select_audit" ON audit_logs FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = (SELECT id FROM users WHERE telegram_id = (auth.uid())::bigint)));

-- audit_logs: INSERT는 service_role만 (append-only 보장)
-- DELETE/UPDATE 정책 없음 = 삭제·수정 불가

-- ============================================================
-- ✅ Migration Complete — Lucky Seven v3.0
-- 
-- 새 테이블: plans, executives, org_executives, team_members, audit_logs
-- 수정 테이블: tasks (assigned_agent 확장), users (plan 확장)
-- 새 트리거: fn_budget_alert (CFO 예산 감시)
-- ============================================================
