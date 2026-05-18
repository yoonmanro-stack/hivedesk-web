// ══════════════════════════════════════════════════════════════
// skillHire.ts — HiveDesk × SkillsMuse 팀원 채용 서비스
// SkillsMuse n8n Webhook을 통해 AI 팀원(SKILL.md)을 온디맨드 생성
//
// 문의: SkillsMuse 개발팀 (뮤즈 AI)
// 버전: v1.0.0 | 2026-04-29
// ══════════════════════════════════════════════════════════════

// ── 설정 ────────────────────────────────────────────────────
const HIRE_SKILL_URL = 'https://popklip.app.n8n.cloud/webhook/hire-skill';
const SKILLSMUSE_SUPABASE_URL = 'https://xlenqdkwojuponwhhlmo.supabase.co';
// ⚠️ .env.local에 NEXT_PUBLIC_SKILLSMUSE_PUBLISHABLE_KEY=sb_publishable_... 필요
const SKILLSMUSE_ANON_KEY = process.env.NEXT_PUBLIC_SKILLSMUSE_PUBLISHABLE_KEY || '';

// ── 사용 가능한 카테고리 (34개 | 3-Tier) ────────────────────
// 🥇 TIER 1 (14개): 기술+비즈니스 핵심
export const TIER1_CATEGORIES = [
  'K-Local', 'AI Agent', 'Web Development', 'DevOps', 'Data Engineering', 'Mobile',
  'Security', 'AI/ML', 'Automation', 'Backend',
  'Marketing & Growth', 'Business Strategy', 'Sales & BD', 'Finance & Accounting'
] as const;
// 🥈 TIER 2 (17개): 전문직 + 기술 2군
export const TIER2_CATEGORIES = [
  'Testing', 'Database', 'AgentOps', 'MCP Integration', 'AI Security', 'Game Dev', 'Music / Audio',
  'UI/UX & Design Vibe', 'Meta Persona', 'Tech Writing', 'Web3 & Blockchain', 'Productivity & PKM',
  'HR & Recruiting', 'Legal & Compliance', 'Customer Success', 'Content & Copywriting', 'E-commerce & Retail'
] as const;
// 🥉 TIER 3 (3개): 틈새 전문직
export const TIER3_CATEGORIES = [
  'Education & Training', 'Supply Chain & Trade', 'Healthcare Docs'
] as const;

export const SKILL_CATEGORIES = [
  ...TIER1_CATEGORIES, ...TIER2_CATEGORIES, ...TIER3_CATEGORIES
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ── 타입 정의 ────────────────────────────────────────────────
export interface HireRequest {
  category: SkillCategory;
  role: string;
  requirements?: string;
  difficulty?: Difficulty;
  userId?: string;
  // v2: 채용 제한 체크용
  orgId?: string;
  assignedExec?: string;
  hiredBy?: string;
  memberName?: string;
}

export interface HireResult {
  success: boolean;
  message: string;
  slug?: string;
  skillName?: string;
  category?: string;
  qualityScore?: number;
  qualityGrade?: string;  // SkillsMuse v3.1 grade (A/B/C/D)
  isExisting?: boolean;
  // v2: 제한 정보
  limitInfo?: {
    allowed: boolean;
    reason?: string;
    plan?: string;
    current?: number;
    limit?: number;
    remaining?: number;
  };
}

export interface HireCallbacks {
  onSearching?: (msg: string) => void;
  onGenerating?: (msg: string) => void;
  onSuccess?: (result: HireResult) => void;
  onError?: (result: HireResult) => void;
}


// ══════════════════════════════════════════════════════════════
// [1] 기존 스킬 검색 — DB에 있으면 즉시 반환 (생성 불필요)
// ══════════════════════════════════════════════════════════════
export async function searchExistingSkill(
  category: string,
  keyword: string = ''
): Promise<HireResult | null> {
  try {
    let url = `${SKILLSMUSE_SUPABASE_URL}/rest/v1/skills?select=slug,name,category,quality_score,quality_grade&category=eq.${encodeURIComponent(category)}&quality_score=gte.70&order=quality_score.desc&limit=1`;

    if (keyword) {
      url += `&name=ilike.*${encodeURIComponent(keyword)}*`;
    }

    const res = await fetch(url, {
      headers: {
        'apikey': SKILLSMUSE_ANON_KEY,
        'Authorization': `Bearer ${SKILLSMUSE_ANON_KEY}`
      }
    });

    const data = await res.json();

    if (data && data.length > 0) {
      const skill = data[0];
      return {
        success: true,
        message: '기존 스킬을 찾았습니다.',
        slug: skill.slug,
        skillName: skill.name,
        category: skill.category,
        qualityScore: skill.quality_score,
        qualityGrade: skill.quality_grade || 'C',
        isExisting: true
      };
    }

    return null;
  } catch (err) {
    console.warn('[skillHire] 기존 스킬 검색 실패:', (err as Error).message);
    return null;
  }
}


// ══════════════════════════════════════════════════════════════
// [2] 팀원 채용 요청 — 신규 AI 스킬 생성 (메인 함수)
// ⚠️ 응답까지 약 40~60초 소요됩니다.
// ══════════════════════════════════════════════════════════════
export async function requestSkillHire({
  category,
  role,
  requirements,
  difficulty = 'intermediate',
  userId = 'HiveDesk'
}: HireRequest): Promise<HireResult> {
  if (!category || !role) {
    return { success: false, message: 'category와 role은 필수 항목입니다.' };
  }
  if (!SKILL_CATEGORIES.includes(category as SkillCategory)) {
    return { success: false, message: `유효하지 않은 카테고리: "${category}"` };
  }

  try {
    const response = await fetch(HIRE_SKILL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, role, requirements, difficulty, requestedBy: userId })
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (response.ok && data.success !== false) {
      return {
        success: true,
        message: data.message || '스킬 생성 완료!',
        slug: data.slug || '',
        skillName: data.skillName || role,
        category: data.category || category,
        qualityScore: data.qualityScore || 0,
        isExisting: false
      };
    } else {
      return {
        success: false,
        message: data.message || `생성 실패 (HTTP ${response.status})`,
        qualityScore: data.qualityScore || 0
      };
    }
  } catch (err) {
    return { success: false, message: '네트워크 오류: ' + (err as Error).message };
  }
}


