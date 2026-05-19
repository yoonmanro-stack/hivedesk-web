'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import HireModal from '@/components/HireModal'

/* ── Modern Line Icons (Lovable-style) ── */
const s = { display:'inline-block',verticalAlign:'middle' } as const
const Icon = {
  folder:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  barChart:  (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  msgCircle: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  user:      (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  rocket:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  key:       (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  globe:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  bell:      (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  crown:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M2 4l3 12h14l3-12-6 7-4-9-4 9-6-7z"/><path d="M3 20h18"/></svg>,
  sparkle:   (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>,
  brain:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></svg>,
  search:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  clipboard: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  phone:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  target:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  logOut:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:      (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
}

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
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [firingAgent, setFiringAgent] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const tg = window.Telegram?.WebApp
    if (tg && !tg.isExpanded) tg.expand()

    // UI 즉시 표시 후 데이터는 병렬로 백그라운드 로드
    fetchHiredSkills('') // 먼저 빈 org_id로 즉시 시작

    fetch('/api/me').then(r => r.json()).then(d => {
      const oid = d.org_id || ''
      if (oid) {
        setOrgId(oid)
        fetchHiredSkills(oid) // org_id 확인 후 정확한 데이터로 갱신
        fetch(`/api/projects?org_id=${oid}`)
          .then(r => r.json())
          .then(d => {
            if (d.projects?.length > 0) {
              setProjects(d.projects)
              const active = d.projects.find((p: any) => p.active_project) || d.projects[0]
              if (active) setActiveProject(active)
            }
          }).catch(() => {})
      }
    }).catch(() => {})
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
          <div className="flex items-center gap-2">
            <span className="text-2xl bee-float">🐝</span>
            <div className="flex flex-col items-start">
              <h1 className="text-base font-bold text-shimmer leading-tight">HiveDesk</h1>
              <p className="text-xs text-[#F5F0E8]/60 tracking-wide">9인 임원 · 1인 비서</p>
            </div>
          </div>
          {/* 우: 사람 아이콘 */}
          <div className="flex justify-end">
            <button
              id="btn-user-menu"
              onClick={() => setShowUserMenu(true)}
              className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm tap-fast hover:bg-amber-500/30 transition-colors"
            >{Icon.user('#F5F0E8',16)}</button>
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
                <p className="text-xs text-[#F5F0E8]/60">AI 1인 기업 · 9인 임원</p>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {/* 프로젝트 섹션 */}
              <p className="px-5 pt-3 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">프로젝트</p>
              <Link href="/projects/new" onClick={() => setShowNavMenu(false)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-amber-500/8 transition-colors">
                <span className="text-base">{Icon.plus('#F5F0E8',16)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">새 프로젝트</p><p className="text-xs text-[#F5F0E8]/60">새 프로젝트 등록</p></div>
              </Link>
              <button onClick={() => { setView('projects'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'projects' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">{Icon.folder('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">내 프로젝트</p><p className="text-xs text-[#F5F0E8]/60">전체 프로젝트 목록</p></div>
              </button>
              {/* 운영 섹션 */}
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">운영</p>
              <button onClick={() => { setView('company'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'company' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">{Icon.barChart('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">회사 현황</p><p className="text-xs text-[#F5F0E8]/60">전체 조직 운영 현황</p></div>
              </button>
              <button onClick={() => { setView('dashboard'); setShowNavMenu(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                  view === 'dashboard' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5'
                }`}>
                <span className="text-base">{Icon.msgCircle('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">대시보드</p><p className="text-xs text-[#F5F0E8]/60">9인 임원 대화 및 지시</p></div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10">
              <p className="text-xs text-[#F5F0E8]/40">HiveDesk v1.3</p>
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
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">{Icon.user('#F5F0E8',16)}</div>
                <div>
                  <p className="text-sm font-bold text-[#F5F0E8]">대표님</p>
                  <p className="text-xs text-[#F5F0E8]/60">🚀 Starter 플랜</p>
                </div>
              </div>
              <button onClick={() => setShowUserMenu(false)} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 text-lg">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              <p className="px-5 pt-3 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">계정</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">{Icon.user('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">개인정보</p><p className="text-xs text-[#F5F0E8]/60">프로필 및 계정 설정</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">플랜 & 결제</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">{Icon.rocket('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">구독 관리</p><p className="text-xs text-[#F5F0E8]/60">플랜 업그레이드 · 결제</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">개발자</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">{Icon.key('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">API Key 관리</p><p className="text-xs text-[#F5F0E8]/60">Claude · Gemini BYOAK</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">설정</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">{Icon.globe('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">언어 설정</p><p className="text-xs text-[#F5F0E8]/60">한국어 · English · 日本語</p></div>
              </button>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                <span className="text-base">{Icon.bell('#F5F0E8',18)}</span>
                <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">알림 설정</p><p className="text-xs text-[#F5F0E8]/60">텔레그램 · 이메일 알림</p></div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10">
              <button className="w-full flex items-center gap-3 py-2 text-rose-400/80 hover:text-rose-400 transition-colors">
                <span className="text-base">{Icon.logOut('#F87171',18)}</span>
                <p className="text-sm font-semibold">로그아웃</p>
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#F5F0E8] flex items-center gap-2">{Icon.folder('#F5F0E8',20)} 내 프로젝트</h2>
              <Link href="/projects/new"
                className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors">
                ＋ 새 프로젝트
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-3xl mb-2">🐝</p>
                <p className="text-sm text-[#F5F0E8]/70">아직 등록된 프로젝트가 없어요</p>
                <Link href="/projects/new" className="inline-block mt-3 text-sm text-amber-400 font-bold">+ 첫 프로젝트 만들기</Link>
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
                        <div className="flex items-center gap-2 mb-1.5">
                          {p.active_project && <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] flex-shrink-0" />}
                          <p className="font-bold text-base text-[#F5F0E8] truncate">{p.title}</p>
                        </div>
                        <p className="text-xs text-[#F5F0E8]/65 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          p.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-[#F5F0E8]/50'
                        }`}>{p.status === 'active' ? '운영중' : p.status === 'planning' ? '기획중' : p.status}</span>
                        {p.active_project && <span className="text-xs text-amber-400 font-bold">★ 활성</span>}
                      </div>
                    </div>
                    {p.goal && <p className="text-xs text-[#F5F0E8]/50 mt-2 line-clamp-1 flex items-center gap-1">{Icon.target('#F5F0E8',12)} {p.goal}</p>}
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
              <h2 className="text-xl font-bold text-[#F5F0E8] flex items-center gap-2">{Icon.barChart('#F5F0E8',20)} 회사 현황</h2>
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
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">{Icon.crown('#F59E0B',14)} CEO</span>
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

            {/* 비서 카드 — 캐릭터 이미지 포함 */}
            <div className="glass rounded-2xl p-4 mb-2 border-purple-500/20 flex items-center gap-3" style={{background:'rgba(167,139,250,0.05)'}}>
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{background:'linear-gradient(135deg,#111 60%,#A78BFA25)'}}>
                <img src="/characters/secretary.png" alt="아이리스" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">{Icon.sparkle('#A78BFA',14)} 비서</span>
                  <span className="text-base font-bold text-[#F5F0E8]">아이리스</span>
                  <span className="text-xs text-[#F5F0E8]/60">· CEO 전담 보좌</span>
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
            <p className="text-amber-400 font-bold text-base sm:text-lg flex items-center justify-center gap-1">{Icon.crown('#F59E0B',18)} CEO</p>
            <p className="text-xs text-[#F5F0E8]/70">경영 총괄 AI</p>
            <span className="mt-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">● 대기중</span>
          </button>
        </section>

        {/* 비서 슬림 카드 — CEO 바로 아래 */}
        <div className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="w-px h-2 bg-amber-500/30" />
        </div>
        <div className={`flex justify-center mb-3 ${mounted ? 'fade-in-up fade-in-up-delay-1' : 'opacity-0'}`}>
          <div className="w-full max-w-[260px] sm:max-w-[300px] rounded-2xl border border-purple-500/20 bg-purple-500/5 px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">{Icon.sparkle('#A78BFA',18)}</span>
              <div>
                <p className="text-sm font-bold text-[#F5F0E8]">아이리스</p>
                <p className="text-xs text-[#F5F0E8]/60">비서 · CEO 전담 보좌</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">대기중</span>
          </div>
        </div>
        {/* Connecting Lines */}
        <div className={`flex justify-center mb-2 ${mounted ? 'fade-in-up fade-in-up-delay-2' : 'opacity-0'}`}>
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

      {/* ── 임원 풀스크린 페이지 (네이티브 앱 스타일) ── */}
      {selectedExec && (() => {
        const exec = selectedExec
        return (
          <div className={`fixed inset-0 z-50 flex flex-col transition-transform duration-300 ${panelOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ background: '#0D0D0D' }}>
            {/* 페이지 헤더 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-500/15 sticky top-0 z-10" style={{ background: '#0D0D0D' }}>
              <button onClick={closePanel} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.10)', color: '#F5F0E8' }}>
                ←
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-bold truncate" style={{ color: exec.color }}>{exec.title}</span>
                <span className="text-xs text-[#F5F0E8]/55 truncate">{exec.titleKo}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
            </div>

            {/* 스크롤 가능한 본문 */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-lg mx-auto px-4 py-5">

                {/* 임원 프로필 */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border" style={{ borderColor: `${exec.color}40`, background: `linear-gradient(135deg, #111111, ${exec.color}25)` }}>
                    <img src={execImgSrc(exec.id)} alt={exec.title} className="absolute inset-0 w-full h-full object-contain p-1.5" onError={(e) => imgFallback(e, exec.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold mb-0.5" style={{ color: exec.color }}>{exec.title}</h2>
                    <p className="text-sm font-semibold text-[#F5F0E8] mb-1">{exec.titleKo}</p>
                    <p className="text-xs text-[#F5F0E8]/65 leading-relaxed">{exec.desc}</p>
                    {exec.detail && <p className="mt-2 text-xs text-[#F5F0E8]/55 leading-relaxed border-t border-white/10 pt-2">{exec.detail}</p>}
                  </div>
                </div>

                {/* 스탯 카드 */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { val: String((hiredSkills[exec.id] || []).length), label: '팀원 배속', color: exec.color },
                    { val: '$0.00', label: '이번 달 비용', color: '#34D399' },
                    { val: '0', label: '완료 작업', color: '#FBBF24' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="p-3 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <p className="text-xl font-black" style={{ color }}>{val}</p>
                      <p className="text-xs mt-1 text-[#F5F0E8]/65">{label}</p>
                    </div>
                  ))}
                </div>

                {/* CHRO 채용 허브 / 일반 팀원 */}
                {exec.id === 'chro' ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{Icon.users('#F5F0E8',18)}</span>
                      <h3 className="text-sm font-bold text-[#F5F0E8]">조직 채용 현황</h3>
                      <span className="ml-auto text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">CHRO 관제 허브</span>
                    </div>
                    <div className="space-y-2">
                      {EXECUTIVES.filter(e => e.id !== 'chro').map(e => {
                        const count = (hiredSkills[e.id] || []).length
                        const pct = Math.round((count / 5) * 100)
                        return (
                          <div key={e.id} className="chro-exec-row">
                            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ background: `linear-gradient(135deg, #111, ${e.color}30)` }}>
                              <img src={execImgSrc(e.id)} alt={e.title} className="w-full h-full object-contain p-0.5" onError={(ev) => imgFallback(ev as React.SyntheticEvent<HTMLImageElement>, e.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#F5F0E8]">{e.title} <span className="text-[#F5F0E8]/55 font-normal text-xs">{e.titleKo}</span></span>
                                <span className="text-xs text-[#F5F0E8]/65 font-medium">{count}/5명</span>
                              </div>
                              <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: e.color, opacity: count === 0 ? 0 : 1 }} />
                              </div>
                            </div>
                            <button onClick={() => { setHireExec(e); setShowHireModal(true) }} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-125 active:scale-95" style={{ backgroundColor: `${e.color}18`, color: e.color, border: `1px solid ${e.color}30` }}>+ 채용</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#F5F0E8] flex items-center gap-1.5">{Icon.users('#F5F0E8',16)} 팀원</h3>
                      <span className="text-xs text-[#F5F0E8]/65">{(hiredSkills[exec.id] || []).length} / 5</span>
                    </div>
                    {(hiredSkills[exec.id] || []).length > 0 ? (
                      <div className="space-y-2.5">
                        {(hiredSkills[exec.id] || []).map((skill: any) => {
                          const isExpanded = expandedAgent === skill.id
                          const isFiring = firingAgent === skill.id
                          const grade = skill.quality_grade || skill._agent?.quality_grade || 'C'
                          const gradeColor = grade === 'A' ? '#34D399' : grade === 'B' ? '#60A5FA' : grade === 'C' ? '#FBBF24' : '#F87171'
                          const agentData = skill._agent || skill
                          const hiredDate = agentData.hired_at ? new Date(agentData.hired_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''
                          const skillSlugs: string[] = agentData.skill_slugs || []
                          return (
                            <div key={skill.id} className="rounded-xl overflow-hidden transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${isExpanded ? exec.color + '40' : 'rgba(255,255,255,0.10)'}` }}>
                              {/* 메인 카드 */}
                              <button onClick={() => setExpandedAgent(isExpanded ? null : skill.id)} className="w-full p-3.5 flex items-center gap-3 tap-fast text-left">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${exec.color}15`, border: `1px solid ${exec.color}25` }}>{Icon.brain(exec.color,20)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-bold text-[#F5F0E8] truncate">{skill.skill_name}</p>
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: gradeColor + '20', color: gradeColor }}>{grade}</span>
                                  </div>
                                  <p className="text-xs text-[#F5F0E8]/55">{skill.skill_category || agentData.primary_category || '일반'}{hiredDate ? ` · ${hiredDate} 합류` : ''}</p>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', opacity: 0.4 }}><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              {/* 상세 아코디언 */}
                              {isExpanded && (
                                <div className="px-3.5 pb-3.5 pt-0">
                                  <div className="border-t border-white/8 pt-3">
                                    {/* 스탯 */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base font-black" style={{ color: gradeColor }}>Grade {grade}</p>
                                        <p className="text-[10px] text-[#F5F0E8]/50 mt-0.5">등급</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base font-black text-[#F5F0E8]/80">{skillSlugs.length || agentData.skill_count || 0}</p>
                                        <p className="text-[10px] text-[#F5F0E8]/50 mt-0.5">보유 스킬</p>
                                      </div>
                                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-base font-black text-[#F5F0E8]/80">{agentData.avg_quality_score > 0 ? Math.round(agentData.avg_quality_score) : '—'}</p>
                                        <p className="text-[10px] text-[#F5F0E8]/50 mt-0.5">품질 점수</p>
                                      </div>
                                    </div>
                                    {/* 스킬 태그 */}
                                    {skillSlugs.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {skillSlugs.slice(0, 5).map((slug: string) => (
                                          <span key={slug} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${exec.color}12`, color: `${exec.color}CC`, border: `1px solid ${exec.color}25` }}>{slug}</span>
                                        ))}
                                      </div>
                                    )}
                                    {/* 역할 설명 */}
                                    {(agentData.agent_role || skill.skill_category) && (
                                      <p className="text-xs text-[#F5F0E8]/50 mb-3">{agentData.agent_role || skill.skill_category}</p>
                                    )}
                                    {/* 해고 버튼 */}
                                    {!isFiring ? (
                                      <button onClick={() => setFiringAgent(skill.id)} className="w-full text-xs py-2 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20">
                                        팀원 해제
                                      </button>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button onClick={async () => {
                                          try {
                                            await fetch('/api/agents/fire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: skill.id, org_id: orgId }) })
                                            setFiringAgent(null)
                                            setExpandedAgent(null)
                                            fetchHiredSkills()
                                          } catch {}
                                        }} className="flex-1 text-xs py-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 hover:brightness-110 active:scale-95 transition-all">
                                          확인 해제
                                        </button>
                                        <button onClick={() => setFiringAgent(null)} className="flex-1 text-xs py-2 rounded-lg bg-white/5 text-[#F5F0E8]/60 border border-white/10 hover:bg-white/10 transition-colors">
                                          취소
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95 border border-dashed" style={{ color: `${exec.color}90`, borderColor: `${exec.color}35` }}>+ 팀원 추가 채용</button>
                      </div>
                    ) : (
                      <div className="p-6 flex flex-col items-center justify-center text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                        <span className="text-3xl mb-3">{Icon.search('#F5F0E8',32)}</span>
                        <p className="text-sm text-[#F5F0E8]/70 mb-4">아직 채용된 팀원이 없습니다</p>
                        <button onClick={() => { setHireExec(exec); setShowHireModal(true) }} className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}35` }}>
                          CHRO에게 채용 요청
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 지시하기 버튼 */}
                <button onClick={() => openTelegramAction(exec.tgCommand)} className="w-full font-bold text-sm py-4 rounded-2xl transition-all hover:brightness-110 active:scale-95 mb-6 flex items-center justify-center gap-2" style={{ backgroundColor: `${exec.color}20`, color: exec.color, border: `1px solid ${exec.color}30` }}>{Icon.clipboard(exec.color,18)} 지시하기</button>
              </div>
            </div>
          </div>
        )
      })()}




      {/* Web Alert Modal */}
      {showWebAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <div className="rounded-2xl p-6 max-w-xs w-full text-center" style={{ background: '#1e1e1e', border: '1px solid rgba(245,158,11,0.20)' }}>
            <span className="mb-3 block">{Icon.phone('#F5F0E8',32)}</span>
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
