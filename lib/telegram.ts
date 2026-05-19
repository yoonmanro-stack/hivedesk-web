// ━━━ HiveDesk Telegram 알림 헬퍼 ━━━
// 채용 완료 시 텔레그램 즉시 알림 (fire-and-forget)
// 환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const EXEC_LABELS: Record<string, string> = {
  ceo:  '👑 CEO',
  cto:  '💻 CTO',
  cmo:  '📢 CMO',
  cfo:  '💰 CFO',
  cpo:  '👩‍💼 CPO',
  cdo:  '🧑 CDO',
  coo:  '🤝 COO',
  chro: '🏆 CHRO',
  clo:  '⚖️ CLO',
}

const GRADE_LABELS: Record<string, string> = {
  A: '🏅 Grade A',
  B: '⭐ Grade B',
  C: '✨ Grade C',
  D: '🔹 Grade D',
}

export interface HireNotificationParams {
  agentName: string
  agentRole: string
  assignedExec: string
  qualityGrade?: string
  primaryCategory?: string
  agentType?: string   // type_a | type_b | type_c
  isNewGeneration?: boolean  // true면 신규생성, false면 풀채용
}

export async function sendHireNotification(params: HireNotificationParams): Promise<void> {
  const token   = process.env.TELEGRAM_BOT_TOKEN
  const chatId  = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.log('[Telegram] 알림 스킵 — TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 미설정')
    return
  }

  const execLabel  = EXEC_LABELS[params.assignedExec?.toLowerCase()] ?? params.assignedExec?.toUpperCase()
  const gradeLabel = GRADE_LABELS[params.qualityGrade ?? 'C'] ?? ''
  const typeLabel  = params.isNewGeneration ? '🆕 신규 생성' : '🔍 인재풀 채용'
  const category   = params.primaryCategory ? ` | ${params.primaryCategory}` : ''

  const text = [
    `🎉 <b>[${execLabel} 팀] 새 팀원 합류!</b>`,
    ``,
    `👤 <b>${params.agentName}</b>`,
    `🎯 역할: ${params.agentRole}`,
    `${gradeLabel}${category}`,
    `${typeLabel}`,
    ``,
    `✅ HiveDesk 대시보드에서 확인하세요.`,
  ].join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] 알림 실패:', err)
    } else {
      console.log(`[Telegram] 채용 알림 전송 완료 — ${params.agentName} → ${execLabel}`)
    }
  } catch (e: any) {
    console.error('[Telegram] 알림 예외:', e.message)
  }
}
