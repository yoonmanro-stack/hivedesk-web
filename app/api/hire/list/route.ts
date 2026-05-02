import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET: 조직의 채용된 팀원 목록 (임원별)
export async function GET() {
  try {
    const supabase = createServiceClient()

    // 모든 활성 hired_skills 가져오기 (추후 org_id 필터 추가)
    const { data, error } = await supabase
      .from('hired_skills')
      .select('id, assigned_exec, skill_id, skill_name, skill_category, difficulty, quality_score, status, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ skills: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ skills: data || [] })
  } catch (err: any) {
    return NextResponse.json({ skills: [], error: err.message }, { status: 500 })
  }
}
