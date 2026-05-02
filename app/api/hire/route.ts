import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// ── 요금제별 채용 제한 ──────────────────────────────
const PLAN_LIMITS: Record<string, number> = {
  free: 0,        // 채용 불가
  pro: 5,         // 임원당 5명
  premium: 9999,  // 사실상 무제한
}

// ── GET: 채용 가능 여부 확인 ─────────────────────────
// ?org_id=xxx&exec=cto
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id')
  const exec = req.nextUrl.searchParams.get('exec') || 'cto'

  if (!orgId) {
    return NextResponse.json({ allowed: false, reason: 'org_id 필요' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1) 조직 plan 조회
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single()

  if (orgErr || !org) {
    return NextResponse.json({ allowed: false, reason: '조직 정보 없음' }, { status: 404 })
  }

  const plan = org.plan as string
  const limit = PLAN_LIMITS[plan] ?? 0

  // Free: 즉시 차단
  if (limit === 0) {
    return NextResponse.json({
      allowed: false,
      reason: 'upgrade_required',
      plan,
      message: 'Pro 요금제로 업그레이드하면 팀원을 채용할 수 있습니다.',
    })
  }

  // 2) 해당 임원의 현재 활성 팀원 수
  const { count, error: countErr } = await supabase
    .from('hired_skills')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('assigned_exec', exec)
    .eq('status', 'active')

  if (countErr) {
    return NextResponse.json({ allowed: false, reason: 'DB 오류' }, { status: 500 })
  }

  const current = count || 0

  if (current >= limit) {
    return NextResponse.json({
      allowed: false,
      reason: 'limit_reached',
      plan,
      current,
      limit,
      message: `${exec.toUpperCase()} 산하 팀원이 ${limit}명으로 가득 찼습니다.`,
    })
  }

  return NextResponse.json({
    allowed: true,
    plan,
    current,
    limit,
    remaining: limit - current,
  })
}

// ── POST: 채용 기록 저장 ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { org_id, hired_by, assigned_exec, skill_id, skill_name, skill_category, difficulty, quality_score, quality_grade } = body

    if (!org_id || !hired_by || !skill_name || !skill_category) {
      return NextResponse.json({ success: false, message: '필수 필드 누락' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // MVP: 기본 pro 플랜 (추후 organization 연동)
    const plan = 'pro'
    const limit = PLAN_LIMITS[plan] ?? 5

    const { count } = await supabase
      .from('hired_skills')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org_id)
      .eq('assigned_exec', assigned_exec || 'cto')
      .eq('status', 'active')

    if ((count || 0) >= limit) {
      return NextResponse.json({ success: false, message: '채용 한도 초과' }, { status: 403 })
    }

    // 저장
    const { data, error } = await supabase
      .from('hired_skills')
      .insert({
        org_id,
        hired_by,
        assigned_exec: assigned_exec || 'cto',
        skill_id: skill_id || null,
        skill_name,
        skill_category,
        difficulty: difficulty || 'intermediate',
        quality_score: quality_score || 0,
        quality_grade: quality_grade || 'C',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, hired: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
