import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id')

  if (!orgId) {
    return NextResponse.json({ skills: [], error: 'org_id 필요' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('hired_skills')
      .select('id, assigned_exec, skill_id, skill_name, skill_category, difficulty, quality_score, status, created_at')
      .eq('org_id', orgId)
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
