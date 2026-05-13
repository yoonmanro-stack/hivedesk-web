import { NextRequest, NextResponse } from 'next/server'
import { precheck, checkAndResetIfDue } from '@/lib/budget-guard'

// GET /api/budget/status?org_id=xxx
// 현재 예산 잔여 현황 조회 (텔레그램 브릿지 + 대시보드 공용)
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id')
  if (!orgId) {
    return NextResponse.json({ error: 'org_id 필요' }, { status: 400 })
  }

  // 월 리셋 여부 확인
  await checkAndResetIfDue(orgId)

  const status = await precheck(orgId)
  return NextResponse.json(status)
}
