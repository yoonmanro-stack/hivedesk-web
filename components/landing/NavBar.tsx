"use client";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-[#F5F0E8]/5 bg-[#0D0D0D]/80 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl bee-float">🐝</span>
        <span className="text-lg font-bold tracking-tight text-amber-400">
          HiveDesk<span className="text-[#F5F0E8]/40">.ai</span>
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "어떻게 작동하나요", href: "#how" },
          { label: "기능", href: "#features" },
          { label: "요금제", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-xs font-medium text-[#F5F0E8]/50 hover:text-amber-400 transition-colors tracking-wide"
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href="https://t.me/HiveDeskBot"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#0D0D0D] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors duration-200"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.99l-2.93-.916c-.637-.204-.65-.637.136-.943l11.435-4.41c.53-.194.993.131.083.5z" />
        </svg>
        무료로 시작
      </a>
    </nav>
  );
}
