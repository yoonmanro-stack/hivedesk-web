import { NextRequest, NextResponse } from 'next/server'

// SkillsMuse 공개 에이전트 풀 검색
// GET /api/agents/search?role=&exec=&limit=3
export async function GET(req: NextRequest) {
  const role  = req.nextUrl.searchParams.get('role')?.trim() || ''
  const exec  = req.nextUrl.searchParams.get('exec')?.trim() || ''
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '3'), 6)

  const SKILLSMUSE_URL = process.env.SKILLSMUSE_SUPABASE_URL
  const SKILLSMUSE_KEY = process.env.SKILLSMUSE_SERVICE_ROLE_KEY

  if (!SKILLSMUSE_URL || !SKILLSMUSE_KEY) {
    return NextResponse.json({ agents: [], error: 'SkillsMuse 환경변수 누락 (SKILLSMUSE_SUPABASE_URL, SKILLSMUSE_SERVICE_ROLE_KEY)' }, { status: 500 })
  }

  try {
    // v_popular_agents 뷰에서 검색 (Grade A→B 우선, hired_count 정렬)
    let url = `${SKILLSMUSE_URL}/rest/v1/v_popular_agents?select=*&limit=${limit}`

    // 역할 키워드 검색 (agent_role, agent_name ilike)
    if (role) {
      const keyword = encodeURIComponent(`%${role}%`)
      url += `&or=(agent_role.ilike.${keyword},agent_name.ilike.${keyword},primary_category.ilike.${keyword})`
    }

    // 임원 궁합 필터 (recommended_exec 일치 우선 — 클라이언트에서 정렬)
    if (exec && exec !== 'chro') {
      // recommended_exec가 일치하거나 null인 경우 포함
      url += `&or=(recommended_exec.eq.${exec},recommended_exec.is.null)`
    }

    const res = await fetch(url, {
      headers: {
        apikey: SKILLSMUSE_KEY,
        Authorization: `Bearer ${SKILLSMUSE_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // 30초 캐시
    })

    if (!res.ok) {
      throw new Error(`SkillsMuse API ${res.status}`)
    }

    const agents = await res.json()

    // 임원 궁합 우선 정렬 (recommended_exec 일치하는 것 먼저)
    const sorted = [...agents].sort((a: any, b: any) => {
      const aMatch = a.recommended_exec === exec ? 0 : 1
      const bMatch = b.recommended_exec === exec ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      // 같으면 Grade 순 (A=0, B=1, C=2, D=3)
      const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      const aGrade = gradeOrder[a.quality_grade] ?? 4
      const bGrade = gradeOrder[b.quality_grade] ?? 4
      return aGrade - bGrade
    })

    return NextResponse.json({ agents: sorted.slice(0, limit), total: agents.length })
  } catch (err: any) {
    // 풀 검색 실패 시 빈 결과 (Method 2로 폴백)
    return NextResponse.json({ agents: [], error: err.message })
  }
}
