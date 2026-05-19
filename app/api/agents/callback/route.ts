import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/agents/callback
// n8n 파이프라인 완료 후 호출 → hired_agents 상태/스킬 업데이트
// Authorization: Bearer <WEBHOOK_SECRET>
export async function POST(req: NextRequest) {
  try {
    // 1) 인증 — WEBHOOK_SECRET 검증
    const authHeader = req.headers.get('Authorization') || ''
    const secret = process.env.WEBHOOK_SECRET
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, message: '인증 실패' }, { status: 401 })
    }

    const body = await req.json()
    const {
      agent_id,       // hired_agents.id (필수)
      status,         // 'active' | 'failed'
      skill_slugs,    // string[] — 생성된 스킬 슬러그 목록
      skill_count,    // number
      quality_grade,  // 'A' | 'B' | 'C' | 'D'
      avg_quality_score, // number
      notes,          // 선택: n8n 처리 결과 메모
    } = body

    if (!agent_id) {
      return NextResponse.json({ success: false, message: 'agent_id 필수' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 2) 업데이트할 필드만 추출 (undefined 필드 제외)
    const updates: Record<string, any> = {}
    if (status)            updates.status            = status
    if (skill_slugs)       updates.skill_slugs       = skill_slugs
    if (skill_count  != null) updates.skill_count    = skill_count
    if (quality_grade)     updates.quality_grade     = quality_grade
    if (avg_quality_score != null) updates.avg_quality_score = avg_quality_score
    if (notes)             updates.notes             = notes

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: '업데이트할 필드 없음' }, { status: 400 })
    }

    // 3) hired_agents 업데이트
    const { data, error } = await supabase
      .from('hired_agents')
      .update(updates)
      .eq('id', agent_id)
      .select('id, agent_name, assigned_exec, status')
      .single()

    if (error) {
      console.error('[/api/agents/callback] DB 업데이트 실패:', error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    console.log(`[/api/agents/callback] 에이전트 업데이트 완료: ${data?.agent_name} (${data?.status})`)

    return NextResponse.json({
      success: true,
      message: `${data?.agent_name} 상태 업데이트 완료`,
      agent: data,
    })

  } catch (e: any) {
    console.error('[/api/agents/callback] 오류:', e)
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
