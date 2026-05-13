// BudgetGuard — AI 비용 통제 미들웨어
// CFO 확정 예산: Starter $12 / Pro $55 / VVIP $160
// 80% 도달 시 경고 알림, 100% 도달 시 호출 차단

import { createServiceClient } from '@/lib/supabase'

// ── 요금제별 월 AI 예산 (CFO 확정, 2026-05-08) ─────────────────
export const PLAN_BUDGETS: Record<string, number> = {
  free:    0,
  starter: 12,
  pro:     55,
  vvip:    160,
}

// ── 모델별 토큰 단가 (per 1M tokens, USD) ──────────────────────
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6':        { input: 3.00,  output: 15.00 },
  'claude-haiku-4-5':         { input: 0.80,  output: 4.00  },
  'claude-3-5-haiku-20241022':{ input: 0.80,  output: 4.00  },
  'gemini-2.5-flash':         { input: 0.15,  output: 0.60  },
  'gpt-4o':                   { input: 2.50,  output: 10.00 },
}

// ── 타입 ────────────────────────────────────────────────────────
export interface BudgetStatus {
  allowed:       boolean
  monthly_usd:   number
  used_usd:      number
  remaining_usd: number
  pct_used:      number
  status:        string
  reason?:       string
}

export interface UsageRecord {
  orgId:        string
  model:        string
  inputTokens:  number
  outputTokens: number
  endpoint?:    string
}

// ── 비용 계산 헬퍼 ────────────────────────────────────────────
export function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0
  return (inputTokens / 1_000_000) * pricing.input
       + (outputTokens / 1_000_000) * pricing.output
}

// ── 텔레그램 알림 ─────────────────────────────────────────────
async function sendTelegramAlert(message: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
  } catch { /* 알림 실패는 무시 — 메인 흐름 차단 안 함 */ }
}

// ── 예산 행 자동 생성 (조직 첫 AI 호출 시) ────────────────────
export async function ensureBudget(orgId: string, plan: string): Promise<void> {
  const db         = createServiceClient()
  const monthlyUsd = PLAN_BUDGETS[plan] ?? 0

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  nextMonth.setHours(0, 0, 0, 0)

  await db.from('bot_budgets').upsert(
    {
      org_id:      orgId,
      monthly_usd: monthlyUsd,
      reset_at:    nextMonth.toISOString(),
      status:      'active',
    },
    { onConflict: 'org_id', ignoreDuplicates: true }
  )
}

// ── 호출 전 예산 확인 ──────────────────────────────────────────
export async function precheck(orgId: string): Promise<BudgetStatus> {
  const db = createServiceClient()

  const { data: budget, error } = await db
    .from('bot_budgets')
    .select('monthly_usd, used_usd, status')
    .eq('org_id', orgId)
    .single()

  if (error || !budget) {
    // 예산 미설정 조직 = 무제한 허용 (Free 플랜 미가입 or 레거시)
    return { allowed: true, monthly_usd: 0, used_usd: 0, remaining_usd: Infinity, pct_used: 0, status: 'no_budget' }
  }

  const monthly   = Number(budget.monthly_usd)
  const used      = Number(budget.used_usd)
  const remaining = monthly - used
  const pct       = monthly > 0 ? (used / monthly) * 100 : 0

  if (monthly === 0) {
    return { allowed: false, monthly_usd: 0, used_usd: used, remaining_usd: 0, pct_used: 100, status: 'free_plan', reason: 'upgrade_required' }
  }

  if (remaining <= 0) {
    return { allowed: false, monthly_usd: monthly, used_usd: used, remaining_usd: 0, pct_used: 100, status: 'overtime', reason: 'budget_exhausted' }
  }

  return { allowed: true, monthly_usd: monthly, used_usd: used, remaining_usd: remaining, pct_used: pct, status: budget.status }
}

// ── 호출 후 사용량 기록 (원자적 증가) ─────────────────────────
export async function record(usage: UsageRecord): Promise<void> {
  const { orgId, model, inputTokens, outputTokens, endpoint } = usage
  const cost = calcCost(model, inputTokens, outputTokens)
  if (cost <= 0) return

  const db = createServiceClient()

  // 1) append-only 로그 삽입
  await db.from('token_usage_logs').insert({
    org_id:        orgId,
    model,
    input_tokens:  inputTokens,
    output_tokens: outputTokens,
    cost_usd:      cost,
    endpoint:      endpoint ?? null,
  })

  // 2) 원자적 used_usd 증가 (레이스 컨디션 방지)
  await db.rpc('increment_used_usd', { p_org_id: orgId, p_amount: cost })

  // 3) 최신 예산 조회 → 80%/100% 알림 발송
  const { data: budget } = await db
    .from('bot_budgets')
    .select('monthly_usd, used_usd')
    .eq('org_id', orgId)
    .single()

  if (!budget) return

  const monthly = Number(budget.monthly_usd)
  const used    = Number(budget.used_usd)
  const pct     = monthly > 0 ? (used / monthly) * 100 : 0

  if (pct >= 100) {
    await db.from('bot_budgets').update({ status: 'overtime' }).eq('org_id', orgId)
    await sendTelegramAlert(
      `💸 <b>예산 소진 알림</b>\n조직 <code>${orgId.slice(0, 8)}…</code>\n이번 달 AI 예산이 전액 소진됐습니다.\n소진액: $${used.toFixed(2)} / $${monthly.toFixed(2)}`
    )
  } else if (pct >= 80 && pct < 100) {
    await sendTelegramAlert(
      `⚠️ <b>예산 80% 경고</b>\n조직 <code>${orgId.slice(0, 8)}…</code>\nAI 예산 ${pct.toFixed(1)}% 소진 — 잔여 $${(monthly - used).toFixed(2)}`
    )
  }
}

// ── 월 리셋 확인 및 실행 ──────────────────────────────────────
export async function checkAndResetIfDue(orgId: string): Promise<void> {
  const db = createServiceClient()

  const { data: budget } = await db
    .from('bot_budgets')
    .select('reset_at, monthly_usd')
    .eq('org_id', orgId)
    .single()

  if (!budget) return
  if (new Date(budget.reset_at) > new Date()) return

  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  nextMonth.setHours(0, 0, 0, 0)

  await db.from('bot_budgets')
    .update({ used_usd: 0, status: 'active', reset_at: nextMonth.toISOString(), updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
}
