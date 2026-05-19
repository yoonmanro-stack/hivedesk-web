import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendHireNotification } from '@/lib/telegram'

// 에이전트 신규 생성 채용
// POST /api/agents/generate
// ① HiveDesk hired_agents 저장 + ② SkillsMuse agents 풀 등록
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, category, sub_category, skill_tags, requirements, assigned_exec, org_id, member_name, org_label } = body

    if (!role || !assigned_exec || !org_id) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터 누락 (role, assigned_exec, org_id)' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1) 플랜 한도 체크
    const { data: org } = await supabase
      .from('organizations')
      .select('plan, name')
      .eq('id', org_id)
      .single()

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

    // 2) HiveDesk hired_agents 저장
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
        agent_type: 'type_c',   // HiveDesk 커스텀 생성
        status: 'active',
        hired_at: now,
        source_agent_id: null,
      })
      .select('id, agent_name')
      .single()

    if (insertErr) {
      console.error('[/api/agents/generate] HiveDesk insert error:', insertErr)
      return NextResponse.json(
        { success: false, message: 'DB 저장 실패: ' + insertErr.message },
        { status: 500 }
      )
    }

    // 3) SkillsMuse agents 풀에도 등록 (인재풀 선순환)
    const SKILLSMUSE_URL = process.env.SKILLSMUSE_SUPABASE_URL
    const SKILLSMUSE_KEY = process.env.SKILLSMUSE_SECRET_KEY

    if (SKILLSMUSE_URL && SKILLSMUSE_KEY) {
      // 기존 동일 role 에이전트가 있는지 확인 (hired_count 증가만 할지)
      const checkRes = await fetch(
        `${SKILLSMUSE_URL}/rest/v1/agents?agent_role=ilike.${encodeURIComponent(role)}&primary_category=eq.${encodeURIComponent(category || '')}&limit=1`,
        { headers: { apikey: SKILLSMUSE_KEY, Authorization: `Bearer ${SKILLSMUSE_KEY}` } }
      )
      const existing = await checkRes.json()

      // skill_tags: slug에서 추출하거나 role 토큰화
      const derivedTags = role
        .split(/[\s,\/&]+/)
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 1)

      const employmentEntry = {
        org_label: org_label || org?.name || 'HiveDesk 사용자',
        exec_title: assigned_exec?.toUpperCase() || 'CTO',
        hired_at: now,
        context: category || 'general',
      }

      if (existing && existing.length > 0) {
        // 기존 에이전트 → hired_count++ + employment_history append
        const existingAgent = existing[0]
        const updatedHistory = [...(existingAgent.employment_history || []), employmentEntry]

        await fetch(`${SKILLSMUSE_URL}/rest/v1/agents?id=eq.${existingAgent.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SKILLSMUSE_KEY,
            Authorization: `Bearer ${SKILLSMUSE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            hired_count: (existingAgent.hired_count || 0) + 1,
            employment_history: updatedHistory,
          }),
        })
      } else {
        // 신규 에이전트 → 풀에 새로 등록
        await fetch(`${SKILLSMUSE_URL}/rest/v1/agents`, {
          method: 'POST',
          headers: {
            apikey: SKILLSMUSE_KEY,
            Authorization: `Bearer ${SKILLSMUSE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            agent_name: agentName,
            agent_role: role,
            primary_category: category || 'general',
            sub_category: sub_category || null,
            skill_slugs: [],
            skill_tags: skill_tags?.length ? skill_tags : derivedTags,
            skill_count: 0,
            avg_quality_score: 0,
            quality_grade: 'C',
            agent_type: 'type_c',
            hired_count: 1,
            employment_history: [employmentEntry],
            requirements: requirements || null,
            source: 'hivedesk',
            recommended_exec: assigned_exec || null,
          }),
        })
      }
    }

    // 4) n8n 파이프라인 트리거 (비동기)
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

    // 채용 알림 (fire-and-forget)
    sendHireNotification({
      agentName:       agentName,
      agentRole:       role,
      assignedExec:    assigned_exec,
      qualityGrade:    'C',
      primaryCategory: category || 'general',
      isNewGeneration: true,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: `${agentName} 채용 완료! 인재풀에도 등록됐습니다.`,
      agent_id: agent?.id,
      agent_name: agentName,
    })

  } catch (e: any) {
    console.error('[/api/agents/generate] error:', e)
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
