import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'

const STEPS = [
  {
    id: 1,
    icon: '🔐',
    label: '텔레그램 인증',
    pendingLabel: '인증 대기',
  },
  {
    id: 2,
    icon: '🏢',
    label: '플랜 선택',
    pendingLabel: '텔레그램에서 진행',
  },
  {
    id: 3,
    icon: '📋',
    label: '사업 분야 설정',
    pendingLabel: '텔레그램에서 진행',
  },
  {
    id: 4,
    icon: '🏬',
    label: '워크스페이스 설립',
    pendingLabel: '텔레그램에서 진행',
  },
  {
    id: 5,
    icon: '🚀',
    label: 'AI 임원진 출근',
    pendingLabel: '완료 시 대시보드 진입',
  },
]

async function sendBotWelcome(telegramId: number, firstName: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const text = [
    `🐝 안녕하세요, ${firstName}님!`,
    '',
    'HiveDesk.ai에 오신 걸 환영합니다.',
    '',
    '저는 이안(Ian)입니다.',
    '오늘부터 당신의 AI 임원진 군단을 세팅해 드리겠습니다.',
    '',
    '먼저, 어떤 방식으로 HiveDesk를 사용하실 건가요?',
  ].join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏪 일반 사업자 / 크리에이터', callback_data: 'onboarding:plan:standard' }],
            [{ text: '💻 개발자 / 테크 창업가 (VVIP)', callback_data: 'onboarding:plan:vvip' }],
          ],
        },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const uid = cookieStore.get('hd_uid')?.value

  if (!uid) redirect('/')

  const db = createServiceClient()
  const { data: user } = await db
    .from('users')
    .select('id, first_name, telegram_id, onboarding_step')
    .eq('id', uid)
    .single()

  if (!user) redirect('/')
  if (user.onboarding_step === 99) redirect('/dashboard')

  // 최초 진입: 봇 웰컴 메시지 발송 + step 2로 전진
  if (user.onboarding_step === 1) {
    const sent = await sendBotWelcome(user.telegram_id, user.first_name)
    await db.from('users').update({ onboarding_step: 2 }).eq('id', uid)
    if (sent) {
      await db.from('onboarding_events').insert({
        user_id: uid,
        step: 1,
        event: 'completed',
        meta: { bot_welcome_sent: true },
      })
    }
  }

  // DB 상태 기준 현재 진행 단계 (최대 5)
  const currentStep = Math.max(1, Math.min(user.onboarding_step, 5))
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? 'hivedesk_bot'

  return (
    <main className="relative min-h-screen overflow-hidden hero-bg honeycomb-bg">

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl bee-float">🐝</span>
          <span className="text-lg font-bold tracking-tight text-amber-400">
            HiveDesk<span className="text-[#F5F0E8]/60">.ai</span>
          </span>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400/90">인증 완료</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-6 md:pt-14">

        {/* Auth success badge */}
        <div className="fade-in-up fade-in-up-delay-1 inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border-green-500/20">
          <span className="text-xs">✅</span>
          <span className="text-xs font-medium text-green-400/90 tracking-widest uppercase">
            Telegram 인증 완료
          </span>
        </div>

        {/* Welcome headline */}
        <h1 className="fade-in-up fade-in-up-delay-2 max-w-lg text-3xl md:text-5xl font-bold leading-[1.15] tracking-tight mb-4">
          환영합니다,{' '}
          <span className="text-shimmer">{user.first_name}님</span>
        </h1>
        <p className="fade-in-up fade-in-up-delay-3 text-sm md:text-base text-[#F5F0E8]/50 leading-relaxed mb-8 max-w-sm">
          AI 임원진 군단 소집 준비 완료.<br />
          텔레그램 DM에서 이안(Ian)이 안내를 시작했습니다.
        </p>

        {/* Telegram DM preview card */}
        <div className="fade-in-up fade-in-up-delay-4 w-full max-w-sm mb-10">
          <div className="glass rounded-2xl px-5 py-4 amber-glow text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2AABEE]/15 border border-[#2AABEE]/25 flex items-center justify-center text-base shrink-0">
                🐝
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#F5F0E8]/90">@{botUsername}</span>
                  <span className="text-[10px] text-[#F5F0E8]/25">방금 전</span>
                </div>
                <p className="text-xs text-[#F5F0E8]/55 leading-relaxed">
                  🐝 안녕하세요, {user.first_name}님!{' '}
                  HiveDesk.ai에 오신 걸 환영합니다. 저는 이안(Ian)입니다...
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] glass rounded px-2 py-1 text-[#F5F0E8]/40">
                    🏪 일반 사업자
                  </span>
                  <span className="text-[10px] glass rounded px-2 py-1 text-[#F5F0E8]/40">
                    💻 VVIP Dev
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS TIMELINE ── */}
      <section className="relative z-10 px-6 pb-8 md:px-12">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-amber-400/60 mb-7">
            온보딩 진행 현황
          </p>

          <div className="flex flex-col">
            {STEPS.map((step, idx) => {
              const isDone = step.id < currentStep
              const isCurrent = step.id === currentStep
              const isUpcoming = step.id > currentStep

              return (
                <div key={step.id} className="flex items-start gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={[
                        'w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0',
                        isDone
                          ? 'bg-amber-400/15 border border-amber-400/40'
                          : isCurrent
                          ? 'bg-amber-400/10 border-2 border-amber-400 step-pulse'
                          : 'bg-[#F5F0E8]/4 border border-[#F5F0E8]/10',
                      ].join(' ')}
                    >
                      {isDone ? '✅' : step.icon}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={[
                          'w-px h-8 my-1',
                          isDone ? 'bg-amber-400/35' : 'bg-[#F5F0E8]/8',
                        ].join(' ')}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pb-8 flex-1 pt-1.5">
                    <p
                      className={[
                        'text-sm font-semibold leading-tight',
                        isDone
                          ? 'text-amber-400/65'
                          : isCurrent
                          ? 'text-[#F5F0E8]'
                          : 'text-[#F5F0E8]/25',
                      ].join(' ')}
                    >
                      {step.label}
                    </p>
                    <p
                      className={[
                        'text-[11px] mt-0.5',
                        isDone
                          ? 'text-[#F5F0E8]/30'
                          : isCurrent
                          ? 'text-amber-400/70'
                          : 'text-[#F5F0E8]/18',
                      ].join(' ')}
                    >
                      {isDone ? '완료' : isCurrent ? '▶ 진행 중 — 텔레그램 확인' : step.pendingLabel}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 flex flex-col items-center gap-4 px-6 pb-24">
        <a
          href={`https://t.me/${botUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-pulse flex items-center gap-3 bg-[#2AABEE] hover:bg-[#1E9BDC] text-white font-bold text-sm px-8 py-4 rounded-xl transition-colors duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.99l-2.93-.916c-.637-.204-.65-.637.136-.943l11.435-4.41c.53-.194.993.131.083.5z" />
          </svg>
          텔레그램에서 이안(Ian) 만나기
        </a>
        <Link
          href="/"
          className="text-xs text-[#F5F0E8]/22 hover:text-[#F5F0E8]/50 transition-colors"
        >
          나중에 시작하기
        </Link>
      </section>

      {/* Ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/3 -right-32 w-80 h-80 rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(42,171,238,0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </main>
  )
}
