import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/agents/fire
// 팀원 해제 (status → inactive)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, org_id } = body

    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('hired_agents')
      .update({ status: 'inactive' })
      .eq('id', agent_id)
      .eq('org_id', org_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '팀원이 해제되었습니다.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
