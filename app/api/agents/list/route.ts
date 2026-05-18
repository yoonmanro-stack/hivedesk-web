import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

// GET /api/agents/list?org_id=xxx
// 내 조직의 hired_agents 목록 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const orgId = req.nextUrl.searchParams.get('org_id')
      || cookieStore.get('hd_org_id')?.value

    if (!orgId) {
      return NextResponse.json({ agents: [] })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('hired_agents')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('hired_at', { ascending: false })

    if (error) {
      return NextResponse.json({ agents: [], error: error.message })
    }

    return NextResponse.json({ agents: data || [] })
  } catch (err: any) {
    return NextResponse.json({ agents: [], error: err.message })
  }
}
