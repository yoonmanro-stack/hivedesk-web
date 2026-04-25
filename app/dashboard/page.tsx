'use client'

import { useState, useEffect } from 'react'
// using native img to avoid next/image optimization issues in dev

// Lucky Seven 임원 데이터
const EXECUTIVES = [
  { id: 'cto',  title: 'CTO',  titleKo: '기술 임원',   desc: '코드 작성, 아키텍처, 배포 자동화',        color: '#3B82F6', bgGlow: 'rgba(59,130,246,0.15)' },
  { id: 'cmo',  title: 'CMO',  titleKo: '마케팅 임원', desc: 'SNS, SEO, 광고, 콘텐츠 전략',             color: '#EC4899', bgGlow: 'rgba(236,72,153,0.15)' },
  { id: 'cfo',  title: 'CFO',  titleKo: '재무 임원',   desc: '비용 추적, ROI 분석, 예산 경고',           color: '#10B981', bgGlow: 'rgba(16,185,129,0.15)' },
  { id: 'cpo',  title: 'CPO',  titleKo: '제품 임원',   desc: 'UX 설계, 기능 기획, 사용자 리서치',        color: '#8B5CF6', bgGlow: 'rgba(139,92,246,0.15)' },
  { id: 'coo',  title: 'COO',  titleKo: '운영 임원',   desc: '고객 지원, 물류, 프로세스 최적화',         color: '#F97316', bgGlow: 'rgba(249,115,22,0.15)' },
  { id: 'chro', title: 'CHRO', titleKo: '채용 임원',   desc: '4,500+ 인재풀에서 팀원 자동 채용',        color: '#06B6D4', bgGlow: 'rgba(6,182,212,0.15)' },
  { id: 'cao',  title: 'CAO',  titleKo: '감사 임원',   desc: '행동 감사, 비용 감시, 월간 리포트',        color: '#EAB308', bgGlow: 'rgba(234,179,8,0.15)' },
]

type Executive = typeof EXECUTIVES[number]

