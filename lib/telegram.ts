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

  // v2.2: 보류 작업 조회 (pending_hire_tasks)
  let pendingTask: { id: string; original_instruction: string } | null = null
  try {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY
    if (sbUrl && sbKey) {
      const res = await fetch(
        `${sbUrl}/rest/v1/pending_hire_tasks?exec_id=eq.${params.assignedExec?.toLowerCase()}&status=eq.pending&order=created_at.desc&limit=1`,
        { headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` } }
      )
      if (res.ok) {
        const rows = await res.json()
        if (rows.length > 0) {
          pendingTask = rows[0]
        }
      }
    }
  } catch (e) {
    console.error('[Telegram] 보류 작업 조회 실패:', (e as Error).message)
  }

  const textLines = [
    `🎉 <b>[${execLabel} 팀] 새 팀원 합류!</b>`,
    ``,
    `👤 <b>${params.agentName}</b>`,
    `🎯 역할: ${params.agentRole}`,
    `${gradeLabel}${category}`,
    `${typeLabel}`,
  ]

  if (pendingTask) {
    const instrPreview = pendingTask.original_instruction.substring(0, 80)
    textLines.push(``)
    textLines.push(`━━━━━━━━━━━━━━━━`)
    textLines.push(`📌 보류 작업: "${instrPreview}${pendingTask.original_instruction.length > 80 ? '...' : ''}"`)
  } else {
    textLines.push(``)
    textLines.push(`✅ HiveDesk 대시보드에서 확인하세요.`)
  }

  const text = textLines.join('\n')

  // 인라인 버튼 구성
  const reply_markup = pendingTask
    ? {
        inline_keyboard: [
          [
            { text: '▶️ 작업 재개', callback_data: `hire_resume_${pendingTask.id}` },
            { text: '❌ 취소', callback_data: `hire_cancel_${pendingTask.id}` }
          ]
        ]
      }
    : undefined

  try {
    const body: Record<string, unknown> = {
      chat_id:    chatId,
      text,
      parse_mode: 'HTML',
    }
    if (reply_markup) body.reply_markup = reply_markup

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] 알림 실패:', err)
    } else {
      console.log(`[Telegram] 채용 알림 전송 완료 — ${params.agentName} → ${execLabel}${pendingTask ? ' (보류 작업 연결)' : ''}`)
    }

    // 보류 작업 상태 업데이트 → 'notified' (재개 버튼 전송됨)
    if (pendingTask) {
      try {
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
        const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY
        if (sbUrl && sbKey) {
          await fetch(
            `${sbUrl}/rest/v1/pending_hire_tasks?id=eq.${pendingTask.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': sbKey,
                'Authorization': `Bearer ${sbKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ status: 'notified' })
            }
          )
        }
      } catch (e) {}
    }
  } catch (e: any) {
    console.error('[Telegram] 알림 예외:', e.message)
  }
}
