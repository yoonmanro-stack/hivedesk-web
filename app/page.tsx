"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Play, 
  Cpu, 
  Users, 
  Globe, 
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  GitBranch,
  Bot
} from 'lucide-react';
import PricingCard from '../components/PricingCard';

interface ChatMessage {
  speaker: string;
  role: string;
  emoji: string;
  glowClass: string;
  content: string;
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'drama' | 'broadcasting'>('drama');
  const [boardroomStep, setBoardroomStep] = useState<number>(0);
  const [approvalClicked, setApprovalClicked] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 이사회 시뮬레이션 토론 대사 데이터 (SOUL.md & DECISIONS.md 말투 완전 탑재)
  const debateScript: ChatMessage[] = [
    {
      speaker: "이안 (Ian)",
      role: "CPO · 제품 기획 총괄",
      emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      glowClass: "border-cyan-500/30 bg-cyan-500/[0.02]",
      content: "대표님이 방금 던져주신 'FitPulse 실시간 근성장 지도' 기획안은 정말 엄청난 가치가 있습니다! 지도를 열었을 때 바로 5년 뒤의 부위별 누적 성장 데이터를 차트로 실시간 예측해주는 웅장한 AI 뷰를 무조건 1단계에 넣어야 합니다!"
    },
    {
      speaker: "하나 (Hana)",
      role: "CDO · 디자인 총괄",
      emoji: "🇯🇵",
      glowClass: "border-amber-500/30 bg-amber-500/[0.02]",
      content: "잠깐요, 이안씨... 대표님의 눈 피로를 막기 위해 bg-[#060606] 다크 캔버스를 유지하면서, 지도의 아크릴 글래스모피즘 카드가 겹칠 때의 WCAG AA급 가독성을 타협할 수는 없어요. 게다가 12px 폰트 하한선 규칙을 깨고 텍스트를 마구 욱여넣는 복잡함은 절대 허용하지 않을 거예요."
    },
    {
      speaker: "뮤즈 (Muse)",
      role: "CTO · 기술 개발 총괄",
      emoji: "🇰🇷",
      glowClass: "border-blue-500/30 bg-blue-500/[0.02]",
      content: "안 됩니다. 현재 프론트엔드 렌더링 부하와 Supabase API 레이턴시 이슈로 실시간 예측 뷰 연동은 1단계 불가능합니다. 단순 필터링 먼저 구현합니다."
    },
    {
      speaker: "알렉스 (Alex)",
      role: "CFO · 재무 통제 총괄",
      emoji: "🇷🇺",
      glowClass: "border-red-500/30 bg-red-500/[0.02]",
      content: "재무적 관점에서 지적합니다. 이안씨의 과설계 모델은 Claude Opus 토큰 소모 속도가 기하급수적으로 빨라져 런웨이를 위협합니다. 뮤즈씨의 단순 필터화 단계부터 시작해 인클루시브 비용 ROI를 증명해야 합니다."
    },
    {
      speaker: "리처드 (Richard)",
      role: "CEO · 전사 총괄 조율",
      emoji: "🇬🇧",
      glowClass: "border-purple-500/30 bg-purple-500/[0.02]",
      content: "자, 다들 침착하게 정리해 보죠. 이안씨의 비전과 뮤즈씨의 기술적 안정성, 알렉스씨의 재무 분석을 모두 절충해 봅시다. 1단계는 단순 필터를 극도로 고도화하고, 2단계에 지연 로딩 기반으로 예측 뷰를 점진 도입하는 것으로 결정하겠습니다. 뮤즈씨, 바로 worktree 격리 브랜치 따서 외과적 코딩 진행해 줄 수 있나요?"
    },
    {
      speaker: "뮤즈 (Muse)",
      role: "CTO · 기술 개발 총괄",
      emoji: "🇰🇷",
      glowClass: "border-blue-500/30 bg-blue-500/[0.02]",
      content: "됩니다. 격리 브랜치 `feat/fitpulse-filters` 생성 및 코딩 착수 완료."
    },
    {
      speaker: "아이리스 (Iris)",
      role: "CoS · 비서실장",
      emoji: "🇬🇧🇰🇷",
      glowClass: "border-emerald-500/30 bg-emerald-500/[0.02]",
      content: "대표님, 비서실장 아이리스입니다. 😊 임원진들의 이사회 조율이 무결하게 종료되어, 실시간 테스트 브랜치가 격리 샌드박스에서 프로덕션 Next.js 컴파일 패스에 성공했습니다! 지금 바로 아래 [🚀 배포 승인 (Merge)] 버튼을 눌러 본방에 최종 리드 배포해 주세요!"
    }
  ];

