export default function HeroSection() {
  const TelegramIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.99l-2.93-.916c-.637-.204-.65-.637.136-.943l11.435-4.41c.53-.194.993.131.083.5z" />
    </svg>
  );

  return (
    <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 md:pt-44 md:pb-32">
      {/* Badge */}
      <div className="fade-in-up fade-in-up-delay-1 inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-amber-400/80 tracking-widest uppercase">
          Autonomous Neural Firm · Beta
        </span>
      </div>

      {/* Headline */}
      <h1 className="fade-in-up fade-in-up-delay-2 max-w-4xl text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
        당신만의{" "}
        <span className="text-shimmer">AI 임원진 군단</span>을<br />
        텔레그램 데스크에 고용하세요
      </h1>

      {/* Sub-headline */}
      <p className="fade-in-up fade-in-up-delay-3 max-w-xl text-base md:text-lg text-[#F5F0E8]/50 leading-relaxed mb-2">
        지시만 내리고 밥 먹으러 가세요.<br className="hidden md:block" />
        AI들이 밤새 일하고 결과만 텔레그램으로 보고합니다.
      </p>
      <p className="fade-in-up fade-in-up-delay-3 text-sm text-amber-400/50 leading-relaxed mb-10">
        직원 관리는 단톡방에서, 서버 관리는 AI가.
      </p>

      {/* CTA group */}
      <div className="fade-in-up fade-in-up-delay-4 flex flex-col sm:flex-row items-center gap-4 mb-8">
        <a
          href="https://t.me/HiveDeskBot"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-pulse flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0D0D0D] font-bold text-sm px-8 py-4 rounded-xl transition-colors duration-200"
        >
          <TelegramIcon />
          🐝 텔레그램으로 무료 시작
        </a>
        <a
          href="#how"
          className="flex items-center gap-2 glass hover:border-amber-400/40 text-[#F5F0E8]/70 hover:text-amber-400 font-medium text-sm px-6 py-4 rounded-xl transition-all duration-200"
        >
          어떻게 작동하나요 →
        </a>
      </div>

      {/* Trust signals */}
      <div className="fade-in-up fade-in-up-delay-5 flex flex-col sm:flex-row items-center gap-6 text-xs text-[#F5F0E8]/25">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {["🧑‍💼", "👩‍💻", "👨‍🏪", "👩‍🎨", "🧑‍🍳"].map((emoji, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-amber-400/20 flex items-center justify-center text-[10px]"
              >
                {emoji}
              </span>
            ))}
          </div>
          <span>얼리버드 대기 중</span>
        </div>
        <span className="hidden sm:block text-[#F5F0E8]/10">·</span>
        <span>✓ No email &nbsp; ✓ No password &nbsp; ✓ No BS</span>
        <span className="hidden sm:block text-[#F5F0E8]/10">·</span>
        <span>7일 무료 트라이얼</span>
      </div>

      {/* Mock telegram preview */}
      <div className="fade-in-up fade-in-up-delay-5 mt-16 w-full max-w-md glass rounded-2xl p-4 text-left amber-glow">
        <div className="flex items-center gap-2 mb-3 border-b border-[#F5F0E8]/5 pb-3">
          <span className="text-base">🐝</span>
          <span className="text-xs font-bold text-amber-400">HiveDesk</span>
          <span className="ml-auto text-[10px] text-[#F5F0E8]/20">지금</span>
        </div>
        <div className="space-y-2">
          {[
            { sender: "CEO (나)", msg: "다음 달 매출 30% 올리고 싶어", isMe: true },
            { sender: "⚙️ CTO", msg: "랜딩 A/B 테스트 브랜치 생성했습니다.", isMe: false },
            { sender: "📢 CMO", msg: "SNS 캠페인 초안 3개 작성 완료. 검토 부탁드립니다.", isMe: false },
            { sender: "💰 CFO", msg: "예산 초과 없음. ROI 예측 +34%.", isMe: false },
          ].map((item, i) => (
            <div key={i} className={`flex gap-2 ${item.isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-xl px-3 py-1.5 text-xs max-w-[85%] ${
                  item.isMe
                    ? "bg-amber-400/20 text-amber-200"
                    : "bg-[#F5F0E8]/5 text-[#F5F0E8]/70"
                }`}
              >
                {!item.isMe && (
                  <span className="block text-[10px] text-amber-400/60 mb-0.5 font-semibold">
                    {item.sender}
                  </span>
                )}
                {item.msg}
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 text-[10px] font-bold bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-lg py-1.5 hover:bg-amber-400/20 transition-colors">
              ✅ Approve
            </button>
            <button className="flex-1 text-[10px] font-bold bg-[#F5F0E8]/5 border border-[#F5F0E8]/10 text-[#F5F0E8]/40 rounded-lg py-1.5">
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
