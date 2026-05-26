import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { sendHireNotification } from '@/lib/telegram'

const PLAN_LIMITS: Record<string, number> = {
  free:    0,
  starter: 5,
  pro:     5,
  vvip:    9999,
}

// v2.2: 요금제별 채용 가능 등급 제한
const PLAN_GRADE_LIMITS: Record<string, string[]> = {
  free:    [],
  starter: ['C'],
  pro:     ['C', 'B'],
  vvip:    ['A', 'B', 'C'],
}

// POST /api/agents/hire
// 인재풀에서 1클릭 채용 — SkillsMuse agents 풀 → HiveDesk hired_agents 기록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, agent_name, agent_role, skill_slugs, skill_count,
            primary_category, avg_quality_score, quality_grade, agent_type,
            assigned_exec, org_id } = body

    if (!agent_id || !agent_name || !agent_role || !assigned_exec || !org_id) {
      return NextResponse.json({ success: false, message: '필수 필드 누락' }, { status: 400 })
    }

    // CHRO는 채용 대상 임원이 아님
    if (assigned_exec === 'chro') {
      return NextResponse.json({ success: false, message: 'CHRO는 팀원 채용 대상이 아닙니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1) 조직 plan 확인
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', org_id)
      .single()

    const plan = (org?.plan as string) ?? 'free'
    const limit = PLAN_LIMITS[plan] ?? 0

    if (limit === 0) {
      return NextResponse.json({
        success: false,
        message: 'Pro 요금제로 업그레이드하면 팀원을 채용할 수 있습니다.',
        limitInfo: { reason: 'upgrade_required' }
      }, { status: 403 })
    }

    // v2.2: 등급 제한 체크
    const grade = ((quality_grade as string) || 'C').toUpperCase()
    const allowedGrades = PLAN_GRADE_LIMITS[plan] || []
    if (!allowedGrades.includes(grade)) {
      const gradeLabels: Record<string, string> = { A: 'Grade A (시니어)', B: 'Grade B (중급)', C: 'Grade C (주니어)' }
      return NextResponse.json({
        success: false,
        message: `${gradeLabels[grade] || grade} 인재는 현재 요금제(${plan})에서 채용할 수 없습니다. 업그레이드해 주세요.`,
        limitInfo: { reason: 'grade_restricted', grade, plan }
      }, { status: 403 })
    }

    // 2) 채용 한도 체크 (hired_agents 기준)
    const { count } = await supabase
      .from('hired_agents')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org_id)
      .eq('assigned_exec', assigned_exec)
      .eq('status', 'active')

    const current = count || 0
    if (current >= limit) {
      return NextResponse.json({
        success: false,
        message: `${assigned_exec.toUpperCase()} 산하 팀원이 ${limit}명으로 가득 찼습니다.`,
        limitInfo: { reason: 'limit_reached', current, limit }
      }, { status: 403 })
    }

    // 3) 쿠키에서 유저 ID
    const cookieStore = await cookies()
    const hired_by = cookieStore.get('hd_uid')?.value

    if (!hired_by) {
      return NextResponse.json({ success: false, message: '인증 필요' }, { status: 401 })
    }

    // 4) hired_agents 저장
    const { data: hired, error } = await supabase
      .from('hired_agents')
      .insert({
        org_id,
        hired_by,
        assigned_exec,
        agent_name,
        agent_role,
        skill_slugs: skill_slugs || [],
        skill_count: skill_count || 0,
        primary_category: primary_category || '',
        avg_quality_score: avg_quality_score || 0,
        quality_grade: quality_grade || 'C',
        agent_type: agent_type || 'type_a',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    // 5) SkillsMuse 인재풀 hired_count 증가 (비동기, 실패해도 무관)
    const SKILLSMUSE_URL = process.env.SKILLSMUSE_SUPABASE_URL
    const SKILLSMUSE_KEY = process.env.SKILLSMUSE_SECRET_KEY
    if (SKILLSMUSE_URL && SKILLSMUSE_KEY) {
      fetch(`${SKILLSMUSE_URL}/rest/v1/rpc/increment_agent_hired_count`, {
        method: 'POST',
        headers: {
          apikey: SKILLSMUSE_KEY,
          Authorization: `Bearer ${SKILLSMUSE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_agent_id: agent_id }),
      }).catch(() => {}) // fire-and-forget
    }

    // 채용 알림 (fire-and-forget)
    sendHireNotification({
      agentName:       agent_name,
      agentRole:       agent_role,
      assignedExec:    assigned_exec,
      qualityGrade:    quality_grade || 'C',
      primaryCategory: primary_category || '',
      isNewGeneration: false,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: `${agent_name}이(가) ${assigned_exec.toUpperCase()} 팀에 합류했습니다!`,
      hired,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
