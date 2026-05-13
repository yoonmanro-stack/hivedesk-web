'use client'

import { useState, useEffect, useCallback } from 'react'
import HireModal from '@/components/HireModal'

const EXECUTIVES = [
  { id: 'ceo',  title: 'CEO',  titleKo: '경영 총괄',   desc: '비전 수립, 전략 결정, 경영 자문',           detail: '회사의 방향성을 결정합니다. 사업 전략 수립, 주요 의사결정, 파트너십 협상 등 대표 역할을 수행하는 AI 경영 총괄입니다.',                                   color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_ceo'  },
  { id: 'coo',  title: 'COO',  titleKo: '운영 총괄',   desc: '비즈니스 운영, 고객 관리, 최적화',           detail: '회사가 매일 원활하게 돌아가도록 관리합니다. 고객 응대, 업무 프로세스 개선, 파트너 관계 관리 등 내부 살림을 총괄합니다.',                              color: '#F97316', bgGlow: 'rgba(249,115,22,0.15)',  tgCommand: 'chat_coo'  },
  { id: 'cpo',  title: 'CPO',  titleKo: '제품 총괄',   desc: 'UX 설계, 기능 기획, 로드맵 관리',           detail: '사용자가 편하게 쓸 수 있는 제품을 설계합니다. PRD 작성, 사용자 리서치, 로드맵 우선순위를 담당합니다.',                                                   color: '#8B5CF6', bgGlow: 'rgba(139,92,246,0.15)',  tgCommand: 'chat_cpo'  },
  { id: 'cdo',  title: 'CDO',  titleKo: '디자인 총괄', desc: 'UI/UX 디자인, 브랜드 에셋, 그래픽',          detail: '제품의 미적 감각과 사용자 경험을 시각적으로 구현합니다. 브랜드 정체성 확립, 화면 레이아웃, 픽셀 퍼펙트 디자인을 담당합니다.',                          color: '#A855F7', bgGlow: 'rgba(168,85,247,0.15)',  tgCommand: 'chat_cdo'  },
  { id: 'cmo',  title: 'CMO',  titleKo: '마케팅 총괄', desc: 'SNS, SEO, 광고, 콘텐츠 전략',               detail: '브랜드를 세상에 알리는 역할입니다. 인스타·유튜브·블로그 기획, 구글 SEO, 광고 카피, 마케팅 캠페인 설계를 담당합니다.',                               color: '#EC4899', bgGlow: 'rgba(236,72,153,0.15)',  tgCommand: 'chat_cmo'  },
  { id: 'cto',  title: 'CTO',  titleKo: '기술 총괄',   desc: '앱·웹 개발, 서버 구축, AI 자동화',          detail: '기술적인 모든 것을 담당합니다. 새 기능 개발, 서버 운영, 코드 오류 수정, 배포 자동화까지 제품이 작동하게 만드는 임원입니다.',                          color: '#3B82F6', bgGlow: 'rgba(59,130,246,0.15)',  tgCommand: 'chat_cto'  },
  { id: 'cfo',  title: 'CFO',  titleKo: '재무 총괄',   desc: '예산 관리, 비용 분석, 수익 전략',            detail: '회사 돈의 흐름을 관리합니다. 이번 달 비용, ROI 분석, 절약 포인트를 파악하고 재무 전략을 수립합니다.',                                                  color: '#10B981', bgGlow: 'rgba(16,185,129,0.15)',  tgCommand: 'chat_cfo'  },
  { id: 'chro', title: 'CHRO', titleKo: '인사 총괄',   desc: '팀원 채용, 조직 설계, 인재 관리',            detail: '맞는 사람을 찾아 팀을 꾸립니다. 4,500+ SkillsMuse 인재풀에서 전문가를 추천하고 조직 문화와 HR 정책을 설계합니다.',                                   color: '#06B6D4', bgGlow: 'rgba(6,182,212,0.15)',   tgCommand: 'hire_team' },
  { id: 'clo',  title: 'CLO',  titleKo: '법무 총괄',   desc: '리스크 관리, 계약 검토, 규제 준수',          detail: '회사의 법적 리스크를 최소화합니다. 계약서 검토, 이용약관 작성, 저작권 및 규제 가이드라인을 제공합니다.',                                               color: '#EAB308', bgGlow: 'rgba(234,179,8,0.15)',   tgCommand: 'chat_clo'  },
]

type Executive = typeof EXECUTIVES[number]

const CEO_EXEC = EXECUTIVES[0]
const REST_EXECS = EXECUTIVES.slice(1)

function execImgSrc(id: string) {
  return `/characters/${id}.png`
}

declare global {
  interface Window {
    Telegram?: { WebApp?: { close: () => void; openTelegramLink: (url: string) => void; sendData: (data: string) => void; isExpanded: boolean; expand: () => void } }
  }
}

function openTelegramAction(command: string) {
  const tg = window.Telegram?.WebApp
  if (tg) { tg.sendData(JSON.stringify({ action: command })) }
  else { window.open(`https://t.me/hivedesk_bot?start=${command}`, '_blank') }
}

export default function DashboardPage() {
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showWebAlert, setShowWebAlert] = useState(false)
  const [webAlertAction, setWebAlertAction] = useState('')
  const [showHireModal, setShowHireModal] = useState(false)
  const [hireExec, setHireExec] = useState<Executive | null>(null)
  const [hiredSkills, setHiredSkills] = useState<Record<string, any[]>>({})

  useEffect(() => {
    setMounted(true)
    const tg = window.Telegram?.WebApp
    if (tg && !tg.isExpanded) tg.expand()
    fetchHiredSkills()
  }, [])

  const fetchHiredSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/hire/list')
      if (res.ok) {
        const data = await res.json()
        const grouped: Record<string, any[]> = {}
        for (const skill of (data.skills || [])) {
          const exec = skill.assigned_exec || 'cto'
          if (!grouped[exec]) grouped[exec] = []
          grouped[exec].push(skill)
        }
        setHiredSkills(grouped)
      }
    } catch (e) { console.warn('hired skills fetch failed:', e) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen])

  const handleExecClick = (exec: Executive) => { setSelectedExec(exec); setPanelOpen(true) }
  const closePanel = () => { setPanelOpen(false); setTimeout(() => setSelectedExec(null), 300) }

  const handleQuickAction = (command: string, label: string) => {
    if (command === 'hire_team') { setHireExec(null); setShowHireModal(true); return }
    const tg = window.Telegram?.WebApp
    if (tg) { tg.sendData(JSON.stringify({ action: command })) }
    else { setWebAlertAction(label); setShowWebAlert(true) }
  }

  const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>, color: string) => {
    const target = e.currentTarget; target.onerror = null; target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      parent.style.background = `radial-gradient(circle at 50% 50%, ${color}40, transparent 80%)`
      const icon = document.createElement('span')
      icon.textContent = '🐝'
      icon.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2rem;'
      parent.appendChild(icon)
    }
  }

  return (
    <main className="min-h-screen hero-bg honeycomb-bg relative">
      {/* Header */}
      <header className="border-b border-amber-500/10 backdrop-blur-md bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl bee-float">🐝</span>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-shimmer">HiveDesk</h1>
              <p className="text-[9px] text-[#F5F0E8]/60">AI 1인 기업 · 9인 임원</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="glass px-2 py-1 rounded-full text-[9px] sm:text-xs font-medium text-amber-400 border-amber-500/20">🚀 Starter</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">👤</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        {/* Title */}
        <section className={`mb-2 ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-lg sm:text-2xl font-bold mb-1">🏢 Nine Agent</h2>
          <p className="text-[11px] sm:text-sm text-[#F5F0E8]/70">9인 임원 AI에게 직접 대화하고 작업을 지시하세요</p>
        </section>

        {/* Version Badge */}
        <div className={`flex justify-center mb-4 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <span className="glass px-3 py-1 rounded-full text-[9px] sm:text-xs font-medium text-amber-400 border-amber-500/20 tracking-widest uppercase">● v4.0 · Nine Executives</span>
        </div>

        {/* CEO — Featured Top Card */}
        <section className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <button
            onClick={() => handleExecClick(CEO_EXEC)}
            className="tap-fast group glass amber-glow rounded-2xl px-6 py-4 text-center border-amber-500/30 flex flex-col items-center w-full max-w-[220px] sm:max-w-[260px] hover:scale-[1.02] transition-transform active:scale-95"
          >
            <div className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-2xl overflow-hidden mb-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]" style={{ background: `linear-gradient(135deg, #111111 60%, ${CEO_EXEC.color}30)` }}>
              <img src={execImgSrc('ceo')} alt="CEO" className="absolute inset-0 w-full h-full object-contain p-2" loading="eager" onError={(e) => imgFallback(e, CEO_EXEC.color)} />
            </div>
            <p className="text-amber-400 font-bold text-sm sm:text-base">👑 CEO</p>
            <p className="text-[10px] text-[#F5F0E8]/60">경영 총괄 AI</p>
            <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">● 대기중</span>
          </button>
        </section>

        {/* Connecting Lines */}
        <div className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="w-px h-3 bg-gradient-to-b from-amber-500/40 to-amber-500/10"></div>
        </div>
        <div className={`flex justify-center mb-4 ${mounted ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"></div>
        </div>

        {/* 8 Executives — 3×3 Grid */}
        <section className={`grid grid-cols-3 max-w-4xl mx-auto gap-2 sm:gap-4 mb-5 ${mounted ? 'fade-in-up fade-in-up-delay-3' : 'opacity-0'}`}>
          {REST_EXECS.map((exec, index) => (
            <button
              key={exec.id}
              onClick={() => handleExecClick(exec)}
              className={`tap-fast group relative flex flex-col items-center text-center focus:outline-none ${index >= 6 ? (index === 6 ? 'col-start-1' : '') : ''}`}
            >
              <div
                className="w-full rounded-2xl p-2 sm:p-3 transition-all duration-200 hover:scale-[1.04] active:scale-95 group-hover:shadow-lg border border-white/5"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${exec.color}20, #0d0d0d 65%)`, borderColor: `${exec.color}20` }}
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2" style={{ background: `linear-gradient(135deg, #111111 60%, ${exec.color}25)` }}>
                  <img src={execImgSrc(exec.id)} alt={exec.title} className="absolute inset-0 w-full h-full object-contain p-1" loading="lazy" onError={(e) => imgFallback(e, exec.color)} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"></span>
                </div>
                <p className="text-[11px] sm:text-sm font-bold" style={{ color: exec.color }}>{exec.title}</p>
                <p className="text-[9px] sm:text-[10px] text-[#F5F0E8]/50 truncate">{exec.titleKo}</p>
              </div>
            </button>
          ))}
          {/* Center last row (2 items) by adding invisible spacer */}
          {REST_EXECS.length % 3 === 2 && <div className="invisible" aria-hidden />}
        </section>
      </div>

      {/* ── Slide-up Panel ── */}
      {selectedExec && (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePanel} />
          <div className={`relative w-full max-w-lg glass rounded-t-3xl p-4 sm:p-6 transition-transform duration-300 max-h-[85vh] overflow-y-auto ${panelOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <button onClick={closePanel} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors">✕</button>

            {(() => {
              const exec = selectedExec
              return (
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border" style={{ borderColor: `${exec.color}40`, background: `linear-gradient(135deg, #111111, ${exec.color}25)` }}>
                      <img src={execImgSrc(exec.id)} alt={exec.title} className="absolute inset-0 w-full h-full object-contain p-1.5" onError={(e) => imgFallback(e, exec.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl sm:text-2xl font-bold truncate" style={{ color: exec.color }}>{exec.title}</h3>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] shrink-0"></span>
                      </div>
                      <p className="text-sm text-[#F5F0E8]/70 mb-1 font-semibold">{exec.titleKo}</p>
                      <p className="text-[11px] text-[#F5F0E8]/60 leading-relaxed">{exec.desc}</p>
                      {exec.detail && <p className="mt-2 text-[11px] text-[#F5F0E8]/45 leading-relaxed border-t border-white/10 pt-2">{exec.detail}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                    {[
                      { val: String((hiredSkills[exec.id] || []).length), label: '팀원 배속', color: exec.color },
                      { val: '$0.00', label: '이번 달 비용', color: '#34D399' },
                      { val: '0', label: '완료 작업', color: '#FBBF24' },
                    ].map(({ val, label, color }) => (
                      <div key={label} className="glass rounded-xl p-2.5 sm:p-3 text-center">
                        <p className="text-sm sm:text-lg font-bold" style={{ color }}>{val}</p>
                        <p className="text-[9px] sm:text-[10px] text-[#F5F0E8]/60 mt-0.5 truncate">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[#F5F0E8]/80">👥 팀원</h4>
                      <span className="text-[9px] sm:text-[10px] text-[#F5F0E8]/50">{(hiredSkills[exec.id] || []).length} / 5</span>
                    </div>
                    {(hiredSkills[exec.id] || []).length > 0 ? (
                      <div className="space-y-2">
                        {(hiredSkills[exec.id] || []).map((skill: any) => (
                          <div key={skill.id} className="glass rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${exec.color}15`, border: `1px solid ${exec.color}25` }}>🧠</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#F5F0E8] truncate">{skill.skill_name}</p>
                              <p className="text-[10px] text-[#F5F0E8]/40">{skill.skill_category} · {skill.difficulty || 'intermediate'}</p>
                            </div>
                            {skill.quality_score > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: skill.quality_score >= 80 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: skill.quality_score >= 80 ? '#34D399' : '#FBBF24' }}>{skill.quality_score}점</span>
                            )}
                          </div>
                        ))}
                        <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 border border-dashed" style={{ color: `${exec.color}80`, borderColor: `${exec.color}30` }}>+ 팀원 추가 채용</button>
                      </div>
                    ) : (
                      <div className="glass rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl mb-2">🔍</span>
                        <p className="text-[10px] sm:text-xs text-[#F5F0E8]/60 mb-3">아직 채용된 팀원이 없습니다</p>
                        <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="text-sm font-bold px-4 py-2 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}30` }}>🔍 CHRO에게 채용 요청</button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button onClick={() => openTelegramAction(exec.tgCommand)} className="font-bold text-xs sm:text-sm py-3 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}30` }}>💬 대화하기</button>
                    <button onClick={() => openTelegramAction('task_' + exec.tgCommand.replace('chat_', ''))} className="font-bold text-xs sm:text-sm py-3 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}15`, color: `${exec.color}AA`, border: `1px solid ${exec.color}20` }}>📋 작업 지시</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Web Alert Modal */}
      {showWebAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 max-w-xs w-full text-center">
            <span className="text-3xl mb-3 block">📱</span>
            <h3 className="font-bold text-sm mb-2">{webAlertAction}</h3>
            <p className="text-xs text-[#F5F0E8]/60 mb-4">텔레그램 앱에서 hivedesk_bot을 통해 이용해주세요.</p>
            <a href="https://t.me/hivedesk_bot" target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2 hover:brightness-110 transition-all">텔레그램으로 이동 →</a>
            <button onClick={() => setShowWebAlert(false)} className="text-[10px] text-[#F5F0E8]/40 hover:text-[#F5F0E8]/60">닫기</button>
          </div>
        </div>
      )}

      <HireModal
        isOpen={showHireModal}
        onClose={() => { setShowHireModal(false); setHireExec(null) }}
        onHired={() => fetchHiredSkills()}
        orgId="default"
        parentExec={hireExec ? { id: hireExec.id, title: hireExec.title, titleKo: hireExec.titleKo, color: hireExec.color } : null}
      />
    </main>
  )
}