// ══════════════════════════════════════════════════════════════
// [3] 채용 제한 체크 — 요금제별 인원 제한 확인
// ══════════════════════════════════════════════════════════════
export async function checkHireLimit(
  orgId: string,
  exec: string = 'cto'
): Promise<{ allowed: boolean; reason?: string; plan?: string; current?: number; limit?: number; remaining?: number; message?: string }> {
  try {
    const res = await fetch(`/api/hire?org_id=${orgId}&exec=${exec}`);
    return await res.json();
  } catch {
    return { allowed: false, reason: 'network_error', message: '네트워크 오류' };
  }
}


// ══════════════════════════════════════════════════════════════
// [4] 채용 기록 저장 — hired_skills 테이블에 기록
// ══════════════════════════════════════════════════════════════
export async function recordHire(params: {
  orgId: string;
  hiredBy: string;
  assignedExec: string;
  skillId?: string;
  skillName: string;
  skillCategory: string;
  difficulty?: string;
  qualityScore?: number;
  qualityGrade?: string;  // SkillsMuse v3.1 grade (A/B/C/D)
}): Promise<{ success: boolean; hired?: any }> {
  try {
    const res = await fetch('/api/hire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: params.orgId,
        hired_by: params.hiredBy,
        assigned_exec: params.assignedExec,
        skill_id: params.skillId,
        skill_name: params.skillName,
        skill_category: params.skillCategory,
        difficulty: params.difficulty,
        quality_score: params.qualityScore,
        quality_grade: params.qualityGrade || 'C',
      }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}


// ══════════════════════════════════════════════════════════════
// [5] 통합 채용 함수 — 제한 체크 → 검색 → 생성 → 기록 (권장)
// HiveDesk에서는 이 함수 하나만 호출하면 됩니다.
// ══════════════════════════════════════════════════════════════
export async function hireTeamMember(
  request: HireRequest,
  callbacks: HireCallbacks = {}
): Promise<HireResult> {
  const { onSearching, onGenerating, onSuccess, onError } = callbacks;

  // Step 0: 채용 제한 체크 (orgId가 있는 경우만)
  if (request.orgId) {
    const limitCheck = await checkHireLimit(request.orgId, request.assignedExec || 'cto');
    if (!limitCheck.allowed) {
      const result: HireResult = {
        success: false,
        message: limitCheck.message || '채용 한도 초과',
        limitInfo: limitCheck,
      };
      onError?.(result);
      return result;
    }
  }

  // Step 1: 기존 스킬 검색
  onSearching?.('기존 AI 팀원을 검색 중...');
  const existing = await searchExistingSkill(request.category, request.role);

  if (existing) {
    // 기존 스킬 찾으면 기록 저장
    if (request.orgId && request.hiredBy) {
      await recordHire({
        orgId: request.orgId,
        hiredBy: request.hiredBy,
        assignedExec: request.assignedExec || 'cto',
        skillId: existing.slug,
        skillName: existing.skillName || request.role,
        skillCategory: existing.category || request.category,
        qualityScore: existing.qualityScore,
      });
    }
    onSuccess?.(existing);
    return existing;
  }

  // Step 2: 없으면 신규 생성 (약 45초 소요)
  onGenerating?.('AI 팀원을 새로 생성 중... (약 45초 소요)');
  const result = await requestSkillHire(request);

  if (result.success) {
    // 신규 생성 성공 시 기록 저장
    if (request.orgId && request.hiredBy) {
      await recordHire({
        orgId: request.orgId,
        hiredBy: request.hiredBy,
        assignedExec: request.assignedExec || 'cto',
        skillId: result.slug,
        skillName: result.skillName || request.role,
        skillCategory: result.category || request.category,
        qualityScore: result.qualityScore,
      });
    }
    onSuccess?.(result);
  } else {
    onError?.(result);
  }

  return result;
}
