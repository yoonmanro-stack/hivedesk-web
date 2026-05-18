import { NextRequest, NextResponse } from 'next/server'

// SkillsMuse 인재풀 검색
// GET /api/agents/search?role=&category=&exec=&limit=5
export async function GET(req: NextRequest) {
  const role     = req.nextUrl.searchParams.get('role')?.trim() || ''
  const category = req.nextUrl.searchParams.get('category')?.trim() || ''
  const exec     = req.nextUrl.searchParams.get('exec')?.trim() || ''
  const limit    = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '5'), 10)

  const SKILLSMUSE_URL = process.env.SKILLSMUSE_SUPABASE_URL
  const SKILLSMUSE_KEY = process.env.SKILLSMUSE_SECRET_KEY

  if (!SKILLSMUSE_URL || !SKILLSMUSE_KEY) {
    return NextResponse.json({ agents: [], error: 'SkillsMuse 환경변수 누락' }, { status: 500 })
  }

  try {
    // v_popular_agents 뷰 사용 (grade A→D, hired_count DESC 정렬)
    const params = new URLSearchParams({
      select: 'id,agent_name,agent_role,primary_category,sub_category,skill_slugs,skill_tags,skill_count,avg_quality_score,quality_grade,agent_type,hired_count,recommended_exec,employment_history',
      limit: String(limit),
      order: 'hired_count.desc,avg_quality_score.desc',
    })

    // 복합 검색: role 키워드 → agent_role / agent_name / skill_tags / sub_category
    const conditions: string[] = []

    if (role) {
      const kw = encodeURIComponent(`%${role}%`)
      conditions.push(
        `agent_role.ilike.${kw}`,
        `agent_name.ilike.${kw}`,
        `sub_category.ilike.${kw}`,
        `primary_category.ilike.${kw}`,
      )
    }

    if (conditions.length > 0) {
      params.set('or', `(${conditions.join(',')})`)
    }

    // 카테고리 필터 (exact match)
    if (category) {
      params.set('primary_category', `eq.${category}`)
    }

    const url = `${SKILLSMUSE_URL}/rest/v1/v_popular_agents?${params.toString()}`

    const res = await fetch(url, {
      headers: {
        apikey: SKILLSMUSE_KEY,
        Authorization: `Bearer ${SKILLSMUSE_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    })

    if (!res.ok) {
      // v_popular_agents 뷰 실패 시 agents 테이블 직접 검색 폴백
      const fallbackParams = new URLSearchParams({
        select: 'id,agent_name,agent_role,primary_category,sub_category,skill_slugs,skill_tags,skill_count,avg_quality_score,quality_grade,agent_type,hired_count,recommended_exec,employment_history',
        limit: String(limit),
        order: 'hired_count.desc,avg_quality_score.desc',
      })
      if (role) {
        const kw = encodeURIComponent(`%${role}%`)
        fallbackParams.set('or', `(agent_role.ilike.${kw},agent_name.ilike.${kw})`)
      }
      if (category) fallbackParams.set('primary_category', `eq.${category}`)

      const fallbackRes = await fetch(`${SKILLSMUSE_URL}/rest/v1/agents?${fallbackParams.toString()}`, {
        headers: { apikey: SKILLSMUSE_KEY, Authorization: `Bearer ${SKILLSMUSE_KEY}` },
      })
      const agents = await fallbackRes.json()
      return NextResponse.json({ agents: Array.isArray(agents) ? agents : [], total: agents?.length || 0 })
    }

    const agents = await res.json()

    // 임원 궁합 우선 정렬
    const sorted = [...(Array.isArray(agents) ? agents : [])].sort((a: any, b: any) => {
      const aMatch = a.recommended_exec === exec ? 0 : 1
      const bMatch = b.recommended_exec === exec ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      return (gradeOrder[a.quality_grade] ?? 4) - (gradeOrder[b.quality_grade] ?? 4)
    })

    return NextResponse.json({ agents: sorted, total: sorted.length })
  } catch (err: any) {
    return NextResponse.json({ agents: [], error: err.message })
  }
}
