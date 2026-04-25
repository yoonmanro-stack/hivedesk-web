import TelegramLoginButton from '@/components/TelegramLoginButton'

export default function LandingPage() {
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
        <div className="flex items-center gap-3">
          <button className="text-xs font-medium text-[#F5F0E8]/40 hover:text-amber-400 transition-colors px-2 py-1 cursor-pointer">
            KO
          </button>
          <span className="text-[#F5F0E8]/20">|</span>
          <button className="text-xs font-medium text-[#F5F0E8]/40 hover:text-amber-400 transition-colors px-2 py-1 cursor-pointer">
            EN
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Badge */}
        <div className="fade-in-up fade-in-up-delay-1 inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-400/80 tracking-widest uppercase">
            Company-in-a-Box · Beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-in-up fade-in-up-delay-2 max-w-3xl text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
          당신만의{" "}
          <span className="text-shimmer">AI 임원진 군단</span>을
          <br />
          텔레그램 데스크에 고용하세요
        </h1>

        {/* Sub-headline */}
        <p className="fade-in-up fade-in-up-delay-3 max-w-xl text-base md:text-lg text-[#F5F0E8]/50 leading-relaxed mb-10">
          지시만 내리고 밥 먹으러 가세요. AI들이 밤새 일하고
          <br className="hidden md:block" />
          결과만 텔레그램으로 보고합니다.
        </p>

        {/* Telegram CTA — 실제 Login Widget */}
        <div className="fade-in-up fade-in-up-delay-4 flex flex-col items-center gap-3 mb-4">
          <TelegramLoginButton
            botName="hivedesk_bot"
            authUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/telegram/callback`}
          />
          <p className="text-xs text-[#F5F0E8]/25 tracking-wide">
            No email. No password. No BS.
          </p>
        </div>

        {/* Social proof hint */}
        <div className="fade-in-up fade-in-up-delay-5 flex items-center gap-2 text-xs text-[#F5F0E8]/25 mt-4">
          <div className="flex -space-x-1">
            {["🧑‍💼", "👩‍💻", "👨‍🏪"].map((emoji, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-amber-400/20 flex items-center justify-center text-[10px]"
              >
                {emoji}
              </span>
            ))}
          </div>
          <span>얼리버드 대기 중 · 7일 무료 트라이얼</span>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="relative z-10 px-6 pb-24 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xs font-semibold tracking-[0.3em] uppercase text-amber-400/60 mb-12">
            HiveDesk가 하는 일
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="feature-card glass rounded-2xl p-6 amber-glow">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="text-base font-bold text-[#F5F0E8] mb-2">
                원 클릭 부서 설립
              </h3>
              <p className="text-sm text-[#F5F0E8]/45 leading-relaxed">
                &quot;매출 20% 올리고 싶어&quot; 한 마디면 텔레그램 TFT 방이
                파지고, 마케팅·디자인·회계 봇이 자동 출근합니다.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card glass rounded-2xl p-6">
              <div className="text-3xl mb-4">⚔️</div>
              <h3 className="text-base font-bold text-[#F5F0E8] mb-2">
                AI 임원 대결 시스템
              </h3>
              <p className="text-sm text-[#F5F0E8]/45 leading-relaxed">
                봇들이 단톡방에서 싸우고 최적안 A/B만 당신 폰에 올립니다.
                Yes/No 버튼 하나로 결재 끝.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card glass rounded-2xl p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-base font-bold text-[#F5F0E8] mb-2">
                블랙박스 실행력
              </h3>
              <p className="text-sm text-[#F5F0E8]/45 leading-relaxed">
                승인 버튼 하나면 인스타 예약 포스팅, 광고 입찰, Vercel 배포까지.
                터미널? 당신은 몰라도 됩니다.
              </p>
            </div>

            {/* Card 4 — VVIP, spans full width on md */}
            <div className="feature-card glass rounded-2xl p-6 md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 border-amber-400/20">
              <div className="text-3xl shrink-0">🛡️</div>
              <div>
                <h3 className="text-base font-bold text-[#F5F0E8] mb-1">
                  VVIP 개발자 전용 샌드박스
                </h3>
                <p className="text-sm text-[#F5F0E8]/45 leading-relaxed">
                  격리된 Docker 환경에서 루트 권한 AI 에이전트가 브랜치를 파고
                  코드를 짜고 테스트합니다. Vercel Preview URL이 텔레그램으로
                  도착하면 &quot;배포해&quot; 한 마디로 본섭 머지.
                </p>
              </div>
              <div className="shrink-0 md:ml-auto">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                  💻 VVIP Dev Edition
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 text-center px-6 pb-28">
        <p className="text-2xl md:text-3xl font-bold text-[#F5F0E8]/80 mb-2">
          직원 관리는 단톡방에서,
        </p>
        <p className="text-2xl md:text-3xl font-bold text-shimmer mb-10">
          서버 관리는 AI가.
        </p>
        <button
          className="cta-pulse flex items-center gap-3 mx-auto bg-amber-400 hover:bg-amber-300 text-[#0D0D0D] font-bold text-sm px-8 py-4 rounded-xl transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.99l-2.93-.916c-.637-.204-.65-.637.136-.943l11.435-4.41c.53-.194.993.131.083.5z" />
          </svg>
          지금 무료로 시작하기 · 7일 트라이얼
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[#F5F0E8]/5 px-6 py-8 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐝</span>
            <span className="text-sm font-semibold text-amber-400/70">HiveDesk.ai</span>
          </div>
          <p className="text-xs text-[#F5F0E8]/20">
            © 2026 HiveDesk.ai · Autonomous Neural Firm
          </p>
          <p className="text-xs text-[#F5F0E8]/20">
            The hive never sleeps.
          </p>
        </div>
      </footer>

      {/* Decorative ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/3 -right-32 w-80 h-80 rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </main>
  );
}
