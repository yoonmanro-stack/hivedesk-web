import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// v2.1: hired_skills → hired_agents 통합 완료
// 이 엔드포인트는 하위 호환용으로 유지 (hired_agents 데이터를 skills 형태로 반환)
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id')

  if (!orgId) {
    return NextResponse.json({ skills: [], error: 'org_id 필요' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('hired_agents')
      .select('id, assigned_exec, agent_name, agent_role, primary_category, avg_quality_score, quality_grade, agent_type, status, hired_at')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('hired_at', { ascending: false })

    if (error) {
      return NextResponse.json({ skills: [], error: error.message }, { status: 500 })
    }

    // 하위 호환: hired_agents 필드를 hired_skills 응답 형태로 매핑
    const skills = (data || []).map(agent => ({
      id: agent.id,
      assigned_exec: agent.assigned_exec,
      skill_id: null,
      skill_name: agent.agent_name,
      skill_category: agent.primary_category || agent.agent_role,
      difficulty: 'intermediate',
      quality_score: agent.avg_quality_score || 0,
      quality_grade: agent.quality_grade || 'C',
      status: agent.status,
      created_at: agent.hired_at,
      // 원본 agent 데이터도 포함 (대시보드에서 활용 가능)
      _agent: agent,
    }))

    return NextResponse.json({ skills })
  } catch (err: any) {
    return NextResponse.json({ skills: [], error: err.message }, { status: 500 })
  }
}
