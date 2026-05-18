'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import HireModal from '@/components/HireModal'

const EXECUTIVES = [
  { id: 'ceo',  name: '리처드', title: 'CEO',  titleKo: '경영 총괄',   desc: '비전 수립, 전략 결정, 경영 자문',           detail: '회사의 방향성을 결정합니다. 사업 전략 수립, 주요 의사결정, 파트너십 협상 등 대표 역할을 수행하는 AI 경영 총괄입니다.',                                   color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_ceo'  },
  { id: 'coo',  name: '올리비아', title: 'COO',  titleKo: '운영 총괄',   desc: '비즈니스 운영, 고객 관리, 최적화',           detail: '회사가 매일 원활하게 돌아가도록 관리합니다. 고객 응대, 업무 프로세스 개선, 파트너 관계 관리 등 내부 살림을 총괄합니다.',                              color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_coo'  },
  { id: 'cpo',  name: '레오',    title: 'CPO',  titleKo: '제품 총괄',   desc: 'UX 설계, 기능 기획, 로드맵 관리',           detail: '사용자가 편하게 쓸 수 있는 제품을 설계합니다. PRD 작성, 사용자 리서치, 로드맵 우선순위를 담당합니다.',                                                   color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_cpo'  },
  { id: 'cdo',  name: '나디아',  title: 'CDO',  titleKo: '디자인 총괄', desc: 'UI/UX 디자인, 브랜드 에셋, 그래픽',          detail: '제품의 미적 감각과 사용자 경험을 시각적으로 구현합니다. 브랜드 정체성 확립, 화면 레이아웃, 픽셀 퍼펙트 디자인을 담당합니다.',                          color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_cdo'  },
  { id: 'cmo',  name: '조나스',  title: 'CMO',  titleKo: '마케팅 총괄', desc: 'SNS, SEO, 광고, 콘텐츠 전략',               detail: '브랜드를 세상에 알리는 역할입니다. 인스타·유튜브·블로그 기획, 구글 SEO, 광고 카피, 마케팅 캠페인 설계를 담당합니다.',                               color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_cmo'  },
  { id: 'cto',  name: '알렉스',  title: 'CTO',  titleKo: '기술 총괄',   desc: '앱·웹 개발, 서버 구축, AI 자동화',          detail: '기술적인 모든 것을 담당합니다. 새 기능 개발, 서버 운영, 코드 오류 수정, 배포 자동화까지 제품이 작동하게 만드는 임원입니다.',                          color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_cto'  },
  { id: 'cfo',  name: '소피아',  title: 'CFO',  titleKo: '재무 총괄',   desc: '예산 관리, 비용 분석, 수익 전략',            detail: '회사 돈의 흐름을 관리합니다. 이번 달 비용, ROI 분석, 절약 포인트를 파악하고 재무 전략을 수립합니다.',                                                  color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_cfo'  },
  { id: 'chro', name: '에마',    title: 'CHRO', titleKo: '인사 총괄',   desc: '팀원 채용, 조직 설계, 인재 관리',            detail: '맞는 사람을 찾아 팀을 꾸립니다. 4,500+ SkillsMuse 인재풀에서 전문가를 추천하고 조직 문화와 HR 정책을 설계합니다.',                                   color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'hire_team' },
  { id: 'clo',  name: '마커스',  title: 'CLO',  titleKo: '법무 총괄',   desc: '리스크 관리, 계약 검토, 규제 준수',          detail: '회사의 법적 리스크를 최소화합니다. 계약서 검토, 이용약관 작성, 저작권 및 규제 가이드라인을 제공합니다.',                                               color: '#F59E0B', bgGlow: 'rgba(245,158,11,0.15)',  tgCommand: 'chat_clo'  },
]

type Executive = typeof EXECUTIVES[number]

const CEO_EXEC = EXECUTIVES[0]
const REST_EXECS = EXECUTIVES.slice(1)

const COMPANY_TEAMS = [
  { label: '제품 · 기술', ids: ['cpo','cto','cdo'] },
  { label: '비즈니스 · 재무', ids: ['cmo','cfo'] },
  { label: '운영 · 조직', ids: ['coo','chro','clo'] },
]

function execImgSrc(id: string) {
  return `/characters/${id}.png?v=2`
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
  const [orgId, setOrgId] = useState<string>('')
  const [projects, setProjects] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<any>(null)
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [view, setView] = useState<'dashboard' | 'projects' | 'company'>('dashboard')

  useEffect(() => {
    setMounted(true)
    const tg = window.Telegram?.WebApp
    if (tg && !tg.isExpanded) tg.expand()
    // 조직 ID 로드 후 팀원 목록 + 프로젝트 fetch
    fetch('/api/me').then(r => r.json()).then(d => {
      const oid = d.org_id || ''
      if (oid) { setOrgId(oid); fetchHiredSkills(oid) }
      else fetchHiredSkills('')
      // 프로젝트 목록 로드 (org_id와 함께)
      fetch(`/api/projects${oid ? `?org_id=${oid}` : ''}`)
        .then(r => r.json())
        .then(d => {
          if (d.projects && d.projects.length > 0) {
            setProjects(d.projects)
            const active = d.projects.find((p: any) => p.active_project) || d.projects[0]
            if (active) setActiveProject(active)
          }
        }).catch(() => {})
    }).catch(() => fetchHiredSkills(''))
  }, [])

  const fetchHiredSkills = useCallback(async (currentOrgId?: string) => {
    const oid = currentOrgId || orgId
    try {
      const [skillsRes, agentsRes] = await Promise.allSettled([
        fetch(oid ? `/api/hire/list?org_id=${oid}` : '/api/hire/list'),
        fetch(oid ? `/api/agents/list?org_id=${oid}` : '/api/agents/list'),
      ])
      const grouped: Record<string, any[]> = {}

      if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
        const data = await skillsRes.value.json()
        for (const skill of (data.skills || [])) {
          const exec = skill.assigned_exec || 'cto'
          if (!grouped[exec]) grouped[exec] = []
          grouped[exec].push({ ...skill, _source: 'skill' })
        }
      }
      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await agentsRes.value.json()
        for (const agent of (data.agents || [])) {
          const exec = agent.assigned_exec || 'cto'
          if (!grouped[exec]) grouped[exec] = []
          grouped[exec].push({
            id: agent.id,
            skill_name: agent.agent_name,
            skill_category: agent.primary_category,
            difficulty: 'intermediate',
            quality_score: agent.avg_quality_score,
            quality_grade: agent.quality_grade,
            _source: 'agent',
            _agent: agent,
          })
        }
      }
      setHiredSkills(grouped)
    } catch (e) { console.warn('hired fetch failed:', e) }
  }, [orgId])

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
    <main className="h-screen overflow-y-auto hero-bg honeycomb-bg relative">
      {/* Header — 삼선(좌) · 로고(중앙) · 사람(우) */}
      <header className="border-b border-amber-500/10 backdrop-blur-md bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="px-3 py-3 grid grid-cols-3 items-center">
          {/* 좌: 삼선 메뉴 */}
          <button
            id="btn-nav-menu"
            onClick={() => setShowNavMenu(true)}
            className="flex flex-col gap-[5px] w-8 h-8 justify-center tap-fast"
          >
            <span className="block h-[2px] w-5 bg-[#F5F0E8]/70 rounded-full" />
            <span className="block h-[2px] w-4 bg-[#F5F0E8]/70 rounded-full" />
            <span className="block h-[2px] w-5 bg-[#F5F0E8]/70 rounded-full" />
          </button>
          {/* 중앙: 로고 */}
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-bold text-shimmer leading-tight">HiveDesk</h1>
            <p className="text-[8px] text-[#F5F0E8]/40 tracking-wide">AI 1인 기업 · 9인 임원</p>
          </div>
          {/* 우: 사람 아이콘 */}
          <div className="flex justify-end">
            <button
              id="btn-user-menu"
              onClick={() => setShowUserMenu(true)}
              className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm tap-fast hover:bg-amber-500/30 transition-colors"
            >👤</button>
          </div>
        </div>
      </header>

      {/* Nav 드로어 (왼쪽) */}
      {showNavMenu && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowNavMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-[#0D0D0D] border-r border-amber-500/15 flex flex-col" style={{ animation: 'slideInLeft 0.22s ease' }}>
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-amber-500/10">
              <span className="text-2xl bee-float">🐝</span>
              <div>
                <p className="text-sm font-bold text-shimmer">HiveDesk</p>
                <p className="text-[9px] text-[#F5F0E8]/50">AI 1인 기업 · 9인 임원</p>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {/* 프로젝트 섹션 */}
              <p className="px-5 pt-3 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">프로젝트</p>
              <Link href="/projects/new" onClick={() => setShowNavMenu(false)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-amber-500/8 transition-colors">
                <span className="text-base">＋</span>
                <div><p className="text-sm font-medium text-[#F5F0E8]/90">새 프로젝트</p><p className="text-[9px] text-[#F5F0E8]/40">새 프로젝트 등록</p></div>
              </Link>
              <button onClick={() => { setView('projects'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'projects' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">📁</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">내 프로젝트</p><p className="text-[9px] text-[#F5F0E8]/40">전체 프로젝트 목록</p></div>
              </button>
              {/* 운영 섹션 */}
              <p className="px-5 pt-4 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">운영</p>
              <button onClick={() => { setView('company'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'company' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">📊</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">회사 현황</p><p className="text-[9px] text-[#F5F0E8]/40">전체 조직 운영 현황</p></div>
              </button>
              <button onClick={() => { setView('dashboard'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'dashboard' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">💬</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">대시보드</p><p className="text-[9px] text-[#F5F0E8]/40">9인 임원 대화 및 지시</p></div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10">
              <p className="text-[9px] text-[#F5F0E8]/25">HiveDesk v1.3</p>
            </div>
          </div>
        </>
      )}

      {/* User 드로어 (오른쪽) */}
      {showUserMenu && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowUserMenu(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-72 z-50 bg-[#0D0D0D] border-l border-amber-500/15 flex flex-col" style={{ animation: 'slideInRight 0.22s ease' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">👤</div>
                <div>
                  <p className="text-sm font-bold text-[#F5F0E8]/90">대표님</p>
                  <p className="text-[9px] text-[#F5F0E8]/50">🚀 Starter 플랜</p>
                </div>
              </div>
              <button onClick={() => setShowUserMenu(false)} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8]/80 text-lg">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              <p className="px-5 pt-3 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">계정</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">👤</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">개인정보</p><p className="text-[9px] text-[#F5F0E8]/40">프로필 및 계정 설정</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">플랜 & 결제</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">🚀</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">구독 관리</p><p className="text-[9px] text-[#F5F0E8]/40">플랜 업그레이드 · 결제</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">개발자</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">🔑</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">API Key 관리</p><p className="text-[9px] text-[#F5F0E8]/40">Claude · Gemini BYOAK</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-[9px] font-semibold text-[#F5F0E8]/30 uppercase tracking-wider">설정</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">🌐</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">언어 설정</p><p className="text-[9px] text-[#F5F0E8]/40">한국어 · English · 日本語</p></div>
              </button>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">🔔</span>
                <div className="text-left"><p className="text-sm font-medium text-[#F5F0E8]/90">알림 설정</p><p className="text-[9px] text-[#F5F0E8]/40">텔레그램 · 이메일 알림</p></div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10">
              <button className="w-full flex items-center gap-3 py-2 text-rose-400/70 hover:text-rose-400 transition-colors">
                <span className="text-base">↩</span>
                <p className="text-sm">로그아웃</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 메인 뷰 */}
      {/* 메인 뷰 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">

        {/* ── 내 프로젝트 뷰 ── */}
        {view === 'projects' && (
          <section className={mounted ? 'fade-in-up' : 'opacity-0'}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#F5F0E8]/90">📁 내 프로젝트</h2>
              <Link href="/projects/new"
                className="text-[10px] font-bold text-amber-400 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                ＋ 새 프로젝트
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">🐝</p>
                <p className="text-sm text-[#F5F0E8]/60">아직 등록된 프로젝트가 없어요</p>
                <Link href="/projects/new" className="inline-block mt-3 text-xs text-amber-400 font-bold">+ 첫 프로젝트 만들기</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={async () => {
                      if (p.id === activeProject?.id) return
                      await fetch('/api/projects', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ project_id: p.id }),
                      })
                      setActiveProject(p)
                      setProjects(prev => prev.map(pp => ({ ...pp, active_project: pp.id === p.id })))
                    }}
                    className={`glass rounded-2xl p-4 text-left transition-all tap-fast ${
                      p.active_project ? 'border-amber-500/40 amber-glow' : 'border-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {p.active_project && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] flex-shrink-0" />}
                          <p className="font-bold text-sm text-[#F5F0E8]/95 truncate">{p.title}</p>
                        </div>
                        <p className="text-[10px] text-[#F5F0E8]/50 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                          p.status === 'planning' ? 'bg-blue-500/15 text-blue-400' :
                          'bg-white/10 text-[#F5F0E8]/40'
                        }`}>{p.status === 'active' ? '운영중' : p.status === 'planning' ? '기획중' : p.status}</span>
                        {p.active_project && <span className="text-[8px] text-amber-400 font-bold">★ 활성</span>}
                      </div>
                    </div>
                    {p.goal && <p className="text-[9px] text-[#F5F0E8]/30 mt-2 line-clamp-1">🎯 {p.goal}</p>}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 회사 현황 뷰 (조직도) ── */}
        {view === 'company' && (
          <section className={mounted ? 'fade-in-up' : 'opacity-0'}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#F5F0E8]">📊 회사 현황</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F5F0E8]/60">총 팀원</span>
                <span className="text-sm font-bold text-amber-400">{EXECUTIVES.reduce((s,e)=>s+(hiredSkills[e.id]||[]).length,0)}명</span>
                {activeProject && <span className="text-xs text-amber-400 font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">● {activeProject.title}</span>}
              </div>
            </div>

            {/* CEO 카드 */}
            <button onClick={() => handleExecClick(CEO_EXEC)}
              className="w-full glass amber-glow rounded-2xl p-4 mb-2 border-amber-500/30 tap-fast hover:bg-amber-500/8 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#111 60%,#F59E0B30)'}}>
                  <img src={execImgSrc('ceo')} alt="CEO" className="w-full h-full object-contain" onError={e => imgFallback(e,'#F59E0B')} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">👑 CEO</span>
                    <span className="text-base font-bold text-[#F5F0E8]">리처드</span>
                    <span className="text-xs text-[#F5F0E8]/60">· 경영 총괄</span>
                  </div>
                  <p className="text-xs text-[#F5F0E8]/70">비전 수립 · 전략 결정 · 최종 의사결정</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex-shrink-0">대기중</span>
              </div>
            </button>

            {/* 수직선 */}
            <div className="flex justify-center mb-2"><div className="w-px h-3 bg-amber-500/30" /></div>

            {/* 비서 카드 */}
            <div className="glass rounded-2xl p-4 mb-2 border-white/10 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#111 60%,#A78BFA20)'}}>
                <img src="/characters/secretary.png" alt="비서" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                <div className="w-full h-full flex items-center justify-center text-2xl -mt-14">🎀</div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-md">비서</span>
                  <span className="text-base font-bold text-[#F5F0E8]">아이리스</span>
                  <span className="text-xs text-[#F5F0E8]/60">· CEO 보좌</span>
                </div>
                <p className="text-xs text-[#F5F0E8]/70">일정 관리 · 보고 정리 · 업무 조율</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex-shrink-0">대기중</span>
            </div>

            {/* 수직선 */}
            <div className="flex justify-center mb-3"><div className="w-px h-3 bg-white/10" /></div>

            {/* 팀 그룹 */}
            {COMPANY_TEAMS.map(({ label, ids }) => (
              <div key={label} className="mb-4">
                <p className="text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-widest mb-2 px-1">{label}</p>
                <div className="flex flex-col gap-2">
                  {ids.map(id => {
                    const exec = EXECUTIVES.find(e => e.id === id)!
                    const memberCount = (hiredSkills[exec.id] || []).length
                    return (
                      <button key={id} onClick={() => handleExecClick(exec)}
                        className="glass rounded-xl p-3 flex items-center gap-3 tap-fast hover:bg-amber-500/8 border-white/8 transition-colors text-left">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#111 60%,#F59E0B15)'}}>
                          <img src={execImgSrc(id)} alt={exec.title} className="w-full h-full object-contain" onError={e => imgFallback(e, exec.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">{exec.title}</span>
                            <span className="text-sm font-bold text-[#F5F0E8]">{exec.name}</span>
                            <span className="text-xs text-[#F5F0E8]/55">· {exec.titleKo}</span>
                          </div>
                          <p className="text-xs text-[#F5F0E8]/60 truncate">{exec.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-sm font-bold text-[#F5F0E8]/80">{memberCount}<span className="text-xs font-normal text-[#F5F0E8]/50">명</span></span>
                          {memberCount > 0
                            ? <span className="text-xs text-emerald-400 font-bold">● 활성</span>
                            : <span className="text-xs text-[#F5F0E8]/30">○ 공석</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* 하단 요약 */}
            <div className="mt-3 glass rounded-xl p-4 grid grid-cols-3 gap-2 text-center border-white/8">
              <div><p className="text-xl font-black text-amber-400">{EXECUTIVES.reduce((s,e)=>s+(hiredSkills[e.id]||[]).length,0)}</p><p className="text-xs text-[#F5F0E8]/60">전체 팀원</p></div>
              <div><p className="text-xl font-black text-[#F5F0E8]/90">9</p><p className="text-xs text-[#F5F0E8]/60">임원 부서</p></div>
              <div><p className="text-xl font-black text-emerald-400">{EXECUTIVES.filter(e=>(hiredSkills[e.id]||[]).length>0).length}</p><p className="text-xs text-[#F5F0E8]/60">운영 중 팀</p></div>
            </div>
          </section>
        )}



        {/* ── 대시보드 뷰 (기존 임원 그리드) ── */}
        {view === 'dashboard' && (
          <>
        <div className={`flex justify-center mb-4 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <span className="glass px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400 border-amber-500/30 tracking-widest uppercase">● v4.0 · Nine Executives</span>
        </div>

        {/* CEO — Featured Top Card */}
        <section className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <button
            onClick={() => handleExecClick(CEO_EXEC)}
            className="tap-fast group glass amber-glow rounded-2xl px-6 py-4 text-center border-amber-500/30 flex flex-col items-center w-full max-w-[220px] sm:max-w-[260px] hover:scale-[1.02] transition-transform active:scale-95"
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]" style={{ background: `linear-gradient(135deg, #111111 60%, ${CEO_EXEC.color}30)` }}>
              <img src={execImgSrc('ceo')} alt="CEO" className="absolute inset-0 w-full h-full object-contain p-1" loading="eager" onError={(e) => imgFallback(e, CEO_EXEC.color)} />
            </div>
            <p className="text-amber-400 font-bold text-base sm:text-lg">👑 CEO</p>
            <p className="text-xs text-[#F5F0E8]/70">경영 총괄 AI</p>
            <span className="mt-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">● 대기중</span>
          </button>
        </section>

        {/* Connecting Lines */}
        <div className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="w-px h-3 bg-gradient-to-b from-amber-500/40 to-amber-500/10"></div>
        </div>
        <div className={`flex justify-center mb-4 ${mounted ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
          <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"></div>
        </div>

        {/* Executive Character Grid (4×2 Layout) */}
        <section className={`grid grid-cols-2 sm:grid-cols-4 max-w-5xl mx-auto gap-2 sm:gap-4 mb-5 ${mounted ? 'fade-in-up fade-in-up-delay-3' : 'opacity-0'}`}>
          {REST_EXECS.map((exec, index) => (
            <button
              key={exec.id}
              onClick={() => handleExecClick(exec)}
              className={`tap-fast group relative flex flex-col items-center text-center focus:outline-none`}
            >
              <div
                className="w-full rounded-2xl p-2 sm:p-3 transition-all duration-200 hover:scale-[1.04] active:scale-95 group-hover:shadow-lg border border-white/5"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${exec.color}20, #0d0d0d 65%)`, borderColor: `${exec.color}20` }}
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2" style={{ background: `linear-gradient(135deg, #111111 60%, ${exec.color}25)` }}>
                  <img src={execImgSrc(exec.id)} alt={exec.title} className="absolute inset-0 w-full h-full object-contain p-1" loading="lazy" onError={(e) => imgFallback(e, exec.color)} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]"></span>
                </div>
                <p className="text-sm font-bold" style={{ color: exec.color }}>{exec.title}</p>
                <p className="text-xs text-[#F5F0E8]/65 truncate">{exec.titleKo}</p>
              </div>
            </button>
          ))}
          {/* Center last row (2 items) by adding invisible spacer */}
          {REST_EXECS.length % 3 === 2 && <div className="invisible" aria-hidden />}
        </section>
          </>
        )}

      </div>{/* max-w-7xl */}

      {/* ── Slide-up Panel ── */}
      {selectedExec && (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={closePanel} />
          <div className={`relative w-full max-w-lg rounded-t-3xl p-4 sm:p-6 transition-transform duration-300 max-h-[85vh] overflow-y-auto ${panelOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ background: '#181818', borderTop: '2px solid rgba(245,158,11,0.22)' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.25)' }} />
            <button onClick={closePanel} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors" style={{ background: 'rgba(255,255,255,0.12)', color: '#F5F0E8' }}>✕</button>

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
                      <p className="text-sm text-[#F5F0E8]/80 mb-1 font-semibold">{exec.titleKo}</p>
                      <p className="text-[11px] text-[#F5F0E8]/65 leading-relaxed">{exec.desc}</p>
                      {exec.detail && <p className="mt-2 text-[11px] text-[#F5F0E8]/55 leading-relaxed border-t border-white/10 pt-2">{exec.detail}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                    {[
                      { val: String((hiredSkills[exec.id] || []).length), label: '팀원 배속', color: exec.color },
                      { val: '$0.00', label: '이번 달 비용', color: '#34D399' },
                      { val: '0', label: '완료 작업', color: '#FBBF24' },
                    ].map(({ val, label, color }) => (
                      <div key={label} className="p-2.5 sm:p-3 text-center rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <p className="text-base sm:text-lg font-black" style={{ color }}>{val}</p>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(245,240,232,0.75)' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* CHRO: 채용 허브 패널 */}
                  {exec.id === 'chro' ? (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">👥</span>
                        <h4 className="text-sm font-bold text-[#F5F0E8]/90">조직 채용 현황</h4>
                        <span className="ml-auto text-[10px] text-amber-400/80 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">CHRO 관제 허브</span>
                      </div>
                      <div className="space-y-2">
                        {EXECUTIVES.filter(e => e.id !== 'chro').map(e => {
                          const count = (hiredSkills[e.id] || []).length
                          const pct = Math.round((count / 5) * 100)
                          return (
                            <div key={e.id} className="chro-exec-row">
                              <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, #111, ${e.color}30)` }}>
                                <img src={execImgSrc(e.id)} alt={e.title} className="w-full h-full object-contain p-0.5" onError={(ev) => imgFallback(ev as React.SyntheticEvent<HTMLImageElement>, e.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-[#F5F0E8]/90">{e.title} <span className="text-[#F5F0E8]/55 font-normal">{e.titleKo}</span></span>
                                  <span className="text-[10px] text-[#F5F0E8]/65 font-medium">{count}/5명</span>
                                </div>
                                <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: e.color, opacity: count === 0 ? 0 : 1 }} />
                                </div>
                              </div>
                              <button
                                onClick={() => { setHireExec(e); setShowHireModal(true) }}
                                className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-125 active:scale-95"
                                style={{ backgroundColor: `${e.color}18`, color: e.color, border: `1px solid ${e.color}30` }}
                              >
                                + 채용
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs sm:text-sm font-bold text-[#F5F0E8]/85">👥 팀원</h4>
                        <span className="text-[10px] text-[#F5F0E8]/65">{(hiredSkills[exec.id] || []).length} / 5</span>
                      </div>
                      {(hiredSkills[exec.id] || []).length > 0 ? (
                        <div className="space-y-2">
                          {(hiredSkills[exec.id] || []).map((skill: any) => (
                            <div key={skill.id} className="panel-card p-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${exec.color}15`, border: `1px solid ${exec.color}25` }}>🧠</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#F5F0E8] truncate">{skill.skill_name}</p>
                                <p className="text-[10px] text-[#F5F0E8]/65">{skill.skill_category} · {skill.difficulty || 'intermediate'}</p>
                              </div>
                              {skill.quality_score > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: skill.quality_score >= 80 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: skill.quality_score >= 80 ? '#34D399' : '#FBBF24' }}>{skill.quality_score}점</span>
                              )}
                            </div>
                          ))}
                          <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95 border border-dashed" style={{ color: `${exec.color}90`, borderColor: `${exec.color}35` }}>+ 팀원 추가 채용</button>
                        </div>
                      ) : (
                        <div className="p-4 flex flex-col items-center justify-center text-center rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <span className="text-2xl mb-2">🔍</span>
                          <p className="text-xs mb-3" style={{ color: 'rgba(245,240,232,0.75)' }}>아직 채용된 팀원이 없습니다</p>
                          <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="text-sm font-bold px-4 py-2 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}35` }}>
                            🔍 CHRO에게 채용 요청
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => openTelegramAction(exec.tgCommand)} className="w-full font-bold text-sm py-3 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}30` }}>📋 지시하기</button>
                </div>
              )
            })()}
          </div>
        </div>
      )}


      {/* Web Alert Modal */}
      {showWebAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <div className="rounded-2xl p-6 max-w-xs w-full text-center" style={{ background: '#1e1e1e', border: '1px solid rgba(245,158,11,0.20)' }}>
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
        orgId={orgId}
        parentExec={hireExec ? { id: hireExec.id, title: hireExec.title, titleKo: hireExec.titleKo, color: hireExec.color } : null}
      />
    </main>
  )
}
