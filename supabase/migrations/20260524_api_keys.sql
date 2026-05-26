-- hivedesk_api_keys: 마스킹된 키 메타데이터만 저장 (실제 키는 사용자 로컬에만 존재)
CREATE TABLE IF NOT EXISTS hivedesk_api_keys (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gemini_key_masked  TEXT,
  claude_key_masked  TEXT,
  gemini_has_key     BOOLEAN DEFAULT false,
  claude_has_key     BOOLEAN DEFAULT false,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id)
);

-- RLS
ALTER TABLE hivedesk_api_keys ENABLE ROW LEVEL SECURITY;

-- 본인 org만 접근 가능
CREATE POLICY "org_own" ON hivedesk_api_keys
  USING (
    org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );
