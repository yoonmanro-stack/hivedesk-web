import { NextRequest, NextResponse } from 'next/server'
import { record } from '@/lib/budget-guard'

// POST /api/budget/record
// 텔레그램 브릿지가 Anthropic API 호출 후 사용량을 기록하는 엔드포인트
// Body: { org_id, model, input_tokens, output_tokens, endpoint? }
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-budget-secret')
  if (secret !== process.env.BUDGET_RECORD_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const { org_id, model, input_tokens, output_tokens, endpoint } = await req.json()

    if (!org_id || !model || input_tokens == null || output_tokens == null) {
      return NextResponse.json({ error: '필수 필드 누락: org_id, model, input_tokens, output_tokens' }, { status: 400 })
    }

    await record({
      orgId:        org_id,
      model,
      inputTokens:  Number(input_tokens),
      outputTokens: Number(output_tokens),
      endpoint:     endpoint ?? undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
