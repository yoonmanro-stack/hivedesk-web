import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// 에이전트 신규 생성 채용
// POST /api/agents/generate
// hired_agents 테이블에 직접 저장 (구 hired_skills 플랜 한도 체크 없음)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, category, requirements, assigned_exec, org_id, member_name } = body

    if (!role || !assigned_exec || !org_id) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터 누락 (role, assigned_exec, org_id)' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1) 조직 plan 조회 — hired_agents 기준 한도 체크
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', org_id)
      .single()

    // 2) 해당 임원의 현재 hired_agents 수 확인
    const { count: agentCount } = await supabase
      .from('hired_agents')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org_id)
      .eq('assigned_exec', assigned_exec)
      .eq('status', 'active')

    const plan = org?.plan || 'starter'
    const AGENT_LIMITS: Record<string, number> = { free: 0, starter: 5, pro: 10, vvip: 9999 }
    const limit = AGENT_LIMITS[plan] ?? 5
    const current = agentCount || 0

    if (current >= limit) {
      return NextResponse.json(
        { success: false, message: `채용 한도 초과 (${current}/${limit}명). 플랜을 업그레이드하세요.` },
        { status: 400 }
      )
    }

    // 3) hired_agents에 신규 에이전트 등록
    const agentName = member_name || `${role} 에이전트`
    const now = new Date().toISOString()

    const { data: agent, error: insertErr } = await supabase
      .from('hired_agents')
      .insert({
        org_id,
        assigned_exec,
        agent_name: agentName,
        agent_role: role,
        skill_slugs: [],
        skill_count: 0,
        primary_category: category || 'general',
        avg_quality_score: 0,
        quality_grade: 'C',
        agent_type: 'type_a',    // n8n Factory 생성
        status: 'pending',        // 생성 중 → 완료 후 active
        hired_at: now,
        source_agent_id: null,
      })
      .select('id, agent_name')
      .single()

    if (insertErr) {
      console.error('[/api/agents/generate] insert error:', insertErr)
      return NextResponse.json(
        { success: false, message: 'DB 저장 실패: ' + insertErr.message },
        { status: 500 }
      )
    }

    // 4) n8n 생성 파이프라인 트리거 (비동기, 실패해도 무관)
    const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL
    if (N8N_WEBHOOK) {
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent?.id,
          role,
          category: category || 'general',
          requirements: requirements || '',
          assigned_exec,
          org_id,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: `${agentName} 채용 완료! (생성 파이프라인 진행 중)`,
      agent_id: agent?.id,
      agent_name: agentName,
    })

  } catch (e: any) {
    console.error('[/api/agents/generate] error:', e)
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
