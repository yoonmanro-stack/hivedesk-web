-- ============================================================
-- HiveDesk.ai — Migration: meetings 테이블
-- Author  : CTO 뮤즈
-- Date    : 2026-05-10
-- ============================================================
-- 설계 원칙:
--   • 조직(org) 단위의 회의 기록 관리
--   • AI 임원 / 사람 참여자 모두 수용 (participants JSONB)
--   • 회의 산출물(agenda, minutes, action_items) 구조화
--   • project/task 연계 선택적 (NULL 허용)
--   • audit_logs 연동용 트리거 내장
-- ============================================================

-- ============================================================
-- ① meetings — 회의 메인 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID          REFERENCES projects(id) ON DELETE SET NULL,   -- 선택적 프로젝트 연계
  created_by      UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- 기본 정보
  title           VARCHAR(200)  NOT NULL,
  description     TEXT,

  -- 회의 유형
  meeting_type    VARCHAR(32)   NOT NULL DEFAULT 'general'
                    CHECK (meeting_type IN (
                      'general',      -- 일반 회의
                      'tft',          -- Task Force Team 킥오프
                      'review',       -- 결과물 리뷰/결재
                      'brainstorm',   -- 브레인스토밍
                      'standup',      -- 데일리 스탠드업
                      'retrospective' -- 회고
                    )),

  -- 상태
  status          VARCHAR(16)   NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN (
                      'scheduled',  -- 예정
                      'in_progress',-- 진행 중
                      'done',       -- 완료
                      'cancelled'   -- 취소
                    )),

  -- 일정
  scheduled_at    TIMESTAMPTZ   NOT NULL,                    -- 예정 시작 시각
  started_at      TIMESTAMPTZ,                               -- 실제 시작 시각
  ended_at        TIMESTAMPTZ,                               -- 실제 종료 시각
  duration_min    SMALLINT      GENERATED ALWAYS AS (
                    CASE
                      WHEN started_at IS NOT NULL AND ended_at IS NOT NULL
                      THEN EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
                      ELSE NULL
                    END::SMALLINT
                  ) STORED,                                  -- 실제 소요시간(분) 자동 계산

  -- 참여자 목록
  -- 구조 예시:
  -- [
  --   {"type": "executive", "id": "cto",  "name": "뮤즈"},
  --   {"type": "human",     "id": "<uuid>","name": "윤만로"},
  --   {"type": "agent",     "id": "<uuid>","name": "Alex"}
  -- ]
  participants    JSONB         NOT NULL DEFAULT '[]'::jsonb,

  -- 회의 내용
  agenda          TEXT,                                      -- 안건 (마크다운)
  minutes         TEXT,                                      -- 회의록 (마크다운, AI 자동 생성 가능)

  -- 액션 아이템 목록 (회의 결과 할 일)
  -- 구조 예시:
  -- [
  --   {
  --     "id": 1,
  --     "content": "랜딩 페이지 와이어프레임 초안 작성",
  --     "assigned_to": "cpo",
  --     "due_date": "2026-05-15",
  --     "task_id": "<uuid>",   -- tasks 테이블 연계 (선택)
  --     "done": false
  --   }
  -- ]
  action_items    JSONB         NOT NULL DEFAULT '[]'::jsonb,

  -- AI 생성 요약 (minutes가 너무 길 경우 3줄 요약)
  ai_summary      TEXT,

  -- 텔레그램 연계
  telegram_msg_id BIGINT,                                    -- 회의 공지 메시지 ID (선택)

  -- AI 토큰 비용
  cost_usd        NUMERIC(8, 4) NOT NULL DEFAULT 0.0000
                    CHECK (cost_usd >= 0),

  -- 타임스탬프
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- 제약조건
  CONSTRAINT meetings_title_not_empty  CHECK (trim(title) <> ''),
  CONSTRAINT meetings_time_order       CHECK (ended_at IS NULL OR ended_at > started_at),
  CONSTRAINT meetings_done_requires_end CHECK (
    status <> 'done' OR ended_at IS NOT NULL
  )
);

-- ============================================================
-- 인덱스
-- ============================================================
-- 조직별 회의 목록 (최신순)
CREATE INDEX IF NOT EXISTS idx_meetings_org_scheduled
  ON meetings (org_id, scheduled_at DESC);

-- 프로젝트 연계 회의
CREATE INDEX IF NOT EXISTS idx_meetings_project_id
  ON meetings (project_id)
  WHERE project_id IS NOT NULL;

-- 상태별 필터
CREATE INDEX IF NOT EXISTS idx_meetings_org_status
  ON meetings (org_id, status);

-- 생성자 기준
CREATE INDEX IF NOT EXISTS idx_meetings_created_by
  ON meetings (created_by);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- audit_logs 연동 트리거
-- 회의 완료(done) 전환 시 감사 로그 자동 기록
-- ============================================================
CREATE OR REPLACE FUNCTION fn_meetings_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- 회의 완료 전환 감사
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, target_type, target_id, details, cost_usd)
    VALUES (
      NEW.org_id,
      'human',
      NEW.created_by::TEXT,
      'meeting_completed',
      'meeting',
      NEW.id,
      jsonb_build_object(
        'title',        NEW.title,
        'meeting_type', NEW.meeting_type,
        'duration_min', NEW.duration_min,
        'participants', NEW.participants,
        'action_items', jsonb_array_length(NEW.action_items)
      ),
      NEW.cost_usd
    );
  END IF;

  -- 회의 취소 감사
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    INSERT INTO audit_logs (org_id, actor_type, actor_id, action, target_type, target_id, details)
    VALUES (
      NEW.org_id,
      'human',
      NEW.created_by::TEXT,
      'meeting_cancelled',
      'meeting',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'scheduled_at', NEW.scheduled_at)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_meetings_audit
  AFTER UPDATE OF status ON meetings
  FOR EACH ROW EXECUTE FUNCTION fn_meetings_audit();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- service_role: 풀 액세스
CREATE POLICY "service_role_all_meetings"
  ON meetings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- authenticated: 자신이 속한 조직의 회의만 조회
CREATE POLICY "members_select_own_meetings"
  ON meetings FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- ✅ meetings 마이그레이션 완료
-- 
-- 테이블    : meetings
-- 인덱스    : 4개 (org+scheduled, project_id, org+status, created_by)
-- 트리거    : updated_at 자동갱신, audit_logs 연동(done/cancelled)
-- RLS       : service_role 풀 액세스 + 멤버 조직 격리
-- ============================================================
