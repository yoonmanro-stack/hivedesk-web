import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET /api/me — 첫 번째 조직 반환 (1인 기업 모델)
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug, plan')
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ org_id: null, error: '조직 없음' }, { status: 404 })
    }

    return NextResponse.json({ org_id: data.id, name: data.name, plan: data.plan })
  } catch (e: any) {
    return NextResponse.json({ org_id: null, error: e.message }, { status: 500 })
  }
}