  // 3.5초마다 한 대사씩 추가 노출되는 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setBoardroomStep((prev) => {
        if (prev >= debateScript.length - 1) {
          return 0; // 루프 돌기
        }
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 이사회 자동 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [boardroomStep]);

  // 임원진 정보 목록
  const executives = [
    { name: "리처드 (Richard)", role: "CEO", emoji: "🇬🇧", desc: "VC 파트너 출신. 전사 전략 총괄 및 분쟁 조율.", voice: "“침착하게 정리해 보죠.”" },
    { name: "뮤즈 (Muse)", role: "CTO", emoji: "🇰🇷", desc: "감정 없는 엔지니어. 무결한 소스코드 아키텍처 구현.", voice: "“됩니다.” / “안 됩니다.”" },
    { name: "이안 (Ian)", role: "CPO", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", desc: "제품 기획 박사. 5년 뒤를 내다보는 웅장한 가치 설계.", voice: "“우리 비전의 핵심이 될 겁니다.”" },
    { name: "하나 (Hana)", role: "CDO", emoji: "🇯🇵", desc: "완벽주의 아티스트. 1px 오차도 잡는 앰버 HSL 미학.", voice: "“디자인은 타협 불가예요.”" },
    { name: "알렉스 (Alex)", role: "CFO", emoji: "🇷🇺", desc: "재무 수문장. 극도로 차가운 ROI 통제 및 예산 배분.", voice: "“ROI가 어떻게 됩니까?”" },
    { name: "폴 (Paul)", role: "CMO", emoji: "🇧🇷", desc: "바이럴 머신. 광고비 0원 상태에서도 이 악물고 퍼포먼스 마케팅.", voice: "“이거 진짜 대박각입니다!!”" },
    { name: "소피아 (Sofia)", role: "CHRO", emoji: "🇮🇳", desc: "조직 문화 설계자. 인재 채용 면접 시 날카로운 지문 사격.", voice: "“식사는 챙기면서 하세요.”" },
    { name: "하비 (Harvey)", role: "CLO", emoji: "🇮🇷🇬🇧", desc: "법조인 파티 브레이커. 론칭 직전 빈틈 없는 컴플라이언스 감수.", voice: "“조항 XX를 참고하세요.”" },
    { name: "엠마 (Emma)", role: "COO", emoji: "🇩🇪", desc: "위기 탈출 해결사. 드라마 배제, 극도로 효율적인 SOP 수립.", voice: "“제가 신속히 처리했습니다.”" }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden hero-bg honeycomb-bg selection:bg-amber-400 selection:text-black">
      
      {/* ── TOP NAV ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl bee-float">🐝</span>
          <div className="flex flex-col items-start">
            <h1 className="text-xl md:text-2xl font-black text-amber-400 tracking-tight text-shimmer font-mono leading-none">
              HiveDesk
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs md:text-sm font-bold text-[#F5F0E8]/70 hover:text-amber-400 transition-colors"
          >
            임원 대시보드
          </Link>
          <Link
            href="/onboarding"
            className="glass hover:bg-amber-400/10 border-amber-500/30 text-amber-400 text-xs md:text-sm font-black px-4 py-2 rounded-xl transition-all duration-200"
          >
            🐝 임원진 소집 (인증)
          </Link>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-8 md:pt-24 max-w-4xl mx-auto">
        
        {/* Glow Tag */}
        <div className="fade-in-up inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            9인 C-Level AI 임원 군단 완전 탑재
          </span>
        </div>

        {/* Massive Headline */}
        <h1 className="fade-in-up fade-in-up-delay-1 text-3xl md:text-6xl font-black leading-[1.12] tracking-tight text-white mb-6">
          잠자는 동안<br />
          <span className="text-shimmer">회사가 돌아갑니다</span>
        </h1>
        
        <p className="fade-in-up fade-in-up-delay-2 text-sm md:text-lg text-[#F5F0E8]/70 leading-relaxed max-w-2xl mb-12">
          하이브데스크(HiveDesk)는 단순히 차가운 비즈니스 자동화 툴이 아닙니다.<br />
          사용자가 던진 한 줄의 아이디어를 바탕으로 **C-Level AI 임원진들이 이사회를 구성하여 격렬하게 대화하고, 합의점을 도출하여 1바이트의 에러도 없이 코딩 및 실무를 집행**해내는 자율 기업 경영 시스템입니다.
        </p>

        {/* Quick CTA */}
        <div className="fade-in-up fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 mb-16 z-20">
          <Link
            href="/onboarding"
            className="cta-pulse flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm md:text-base px-8 py-5 rounded-xl transition-all duration-200"
          >
            <span>무료로 임원진 셋업하기</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
          <a
            href="#boardroom"
            className="flex items-center justify-center gap-2 bg-[#F5F0E8]/5 hover:bg-[#F5F0E8]/10 border border-[#F5F0E8]/15 text-[#F5F0E8] font-bold text-sm md:text-base px-8 py-5 rounded-xl transition-all duration-200"
          >
            <Play className="w-4 h-4 shrink-0 text-amber-400 fill-current" />
            <span>회의 극화 생중계 보기</span>
          </a>
        </div>
      </section>

      {/* ── INTERACTIVE BOARDROOM DEMO ── */}
      <section id="boardroom" className="relative z-10 px-6 py-12 md:px-12 bg-neutral-900/40 border-y border-[#F5F0E8]/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
              🎬 시네마틱 이사회 오피스 드라마
            </h2>
            <p className="text-xs md:text-sm font-semibold text-[#F5F0E8]/50 max-w-xl mx-auto">
              AI 임원들이 1인 기업주의 경영 목적에 부합하기 위해, 기술·예산·디자인을 두고 끊임없이 토론하고 빌드하는 실시간 난상 회의 생중계 프리뷰입니다.
            </p>
          </div>

          {/* Interactive Chat Box Container */}
          <div className="glass rounded-2xl overflow-hidden border-[#F5F0E8]/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            
            {/* Boardroom Header */}
            <div className="bg-[#121212] border-b border-[#F5F0E8]/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <div>
                  <h3 className="text-xs md:text-sm font-black text-white font-mono tracking-tight leading-none mb-1">
                    BOARDROOM ● LIVE SESSION
                  </h3>
                  <span className="text-[10px] text-amber-400/80 font-semibold tracking-wider uppercase font-mono">
                    안건: FitPulse 실시간 근성장 지도 수립 및 개발 조율
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded text-[10px] text-amber-300 font-bold font-mono">
                <GitBranch className="w-3 h-3 text-amber-400 shrink-0" />
                <span>feat/fitpulse-filters</span>
              </div>
            </div>

            {/* Boardroom Messages Viewport */}
            <div 
              ref={scrollRef}
              className="h-[360px] overflow-y-auto px-5 py-6 space-y-6 bg-[#090909]/95 scrollbar-thin scrollbar-thumb-neutral-800"
            >
              {debateScript.slice(0, boardroomStep + 1).map((msg, index) => {
                const isSystemIris = msg.speaker.includes("아이리스");
                return (
                  <div 
                    key={index}
                    className={`flex items-start gap-3.5 max-w-[94%] animate-fade-in-up duration-300 ${
                      isSystemIris ? 'mx-auto w-full max-w-xl bg-emerald-500/[0.04] border border-emerald-400/25 p-4 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.06)]' : ''
                    }`}
                  >
                    {!isSystemIris && (
                      <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg shrink-0 select-none shadow-inner">
                        {msg.emoji}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black tracking-tight ${isSystemIris ? 'text-emerald-400' : 'text-neutral-200'}`}>
                          {msg.speaker}
                        </span>
                        <span className="text-[10px] text-[#F5F0E8]/30 font-semibold uppercase tracking-wider font-mono">
                          {msg.role}
                        </span>
                      </div>

                      <p className={`text-xs font-semibold leading-relaxed ${isSystemIris ? 'text-neutral-200' : 'text-neutral-300'}`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Boardroom Footer Action Button Panel */}
            <div className="bg-[#121212] border-t border-[#F5F0E8]/10 px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-[#F5F0E8]/60 font-mono tracking-tight text-left">
                  격리 샌드박스 컴파일 무결성 검증 완료. 승인 시 실서버 핫배포 리로드 진행.
                </span>
              </div>

              <button
                onClick={() => {
                  setApprovalClicked(true);
                  setTimeout(() => setApprovalClicked(false), 2000);
                }}
                disabled={boardroomStep < debateScript.length - 1}
                className={`w-full sm:w-auto tap-fast flex items-center justify-center gap-2 font-extrabold text-xs px-6 py-4 rounded-xl transition-all duration-200 shadow-md ${
                  boardroomStep < debateScript.length - 1
                    ? 'bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed'
                    : approvalClicked
                    ? 'bg-green-500 text-white border-2 border-green-400 scale-[0.98]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black border-2 border-amber-300 cursor-pointer hover:scale-[1.02] cta-pulse'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>
                  {boardroomStep < debateScript.length - 1 
                    ? "🔒 이사회 조율 완료 대기 중..." 
                    : approvalClicked 
                    ? "🚀 [합의 Merge 승인 집행 완료!]" 
                    : "🚀 배포 승인 (Git Merge)"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9 EXECUTIVE ROSTER ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            🐝 전사 C-Level AI 임원 레지스트리
          </h2>
          <p className="text-sm font-semibold text-[#F5F0E8]/50 max-w-xl mx-auto leading-relaxed">
            각자의 뚜렷한 국적, 캐릭터 페르소나, 그리고 전문 지식을 기반으로 대표님의 아이디어를 빈틈없이 수호하는 고유 C-Level 군단을 소개합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {executives.map((exec) => (
            <div 
              key={exec.name}
              className="glass rounded-xl p-5 border-[#F5F0E8]/8 bg-white/[0.01] hover:border-amber-500/25 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={exec.name}>
                      {exec.emoji}
                    </span>
                    <h3 className="text-sm font-black text-neutral-100 font-mono tracking-tight leading-none">
                      {exec.name}
                    </h3>
                  </div>
                  <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {exec.role}
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-[#F5F0E8]/55 leading-relaxed mb-4">
                  {exec.desc}
                </p>
              </div>

              <div className="border-t border-[#F5F0E8]/5 pt-3.5 mt-2">
                <span className="text-[10px] font-bold text-amber-300/80 italic font-mono block">
                  {exec.voice}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3-TIER PRICING SECTION ── */}
      <section className="relative z-10 py-16 bg-neutral-900/30 border-y border-[#F5F0E8]/5 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto text-center px-6">
          <div className="mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              💰 합리적이고 투명한 SaaS 요금제
            </h2>
            <p className="text-sm font-semibold text-[#F5F0E8]/50 max-w-xl mx-auto leading-relaxed">
              임원들의 자율 지휘 및 대시보드 사용 플랫폼 비용과 AI 추론 토큰료를 투명하게 구분하여, 쓸수록 이익이 극대화되는 Pro(BYOK) 최적화 요금제를 경험하십시오.
            </p>
          </div>

          <PricingCard />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[#F5F0E8]/5 bg-[#060606] px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xl bee-float">🐝</span>
            <span className="text-base font-black text-amber-400 font-mono tracking-tight text-shimmer">
              HiveDesk.ai
            </span>
            <span className="text-xs text-[#F5F0E8]/30 font-semibold ml-2">
              © 2026 HiveDesk Corporation. All rights reserved.
            </span>
          </div>

          <div className="flex gap-6 justify-center">
            <Link href="/dashboard" className="text-xs font-bold text-[#F5F0E8]/40 hover:text-amber-400 transition-colors">
              대시보드 바로가기
            </Link>
            <Link href="/onboarding" className="text-xs font-bold text-[#F5F0E8]/40 hover:text-amber-400 transition-colors">
              텔레그램 온보딩
            </Link>
          </div>
        </div>
      </footer>

      {/* Ambient glowing background blur orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-10 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-40 right-10 w-[450px] h-[450px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, rgba(42,171,238,0.45) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