export default function DashboardPage() {
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleExecClick = (exec: Executive) => {
    setSelectedExec(exec)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedExec(null), 300)
  }

  return (
    <main className="min-h-screen hero-bg honeycomb-bg relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-amber-500/10 backdrop-blur-md bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl bee-float">🐝</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-shimmer">HiveDesk</h1>
              <p className="text-[10px] text-[#F5F0E8]/60">AI Neural Firm</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="glass px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium text-amber-400 border-amber-500/20">
              🚀 Starter
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">
              👤
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        {/* Title */}
        <section className={`mb-2 ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">🎰 Seven Agent</h2>
          <p className="text-xs sm:text-sm text-[#F5F0E8]/70">
            임원 Agent를 터치하면 상세 정보를 확인할 수 있습니다
          </p>
        </section>

        {/* Version Badge */}
        <div className={`flex justify-center mb-5 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <span className="glass px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium text-pink-400 border-pink-500/20 tracking-widest uppercase">
            ● v3.0 Beta
          </span>
        </div>

        {/* CEO — Queen Bee */}
        <section className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="glass amber-glow rounded-2xl px-5 py-4 text-center border-amber-500/30 flex flex-col items-center">
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-xl overflow-hidden mb-2 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
              <img
                src="/characters/ceo.png"
                alt="CEO 여왕벌"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <p className="text-amber-400 font-bold text-sm">👑 CEO</p>
            <p className="text-[10px] text-[#F5F0E8]/60">여왕벌 · 대표님</p>
          </div>
        </section>

        {/* Connecting Lines */}
        <div className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="w-px h-4 bg-gradient-to-b from-amber-500/40 to-amber-500/10"></div>
        </div>
        <div className={`flex justify-center mb-3 ${mounted ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"></div>
        </div>

        {/* Executive Character Grid */}
        <section className={`grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6 ${mounted ? 'fade-in-up fade-in-up-delay-3' : 'opacity-0'}`}>
          {EXECUTIVES.map((exec) => (
            <button
              key={exec.id}
              onClick={() => handleExecClick(exec)}
              className="group relative flex flex-col items-center text-center focus:outline-none"
            >
              {/* Vertical line */}
              <div className="w-px h-3 bg-gradient-to-b from-amber-500/25 to-transparent mb-2"></div>
              
              {/* Character Card */}
              <div 
                className="relative w-full aspect-square rounded-2xl overflow-hidden glass feature-card border transition-all duration-300"
                style={{ borderColor: `${exec.color}25` }}
              >
                {/* Glow background */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${exec.bgGlow}, transparent 70%)` }}
                />
                
                {/* Character Image */}
                <img
                  src={`/characters/${exec.id}.png`}
                  alt={exec.titleKo}
                  className="absolute inset-0 w-full h-full object-cover p-1 rounded-2xl transition-transform duration-300 group-hover:scale-110"
                />

                {/* Status indicator */}
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300/50 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              </div>

              {/* Label */}
              <p className="mt-2 font-bold text-xs sm:text-sm transition-colors duration-200" style={{ color: exec.color }}>
                {exec.title}
              </p>
              <p className="text-[9px] sm:text-[10px] text-[#F5F0E8]/60">{exec.titleKo}</p>
            </button>
          ))}
        </section>

        {/* Stats */}
        <section className={`glass rounded-2xl p-5 mb-6 ${mounted ? 'fade-in-up fade-in-up-delay-4' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-amber-400">7</p>
              <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60 mt-0.5">활성 임원</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-cyan-400">35</p>
              <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60 mt-0.5">채용 가능 팀원</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">$0.00</p>
              <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60 mt-0.5">이번 달 사용</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-violet-400">4,500+</p>
              <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60 mt-0.5">SkillsMuse 인재풀</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${mounted ? 'fade-in-up fade-in-up-delay-5' : 'opacity-0'}`}>
          <button className="glass feature-card rounded-2xl p-4 sm:p-5 text-left group">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold text-sm text-amber-400 group-hover:text-amber-300 transition-colors">새 프로젝트</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60">목표를 던지면 AI 임원이 자동 배치</p>
          </button>
          <button className="glass feature-card rounded-2xl p-4 sm:p-5 text-left group">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">🔍</span>
              <h3 className="font-bold text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">팀원 채용</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60">CHRO가 최적 인력을 추천합니다</p>
          </button>
          <button className="glass feature-card rounded-2xl p-4 sm:p-5 text-left group">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">📊</span>
              <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">감사 리포트</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60">CAO가 활동·비용을 분석합니다</p>
          </button>
        </section>
      </div>

      {/* ============================================================ */}
      {/* Center Modal */}
      {/* ============================================================ */}
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closePanel}
      />

      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${panelOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
          <div 
            className="bg-[#111] rounded-2xl border overflow-hidden relative"
            style={{ borderColor: selectedExec ? `${selectedExec.color}30` : '#333' }}
          >
            {/* Close Button */}
            <button 
              onClick={closePanel}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-all"
            >
              ✕
            </button>

            {selectedExec && (
              <div className="px-6 py-6">
                {/* Header with Character */}
                <div className="flex items-center gap-5 mb-6">
                  <div 
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border"
                    style={{ 
                      borderColor: `${selectedExec.color}30`,
                      boxShadow: `0 0 40px ${selectedExec.bgGlow}`
                    }}
                  >
                    <img
                      src={`/characters/${selectedExec.id}.png`}
                      alt={selectedExec.titleKo}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold" style={{ color: selectedExec.color }}>
                        {selectedExec.title}
                      </h3>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                    </div>
                    <p className="text-sm text-[#F5F0E8]/70 mb-2">{selectedExec.titleKo}</p>
                    <p className="text-xs text-[#F5F0E8]/60">{selectedExec.desc}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-base sm:text-lg font-bold" style={{ color: selectedExec.color }}>5</p>
                    <p className="text-[10px] text-[#F5F0E8]/60 mt-0.5">팀원 슬롯</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-base sm:text-lg font-bold text-emerald-400">$0.00</p>
                    <p className="text-[10px] text-[#F5F0E8]/60 mt-0.5">이번 달 비용</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-base sm:text-lg font-bold text-amber-400">0</p>
                    <p className="text-[10px] text-[#F5F0E8]/60 mt-0.5">완료 작업</p>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#F5F0E8]/80">👥 팀원</h4>
                    <span className="text-[10px] text-[#F5F0E8]/50">0 / 5</span>
                  </div>
                  <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">🔍</span>
                    <p className="text-xs text-[#F5F0E8]/60 mb-3">아직 채용된 팀원이 없습니다</p>
                    <button 
                      className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:brightness-110"
                      style={{ backgroundColor: `${selectedExec.color}20`, color: selectedExec.color, border: `1px solid ${selectedExec.color}30` }}
                    >
                      🔍 CHRO에게 채용 요청
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="font-bold text-sm py-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: `${selectedExec.color}20`, color: selectedExec.color, border: `1px solid ${selectedExec.color}30` }}
                  >
                    💬 대화하기
                  </button>
                  <button 
                    className="font-bold text-sm py-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: `${selectedExec.color}15`, color: `${selectedExec.color}AA`, border: `1px solid ${selectedExec.color}20` }}
                  >
                    📋 작업 지시
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
