'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['SaaS', '모바일앱', '이커머스', '콘텐츠', 'AI 서비스', '커뮤니티', '기타']
const STAGES = [
  { id: 'idea', label: '아이디어', icon: '💡' },
  { id: 'development', label: '개발 중', icon: '🔧' },
  { id: 'beta', label: '베타', icon: '🧪' },
  { id: 'live', label: '운영 중', icon: '🚀' },
  { id: 'growth', label: '성장 중', icon: '📈' },
]
const REVENUE_MODELS = ['구독제', '일회성 결제', '수수료', '광고', '무료/오픈소스', '미정']

const EXECUTIVES = [
  { id: 'ceo', title: 'CEO 리처드', icon: '👑', desc: '비즈니스 전략 조율 및 임원 재가 총괄' },
  { id: 'cto', title: 'CTO 뮤즈', icon: '💻', desc: '기술 스택 매핑 및 실무 스킬 설계 총괄', badge: 'Opus 4.7' },
  { id: 'cmo', title: 'CMO 폴', icon: '📢', desc: '고객 획득 채널 발굴 및 시장 반응 데이터 모니터링' },
  { id: 'cfo', title: 'CFO 알렉스', icon: '💰', desc: '수익성 분석 및 마이크로 예산 최적화 관리' },
  { id: 'cpo', title: 'CPO 이안', icon: '📦', desc: '기획 엔진 탑재 · 3종 기획문서(PRD) 자율 완성' },
  { id: 'cdo', title: 'CDO 하나', icon: '🎨', desc: '디자인 DNA 추출 및 인터랙션 토큰 시각화' },
  { id: 'coo', title: 'COO 엠마', icon: '⚙️', desc: '임원 보드룸 회의 프로세스 가이드 및 데일리 운영' },
  { id: 'chro', title: 'CHRO 소피아', icon: '👥', desc: '실무 팀원 에이전트 채용 및 스킬 주입 스케줄링' },
  { id: 'clo', title: 'CLO 하비', icon: '⚖️', desc: '이용 약관, 규제 준수 검토 및 리스크 방어망' },
]

const ANALYSIS_PHASES = [
  { title: '🧠 CPO 이안: 아이디어 분석 중', desc: '대표님의 한 줄 아이디어에서 핵심 비즈니스 정체성과 시장 포지션을 Gemini로 실시간 분석합니다.' },
  { title: '📊 CFO 알렉스: 수익 모델 검토 중', desc: '아이디어에 적합한 수익 구조와 초기 비용 예측, 비즈니스 방향별 ROI 가능성을 산출합니다.' },
  { title: '💻 CTO 뮤즈: 기술 스택 실현성 검증 중', desc: '아이디어 특성에 맞는 최적 아키텍처와 구현 난이도, 예상 리스크를 실시간 설계합니다.' },
  { title: '🎨 CDO 하나: 디자인 방향 도출 중', desc: '선정된 비즈니스 방향별 최적 UI/UX 전략과 디자인 DNA를 분석하여 방향을 확정합니다.' }
]

const TOTAL_STEPS = 4

/* ── Modern Line Icons (Lovable-style) ── */
const s = { display: 'inline-block', verticalAlign: 'middle' } as const
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
  person:    (c="currentColor",sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="8" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>,
  search:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  clipboard: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  phone:     (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  target:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  logOut:    (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:      (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  briefcase: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  monitor:   (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  helpCircle: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  gallery: (c='currentColor',sz=18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
}

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgId, setOrgId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dir, setDir] = useState<'forward' | 'back'>('forward')

  // Drawer states
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [showBottomDrawer, setShowBottomDrawer] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeProject, setActiveProject] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [stage, setStage] = useState('')
  const [goals, setGoals] = useState('')
  const [userTarget, setUserTarget] = useState('')
  const [revenueModel, setRevenueModel] = useState('')
  const [price, setPrice] = useState('')
  const [techStack, setTechStack] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [challenges, setChallenges] = useState('')
  const [activeExecs, setActiveExecs] = useState<string[]>(['ceo', 'cto', 'cmo'])

  // Competitor-inspired Gates States
  const [selectedIntent, setSelectedIntent] = useState<number | null>(null)
  const [selectedDna, setSelectedDna] = useState<'amber' | 'glass' | 'lime' | 'indigo' | 'swiss'>('amber')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisPhase, setAnalysisPhase] = useState(0)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [customIntents, setCustomIntents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d.org_id) {
        setOrgId(d.org_id)
        fetch('/api/projects').then(r => r.json()).then(pData => {
          if (pData.projects) {
            const active = pData.projects.find((p: any) => p.active_project)
            setActiveProject(active || null)
          }
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const go = (next: number) => {
    setDir(next > step ? 'forward' : 'back')
    setStep(next)
  }

  const toggleExec = (id: string) => {
    setActiveExecs(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const generateIntents_REMOVED = (rawIdea: string) => { // 하드코딩 제거됨 — Gemini API로 대체
    return []
    const cleanIdea = rawIdea.toLowerCase()
    const isWorkout = cleanIdea.includes('운동') || cleanIdea.includes('헬스') || cleanIdea.includes('피트니스') || cleanIdea.includes('트랙') || cleanIdea.includes('workout') || cleanIdea.includes('fitness') || cleanIdea.includes('tracker')
    
    if (isWorkout) {
      return [
        {
          id: 'minimal',
          title: '오운완 콤팩트 트래커 (Minimal Utility)',
          desc: '운동 종목, 세트수, 무게 기록만 3초 만에 완료하는 개인 맞춤형 유틸리티',
          cdo: '눈이 편안한 올블랙 다크 모드에 앰버 포인트, 불필요한 장식 없는 즉각적인 탭 컨트롤 인터페이스',
          cto: '로컬 스토리지 데이터 백업 및 오프라인 상태에서도 동작하는 오프라인-퍼스트 PWA 구현',
          category: '모바일앱',
          stage: 'idea',
          goals: '오픈 1개월 내 실사용자 500명 달성 및 일간 기록 전환율 70% 돌파',
          userTarget: '세밀하게 세트와 랩 타임을 기록하고 싶은 헬스 매니아, 운동 중 폰을 켜두는 리프터',
          techStack: 'React Native · TailwindCSS · SQLite (Local) · PWA',
          challenges: '오프라인 상태에서의 로컬 DB와 원격 DB 간의 정밀 동기화 에러',
          badge: '추천: 고성능'
        },
        {
          id: 'gamified',
          title: '오운완 챌린지 경쟁형 (Gamified Social)',
          desc: '친구들과 매일 오운완(오늘 운동 완료) 인증샷을 공유하고 랭킹을 겨루는 소셜 플랫폼',
          cdo: '다이내믹한 뱃지 리워드 디자인, 레벨업 모션, 네온 오렌지와 민트 조합의 에너제틱 UI',
          cto: '실시간 라이브 피드 렌더링, 이미지 업로드용 Supabase Storage, 실시간 알림 웹소켓',
          category: '커뮤니티',
          stage: 'idea',
          goals: '오픈 3개월 내 일간 활성 사용자(DAU) 2,000명 확보 및 평균 리텐션 45% 유지',
          userTarget: '혼자 운동하면 금방 포기하는 의지박약 다이어터, 친구들과 성취를 공유하고 싶은 MZ 리프터',
          techStack: 'Next.js · Supabase Auth · Storage · n8n 실시간 알림 파이프라인',
          challenges: '실시간 이미지 피드 업로드 시 스토리지 비용 급증 및 이미지 압축 최적화',
          badge: '소셜 친화적'
        },
        {
          id: 'ai-helper',
          title: '컨디션 기반 AI 피드백 헬퍼 (AI Smart Butler)',
          desc: '오늘의 컨디션, 운동 기록 및 누적 데이터를 정밀 분석하여 최적의 맞춤 루틴을 제안하는 똑똑한 AI 피트니스 파트너',
          cdo: '챗 인터페이스와 글래스모피즘 카드를 적절히 매칭한 비서 같은 프리미엄 퍼스널 터치 UI',
          cto: 'Gemini API를 활용한 맞춤형 루틴 추천 프롬프트 아키텍처 및 과거 데이터 분석 파이프라인',
          category: 'AI 서비스',
          stage: 'idea',
          goals: '루틴 추천 만족도 90% 이상 획득, 루틴 완수율 80% 달성',
          userTarget: '오늘 무슨 운동을 해야 할지 매번 고민하는 초급 리프터, 정체기에 빠진 중급 헬스 매니아',
          techStack: 'Next.js · Gemini 1.5 Pro API · Vercel AI SDK · Supabase DB',
          challenges: '과거 무게 기록 데이터가 적을 때의 콜드스타트 문제 및 AI 추천 루틴의 정확성 검증',
          badge: 'CPO 추천'
        },
        {
          id: 'enterprise',
          title: '피트니스 센터 회원/차트 관리기 (Enterprise Pro)',
          desc: '크로스핏 박스 및 피트니스 센터 운영진과 트레이너를 위한 통합 회원권 및 누적 기록 차트 관리 SaaS',
          cdo: '신뢰감 높은 딥 네이비 배경에 앰버 라이트닝, 데이터 테이블과 시각화 차트가 조화된 고밀도 대시보드',
          cto: '관계형 데이터베이스의 회원-클래스-기록 차트 복합 스키마 설계 및 대용량 통계 쿼리 최적화',
          category: 'SaaS',
          stage: 'idea',
          goals: '초기 피트니스 센터 5곳 온보딩, 트레이너 업무 시간 일평균 40분 단축',
          userTarget: '회원들의 차트 기록 관리가 번거로운 피트니스 관장님, PT 회원의 기록 변화를 추적하는 트레이너',
          techStack: 'Next.js · PostgreSQL (Supabase) · Recharts · React Table',
          challenges: '센터별 다른 클래스 예약 규칙에 유연하게 대응할 수 있는 DB 스키마 아키텍처 설계',
          badge: 'SaaS 솔루션'
        }
      ]
    }
    
    return [
      {
        id: 'minimal',
        title: `초경량 ${name || '아이디어'} 도구 (Minimal Utility)`,
        desc: '핵심 기능 하나에 집중하여 빠른 로딩 속도와 최고의 사용성을 자랑하는 마이크로 서비스',
        cdo: '미니멀한 타이포그래피와 모노톤 계열의 심플한 구성, 집중하기 편안한 레이아웃',
        cto: '정적 파일 호스팅 및 지연 시간을 최소화하기 위한 엣지 서버 캐싱 구성 적용',
        category: 'SaaS',
        stage: 'idea',
        goals: '실사용 베타 유저 100명 확보 및 1차 기능 피드백 루프 완성',
        userTarget: '핵심 기능만을 가장 단순하고 빠르게 사용하고 싶어하는 직관적 타겟 유저',
        techStack: 'React · TailwindCSS · LocalStorage PWA',
        challenges: '로컬 데이터의 브라우저 캐시 삭제 시 복구 메커니즘 부재',
        badge: '추천: 고성능'
      },
      {
        id: 'gamified',
        title: `소셜 성장 & 커뮤니티 (Gamified Social)`,
        desc: '포인트, 뱃지, 실시간 리더보드를 통해 사용자 참여율을 극대화한 네이티브 서비스',
        cdo: '레벨업 카드 모션, 다채로운 일러스트레이션 그래디언트 및 소셜 피드 레이아웃',
        cto: '게이미피케이션 점수 누적을 위한 트리거 시스템 및 고가용성 캐시 레이어 구성',
        category: '커뮤니티',
        stage: 'idea',
        goals: '회원가입 전환율 35% 이상 확보 및 일평균 사용 시간(Session Time) 15분 도달',
        userTarget: '자신의 성장 기록을 공유하고 동료들의 피드백을 통해 동기부여를 받고 싶은 유저',
        techStack: 'Next.js · Supabase Realtime · TailwindCSS · Lucide Icons',
        challenges: '사용자 증가 시 실시간 리더보드 데이터 캐싱 및 데이터베이스 동기화 지연',
        badge: '소셜 친화적'
      },
      {
        id: 'ai-helper',
        title: `AI 맞춤형 비서 (AI Smart Butler)`,
        desc: '대표님의 의도와 사용자의 히스토리를 분석해 개인화된 맞춤 응답을 제공하는 AI 서비스',
        cdo: '글래스모피즘 기반의 반투명 카드 요소 및 신비로운 보라/시안 빛의 그라데이션 인터랙션',
        cto: 'Gemini/Claude LLM API 비동기 스트리밍 연동 및 안전한 프롬프트 주입 방지 보안망',
        category: 'AI 서비스',
        stage: 'idea',
        goals: 'AI 비서 응답 속도 2.5초 이내 최적화 및 맞춤 제안 정확도 85% 이상 유지',
        userTarget: '복잡한 조작 없이 일상어 채팅만으로 개인 맞춤형 해답이나 분석을 받고 싶은 유저',
        techStack: 'Next.js · Supabase · Vercel AI SDK · Gemini API',
        challenges: 'LLM 토큰 소모 비용의 마이크로 트래킹 및 API 레이턴시 제어',
        badge: 'CPO 추천'
      },
      {
        id: 'enterprise',
        title: `데이터 중심 프로 솔루션 (Enterprise Pro)`,
        desc: '역동적인 시각화 차트와 대용량 데이터를 처리하는 고밀도 전문가용 어드민 대시보드',
        cdo: '고대비 그리드 레이아웃과 콤팩트 테이블, 신뢰감을 주는 네이비/앰버 컬러 팔레트',
        cto: '복합 스키마의 릴레이션 관계 설계 및 인덱스 최적화를 통한 초고속 쿼리 튜닝',
        category: 'SaaS',
        stage: 'idea',
        goals: '데이터 관리 일치율 100% 보장 및 실무진 데이터 탐색 효율 50% 향상',
        userTarget: '다차원 통계 자료를 직관적으로 분석하고 협업 부서와 실시간 보고서를 공유하는 전문가',
        techStack: 'Next.js · React Table · Recharts · Supabase DB',
        challenges: '다양한 사용자 역할군(Role-based) 간의 정밀한 RLS 보안 정책 및 데이터 접근 차단',
        badge: 'SaaS 솔루션'
      }
    ]
  }

  const handleTriggerAnalysis = async () => {
    if (!name.trim() || !description.trim()) return
    setIsAnalyzing(true)
    setAnalysisPhase(0)
    setError('')

    // 분석 단계 애니메이션 (실제 API 호출과 병행)
    let phase = 0
    const phaseInterval = setInterval(() => {
      phase += 1
      if (phase < 4) setAnalysisPhase(phase)
    }, 900)

    try {
      const res = await fetch('/api/projects/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI 분석 실패')

      clearInterval(phaseInterval)
      setAnalysisPhase(3)

      await new Promise(r => setTimeout(r, 600)) // 마지막 단계 잠깐 보여주기

      setCustomIntents(data.suggestions)
      setIsAnalyzing(false)
      setHasAnalyzed(true)
      setSelectedIntent(0)

      // 첫 번째 제안으로 폼 초기값 설정
      const first = data.suggestions[0]
      if (first) {
        setGoals(first.goals || '')
        setUserTarget(first.userTarget || '')
        setTechStack(first.techStack || '')
        setChallenges(first.challenges || '')
        setCategory(first.category || '')
        setStage(first.stage || 'idea')
      }

      setStep(2)
    } catch (err: any) {
      clearInterval(phaseInterval)
      setIsAnalyzing(false)
      setError(err.message || 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleSelectIntent = (index: number) => {
    setSelectedIntent(index)
    const selected = customIntents[index]
    if (selected) {
      setGoals(selected.goals)
      setUserTarget(selected.userTarget)
      setTechStack(selected.techStack)
      setChallenges(selected.challenges)
      setCategory(selected.category)
      setStage(selected.stage)
    }
  }

  const canNext = () => {
    if (step === 1) return name.trim().length > 0 && description.trim().length > 0 && hasAnalyzed
    if (step === 2) return selectedIntent !== null
    if (step === 3) return selectedDna !== null
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          name, description, goals, stage,
          target_audience: userTarget,
          revenue_model: revenueModel,
          price, category, tech_stack: techStack,
          website_url: websiteUrl,
          github_url: githubUrl,
          challenges,
          active_execs: activeExecs,
          selected_intent: customIntents[selectedIntent ?? 0]?.title || '',
          cdo: customIntents[selectedIntent ?? 0]?.cdo || '',
          cto: customIntents[selectedIntent ?? 0]?.cto || '',
          design_dna: selectedDna,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '프로젝트 생성 실패')
      router.push(`/dashboard?view=dashboard&sub=boardroom&project_id=${data.project.id}&new_project=true`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const maxWidthClass = 'max-w-7xl'

  return (
    <main className="h-screen h-[100dvh] overflow-hidden hero-bg honeycomb-bg flex flex-col lg:pl-64">
      {/* 데스크톱 전용 상시 고정 사이드바 */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0D0D0D]/60 backdrop-blur-xl border-r border-amber-500/12 z-[90000] no-scrollbar">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-amber-500/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-left cursor-pointer focus:outline-none select-none tap-fast active:scale-95 transition-transform"
          >
            <span className="text-xl bee-float">🐝</span>
            <div>
              <p className="text-xs font-bold text-shimmer">HiveDesk</p>
              <p className="text-[10px] text-[#F5F0E8]/60">내 손안의 AI 1인 기업</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
          {/* 프로젝트 섹션 */}
          <p className="px-5 pt-3 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">프로젝트</p>
          <Link href="/projects/new"
            className="flex items-center gap-3 px-5 py-3 bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 transition-all duration-200">
            <span className="text-base">{Icon.plus('#F59E0B',16)}</span>
            <div><p className="text-sm font-semibold text-[#F5F0E8]">새 프로젝트</p><p className="text-xs text-[#F5F0E8]/60">새 프로젝트 등록</p></div>
          </Link>
          <Link href="/dashboard?view=projects"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.folder('#F5F0E8',18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">내 프로젝트</p><p className="text-xs text-[#F5F0E8]/60">전체 프로젝트 목록</p></div>
          </Link>

          <Link href="/dashboard?view=dashboard&sub=project_gallery"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.gallery('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">프로젝트 갤러리</p><p className="text-xs text-[#F5F0E8]/60">AI Studio 스타일 쇼케이스</p></div>
          </Link>
          
          {/* 운영 섹션 */}
          <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">운영</p>
          <Link href="/dashboard?view=company"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.barChart('#F5F0E8',18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">회사 현황</p><p className="text-xs text-[#F5F0E8]/60">전체 조직 운영 현황</p></div>
          </Link>
          
          <Link href="/dashboard?view=dashboard&sub=grid"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.briefcase('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">회사 조직도</p><p className="text-xs text-[#F5F0E8]/60">9인 AI 임원진 및 부서</p></div>
          </Link>
          
          <Link href="/dashboard?view=dashboard&sub=boardroom"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.msgCircle('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">이사회 회의실</p><p className="text-xs text-[#F5F0E8]/60">실시간 의사결정 및 세션</p></div>
          </Link>
          
          <Link href="/dashboard?view=dashboard&sub=team_rooms"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.users('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">팀별 회의실</p><p className="text-xs text-[#F5F0E8]/60">9개 부서별 전용 실무 토론</p></div>
          </Link>
          
          <Link href="/dashboard?view=dashboard&sub=task_logs"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.monitor('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">작업 실행 로그</p><p className="text-xs text-[#F5F0E8]/60">백엔드 개발 실황 CCTV 채널</p></div>
          </Link>

          <Link href="/dashboard?view=dashboard&sub=service_guide"
            className="w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 text-[#F5F0E8]">
            <span className="text-base">{Icon.helpCircle('#F5F0E8', 18)}</span>
            <div className="text-left"><p className="text-sm font-semibold text-[#F5F0E8]">서비스 가이드</p><p className="text-xs text-[#F5F0E8]/60">텔레그램 핫키 및 사용 설명서</p></div>
          </Link>
        </nav>
        <div className="px-5 py-4 border-t border-amber-500/10">
          <p className="text-xs text-[#F5F0E8]/40">HiveDesk v4.0</p>
        </div>
      </aside>

      {/* Header */}
      <header className="border-b border-amber-500/10 backdrop-blur-md bg-[#0D0D0D]/80 sticky top-0 z-[100000] h-11 md:h-16 flex items-center justify-between w-full">
        <div className="w-full px-3 grid grid-cols-3 items-center">
          {/* 좌: 삼선 메뉴 버튼 고정 (데스크톱에서 숨김) */}
          <div className="flex items-center lg:hidden">
            <button
              id="btn-nav-menu"
              type="button"
              onClick={() => {
                setShowNavMenu(true)
              }}
              className="flex flex-col gap-[5px] w-8 h-8 justify-center tap-fast hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="block h-[2px] w-5 bg-[#F5F0E8]/70 rounded-full" />
              <span className="block h-[2px] w-4 bg-[#F5F0E8]/70 rounded-full" />
              <span className="block h-[2px] w-5 bg-[#F5F0E8]/70 rounded-full" />
            </button>
          </div>
          {/* 중앙: SVG 아이콘 + pure 메뉴명 고정 */}
          <div className="justify-self-center flex items-center gap-2 max-w-full lg:col-start-2">
            <span className="shrink-0">{Icon.plus('#F59E0B', 16)}</span>
            <span className="text-sm md:text-base font-bold text-[#F5F0E8] truncate tracking-wide font-sans">
              새 프로젝트 생성
            </span>
          </div>
          {/* 우: 계정 아바타 고정 */}
          <div className="flex justify-end lg:col-start-3">
            <button
              id="btn-user-menu"
              type="button"
              onClick={() => setShowUserMenu(true)}
              className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs tap-fast hover:bg-amber-500/30 transition-all active:scale-95 shadow-inner"
            >
              {Icon.user('#F5F0E8', 14)}
            </button>
          </div>
        </div>
      </header>

      {/* simulated AI CPO loading animation overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060606]/98 backdrop-blur-md px-6">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/35 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-amber-500/20 border border-amber-500/50 animate-pulse" />
            <span className="text-6xl bee-float">🧠</span>
          </div>
          <h3 className="text-xl font-bold text-amber-400 mb-3 tracking-wide text-shimmer">
            {ANALYSIS_PHASES[analysisPhase].title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium text-center max-w-sm leading-relaxed min-h-[4rem] px-4">
            {ANALYSIS_PHASES[analysisPhase].desc}
          </p>
          <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden mt-6 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${(analysisPhase + 1) * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={`flex-1 overflow-y-auto px-5 py-4 ${maxWidthClass} mx-auto w-full`}>
        {/* Step Progress Indicator (Unified Placement) */}
        <div className="glass rounded-2xl p-3.5 mb-6 border border-amber-500/10 bg-amber-950/5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest pl-1">생성 단계</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/35 px-2.5 py-0.5 rounded-md font-mono shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              Step {step} / {TOTAL_STEPS}
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : i + 1 < step
                    ? 'w-3 bg-amber-500/60'
                    : 'w-3 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 1: 기본 정보 ── */}
        {step === 1 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-xl font-bold text-amber-400 tracking-tight mb-2">🚀 한 줄로 시작하는 초고속 AI 기획</h2>
              <p className="text-xs md:text-sm text-[#F5F0E8]/75 font-medium leading-relaxed">대표님은 아이디어 한 줄만 가볍게 던져주세요. 하이브데스크의 9인 전문 AI 임원진이 비즈니스 타겟 세분화, 시스템 아키텍처 설계, 디자인 캔버스 프리뷰까지 단 10초 만에 알아서 완벽하게 조율해 드립니다.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2.5">프로젝트 이름 *</label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="예: FitPulse"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all shadow-inner"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2.5">한 줄 아이디어 기획안 * <span className="text-amber-400/90 font-medium ml-1">({description.length}/100)</span></label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="예: 오늘 진행한 운동과 컨디션을 기록하고 최적의 피트니스 루틴을 처방받는 맞춤형 헬스 케어 서비스"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all resize-none shadow-inner"
                  rows={3}
                  maxLength={100}
                />
              </div>

              <div className="pt-3">
                {!hasAnalyzed ? (
                  <button
                    type="button"
                    onClick={handleTriggerAnalysis}
                    disabled={!name.trim() || !description.trim()}
                    className={`w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 border ${
                      name.trim() && description.trim()
                        ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:scale-[1.01] active:scale-98 cursor-pointer font-black'
                        : 'bg-amber-500/5 text-amber-500/40 border-amber-500/20 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        name.trim() && description.trim() ? 'bg-black animate-ping' : 'bg-amber-500/40'
                      }`} />
                      {name.trim() && description.trim() ? '⚡ 9인 임원진에게 AI 기획 자동 완성하기 (10초 소요)' : '프로젝트명과 아이디어를 입력하면 AI가 분석합니다'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(2)}
                    className="w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 bg-teal-500 text-black border border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.3)] hover:scale-[1.01] active:scale-98 font-black"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      ✓ 맞춤 기획안 4종 자동 완성됨 (지금 즉시 확인하기)
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 의도 조율 게이트 (Intent Alignment Gate) ── */}
        {step === 2 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">AI Agent(CTO, CDO)가 분석한 {customIntents.length}가지 방향을 선택하세요</h2>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed">대표님의 아이디어를 실시간 분석하여 생성한 맞춤형 비즈니스 방향입니다. 각 방향은 서로 다른 수익 모델과 타겟을 가집니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {customIntents.map((intent, idx) => {
                const isSelected = selectedIntent === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectIntent(idx)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between h-full ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.15)] scale-[1.01]'
                        : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6 hover:scale-[1.01]'
                    }`}
                  >
                    {intent.badge && (
                      <span className={`absolute top-4 right-4 text-xs px-2.5 py-0.75 rounded-full font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-teal-400 text-black shadow-sm'
                          : 'bg-white/10 text-neutral-200'
                      }`}>
                        {intent.badge}
                      </span>
                    )}
                    <div className="space-y-3">
                      <h4 className={`text-lg font-extrabold transition-all tracking-tight pr-24 ${isSelected ? 'text-teal-400' : 'text-neutral-100'}`}>
                        {intent.title}
                      </h4>
                      <p className="text-sm text-neutral-200 font-semibold leading-relaxed mb-4">
                        {intent.desc}
                      </p>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5 text-xs font-semibold">
                      <div className="flex gap-2 items-start">
                        <span className="text-sm">🎨</span>
                        <p className="text-neutral-200">
                          <strong className={isSelected ? 'text-teal-400' : 'text-amber-400'}>CDO 하나:</strong> {intent.cdo}
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-sm">💻</span>
                        <p className="text-neutral-200">
                          <strong className={isSelected ? 'text-teal-400' : 'text-amber-400'}>CTO 뮤즈:</strong> {intent.cto}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-400 border-2 border-[#0D0D0D] flex items-center justify-center text-black text-sm font-extrabold shadow-md">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: 디자인 DNA 게이트 (Design DNA Gate) ── */}
        {step === 3 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">Design DNA (디자인 테마 프리셋)</h2>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed">CDO 하나가 제안하는 5종의 고품격 디자인 스키마입니다. 원하는 테마를 선택하고 다음 단계로 진행하세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* 1. Amber Sleek */}
              <button
                type="button"
                onClick={() => setSelectedDna('amber')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'amber'
                    ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-neutral-100">Amber Sleek</span>
                    <span className="text-[9px] text-amber-400 font-extrabold font-mono uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-500/25">고성능 테크</span>
                  </div>
                  <p className="text-[10px] text-neutral-300 font-semibold leading-relaxed mb-3">깊은 차콜 블랙 배경과 네온 앰버 테두리 조합의 현대적 테크 감성</p>
                  
                  {/* 전문 디자인 아이덴티티 스펙 */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5 mb-3 text-[9px] font-semibold text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span>Typography</span>
                      <span className="font-mono text-neutral-200">Outfit & Inter</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Concept</span>
                      <span className="text-neutral-200">사이버네틱 생산성</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <div className="flex items-center gap-1 font-mono text-neutral-200">
                        <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        <span>#F59E0B</span>
                        <div className="w-2 h-2 rounded-full bg-[#18181B] border border-white/25" />
                        <span>#18181B</span>
                      </div>
                    </div>
                  </div>

                  {/* 미니 샌드박스 컴포넌트 프리뷰 */}
                  <div className="w-full bg-[#111111] border border-amber-500/40 rounded-xl p-2.5 space-y-1.5 pointer-events-none shadow-inner select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-amber-500 font-bold uppercase">PREVIEW</span>
                      <span className="text-[7px] font-mono text-neutral-600">v1.4</span>
                    </div>
                    <div className="h-1.5 w-12 bg-amber-500/30 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-5.5 w-full bg-amber-500/20 border border-amber-500/50 rounded flex items-center justify-center text-[9px] text-amber-400 font-extrabold tracking-wider">
                      🐝 기획서 승인
                    </div>
                  </div>
                </div>
                {selectedDna === 'amber' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-[#0D0D0D] flex items-center justify-center text-black text-xs font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              {/* 2. Aurora Glass */}
              <button
                type="button"
                onClick={() => setSelectedDna('glass')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden hover:scale-[1.01] ${
                  selectedDna === 'glass'
                    ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div className="absolute -right-10 -bottom-10 w-20 h-20 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-neutral-100">Aurora Glass</span>
                    <span className="text-[9px] text-violet-300 font-extrabold font-mono uppercase tracking-wider bg-violet-500/20 px-1.5 py-0.5 rounded border border-violet-500/25">글래스모피즘</span>
                  </div>
                  <p className="text-[10px] text-neutral-300 font-semibold leading-relaxed mb-3">반투명 아크릴 유리 효과와 우아한 오로라 그라데이션의 프리미엄 감성</p>
                  
                  {/* 전문 디자인 아이덴티티 스펙 */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5 mb-3 text-[9px] font-semibold text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span>Typography</span>
                      <span className="font-mono text-neutral-200">Syne & Inter</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Concept</span>
                      <span className="text-neutral-200">미래지향 프리미엄</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <div className="flex items-center gap-1 font-mono text-neutral-200">
                        <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                        <span>#8B5CF6</span>
                        <div className="w-2 h-2 rounded-full bg-[#EC4899]" />
                        <span>#EC4899</span>
                      </div>
                    </div>
                  </div>

                  {/* 미니 샌드박스 컴포넌트 프리뷰 */}
                  <div className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-2.5 space-y-1.5 pointer-events-none shadow-inner select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-violet-300 font-bold uppercase">PREVIEW</span>
                      <span className="text-[7px] font-mono text-white/40">v1.4</span>
                    </div>
                    <div className="h-1.5 w-8 bg-violet-400/40 rounded-full" />
                    <div className="h-3 w-full bg-white/15 rounded" />
                    <div className="h-5.5 w-full bg-gradient-to-r from-violet-500/40 to-fuchsia-500/40 border border-white/20 rounded-full flex items-center justify-center text-[9px] text-violet-100 font-extrabold tracking-wider">
                      ✨ 기획서 승인
                    </div>
                  </div>
                </div>
                {selectedDna === 'glass' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-400 border-2 border-[#0D0D0D] flex items-center justify-center text-black text-xs font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              {/* 3. Cyber Lime (NEW) */}
              <button
                type="button"
                onClick={() => setSelectedDna('lime')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'lime'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_20px_rgba(204,255,0,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-neutral-100">Cyber Lime</span>
                    <span className="text-[9px] text-[#CCFF00] font-extrabold font-mono uppercase tracking-wider bg-[#CCFF00]/10 px-1.5 py-0.5 rounded border border-[#CCFF00]/25">네오 미니멀</span>
                  </div>
                  <p className="text-[10px] text-neutral-300 font-semibold leading-relaxed mb-3">깊은 흑연색(Graphite) 배경과 쨍한 일렉트릭 라임의 압도적인 몰입감</p>
                  
                  {/* 전문 디자인 아이덴티티 스펙 */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5 mb-3 text-[9px] font-semibold text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span>Typography</span>
                      <span className="font-mono text-neutral-200">Jakarta & JB Mono</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Concept</span>
                      <span className="text-neutral-200">날렵한 기동성·속도</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <div className="flex items-center gap-1 font-mono text-neutral-200">
                        <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                        <span>#CCFF00</span>
                        <div className="w-2 h-2 rounded-full bg-[#121314] border border-white/25" />
                        <span>#121314</span>
                      </div>
                    </div>
                  </div>

                  {/* 미니 샌드박스 컴포넌트 프리뷰 */}
                  <div className="w-full bg-[#121314] border border-[#CCFF00]/40 rounded-xl p-2.5 space-y-1.5 pointer-events-none shadow-inner select-none font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-[#CCFF00] font-bold uppercase">PREVIEW</span>
                      <span className="text-[7px] font-mono text-neutral-600">v1.4</span>
                    </div>
                    <div className="h-1.5 w-10 bg-[#CCFF00]/30 rounded animate-pulse" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-5.5 w-full bg-[#CCFF00]/20 border border-[#CCFF00]/60 rounded flex items-center justify-center text-[9px] text-[#CCFF00] font-bold tracking-wider">
                      [ 기획서 승인 ]
                    </div>
                  </div>
                </div>
                {selectedDna === 'lime' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CCFF00] border-2 border-[#0D0D0D] flex items-center justify-center text-black text-xs font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              {/* 4. Midnight Indigo (NEW) */}
              <button
                type="button"
                onClick={() => setSelectedDna('indigo')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'indigo'
                    ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-neutral-100">Midnight Indigo</span>
                    <span className="text-[9px] text-indigo-300 font-extrabold font-mono uppercase tracking-wider bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/25">네오 클래식 다크</span>
                  </div>
                  <p className="text-[10px] text-neutral-300 font-semibold leading-relaxed mb-3">옵시디안 블랙 베이스에 소프트 인디고 글로우가 내뿜는 웅장한 신뢰감</p>
                  
                  {/* 전문 디자인 아이덴티티 스펙 */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5 mb-3 text-[9px] font-semibold text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span>Typography</span>
                      <span className="font-mono text-neutral-200">Outfit & Inter</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Concept</span>
                      <span className="text-neutral-200">웅장한 럭셔리·신뢰</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <div className="flex items-center gap-1 font-mono text-neutral-200">
                        <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                        <span>#6366F1</span>
                        <div className="w-2 h-2 rounded-full bg-[#030712] border border-white/25" />
                        <span>#030712</span>
                      </div>
                    </div>
                  </div>

                  {/* 미니 샌드박스 컴포넌트 프리뷰 */}
                  <div className="w-full bg-[#030712] border border-indigo-500/30 rounded-xl p-2.5 space-y-1.5 pointer-events-none shadow-[0_0_12px_rgba(99,102,241,0.12)] select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase">PREVIEW</span>
                      <span className="text-[7px] font-mono text-neutral-600">v1.4</span>
                    </div>
                    <div className="h-1.5 w-12 bg-indigo-500/25 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-5.5 w-full bg-indigo-500/20 border border-indigo-500/40 rounded flex items-center justify-center text-[9px] text-indigo-300 font-extrabold tracking-wider">
                      🔮 기획서 승인
                    </div>
                  </div>
                </div>
                {selectedDna === 'indigo' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6366F1] border-2 border-[#0D0D0D] flex items-center justify-center text-white text-xs font-bold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              {/* 5. Midnight Swiss */}
              <button
                type="button"
                onClick={() => setSelectedDna('swiss')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'swiss'
                    ? 'border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.12)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-neutral-100">Midnight Swiss</span>
                    <span className="text-[9px] text-white font-extrabold font-mono uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded border border-white/20">스위스 모던</span>
                  </div>
                  <p className="text-[10px] text-neutral-300 font-semibold leading-relaxed mb-3">대담한 타이포 레이아웃과 1px의 극단적 칼선으로 설계한 흑백 대비 모더니즘</p>
                  
                  {/* 전문 디자인 아이덴티티 스펙 */}
                  <div className="space-y-1.5 border-t border-white/5 pt-2.5 mb-3 text-[9px] font-semibold text-neutral-400">
                    <div className="flex items-center justify-between">
                      <span>Typography</span>
                      <span className="font-mono text-neutral-200">Space Grotesk & Inter</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Concept</span>
                      <span className="text-neutral-200">차가운 정밀함·대담</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <div className="flex items-center gap-1 font-mono text-neutral-200">
                        <div className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                        <span>#FFFFFF</span>
                        <div className="w-2 h-2 rounded-full bg-[#FF002E]" />
                        <span>#FF002E</span>
                      </div>
                    </div>
                  </div>

                  {/* 미니 샌드박스 컴포넌트 프리뷰 */}
                  <div className="w-full bg-[#09090B] border border-white/25 rounded-lg p-2.5 space-y-1.5 pointer-events-none shadow-inner select-none text-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-neutral-200 font-bold uppercase">PREVIEW</span>
                      <span className="text-[7px] font-mono text-neutral-500">v1.4</span>
                    </div>
                    <div className="h-1.5 w-10 bg-white/30 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-5.5 w-full bg-white text-black font-extrabold text-[9px] rounded flex items-center justify-center border border-white tracking-wider">
                      ⬜ 기획서 승인
                    </div>
                  </div>
                </div>
                {selectedDna === 'swiss' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#0D0D0D] flex items-center justify-center text-black text-xs font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: 기획 세부 사항 검토 (PRD & Goal Alignment) ── */}
        {step === 4 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">CPO 이안의 기획서 세부 검토</h2>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed">조율된 의도를 기반으로 임원진이 자동 작성한 PRD 속성입니다. 내용을 자유롭게 튜닝해보세요.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2.5">카테고리</label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(prev => prev === c ? '' : c)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        category === c 
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-sm scale-105' 
                          : 'bg-white/5 text-neutral-300 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2.5">개발 단계</label>
                <div className="grid grid-cols-5 gap-2.5">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all ${
                        stage === s.id 
                          ? 'border-2 border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm scale-102' 
                          : 'border-white/10 bg-white/4 text-neutral-300 hover:border-white/25 hover:bg-white/6'
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-[10px] font-semibold leading-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">프로젝트 목표</label>
                <textarea
                  id="project-goals"
                  value={goals}
                  onChange={e => setGoals(e.target.value)}
                  placeholder="예: 유료 구독자 100명, 스킬 1,000개 생성"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">핵심 타겟 유저</label>
                <textarea
                  id="target-audience"
                  value={userTarget}
                  onChange={e => setUserTarget(e.target.value)}
                  placeholder="예: AI 자동화에 관심 있는 비개발자 1인 창업자"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">추천 기술 스택</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  placeholder="예: Next.js · Supabase · n8n"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">예상 해결 과제 (Blockers)</label>
                <textarea
                  value={challenges}
                  onChange={e => setChallenges(e.target.value)}
                  placeholder="예: 오프라인 데이터 실시간 동기화 이슈 해결"
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2.5">수익 모델</label>
                <div className="flex flex-wrap gap-2.5">
                  {REVENUE_MODELS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRevenueModel(prev => prev === r ? '' : r)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        revenueModel === r 
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 scale-105 shadow-sm' 
                          : 'bg-white/5 text-neutral-300 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {revenueModel === '구독제' && (
                <div>
                  <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">가격대 (선택)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="예: 기본 ₩9,900/월 · 프로 ₩29,900/월"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all shadow-inner"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">웹사이트 (선택)</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#F5F0E8]/80 uppercase tracking-wider mb-2">GitHub (선택)</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-white/10 text-[#F5F0E8] placeholder-[#F5F0E8]/35 focus:outline-none focus:border-amber-500/70 focus:bg-white/3 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 bg-[#060606]/98 border-t border-white/10 px-5 py-4 pb-safe-6 flex gap-3.5 max-w-lg mx-auto w-full">
        {step > 1 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold glass text-neutral-200 hover:text-white transition-all active:scale-95 border border-white/10"
          >
            ← 이전
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => { if (canNext()) go(step + 1) }}
            disabled={!canNext()}
            className={`flex-[2] py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              canNext() 
                ? 'bg-amber-400 text-black border-2 border-amber-300 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.2)] cta-pulse' 
                : 'bg-neutral-800/40 text-neutral-500 border border-neutral-700/50 cursor-not-allowed'
            }`}
          >
            다음 →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 px-4 rounded-xl text-sm font-bold bg-amber-400 text-black border-2 border-amber-300 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.2)] cta-pulse transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '🐝 임원진 소집 및 기획서 확정 중...' : `🚀 ${name || '프로젝트'} 시작하기`}
          </button>
        )}
      </div>

      {/* Nav 드로어 (왼쪽) */}
      {showNavMenu && (
        <>
          <div className="fixed inset-0 z-[110000] bg-black/60 backdrop-blur-sm" onClick={() => setShowNavMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 z-[120000] bg-[#0D0D0D] border-r border-amber-500/15 flex flex-col" style={{ animation: 'slideInLeft 0.22s ease' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-amber-500/10">
              <button
                onClick={() => {
                  router.push('/dashboard')
                  setShowNavMenu(false)
                }}
                className="flex items-center gap-2 text-left cursor-pointer focus:outline-none select-none tap-fast active:scale-95 transition-transform"
              >
                <span className="text-xl bee-float">🐝</span>
                <div>
                  <p className="text-xs font-bold text-shimmer">HiveDesk</p>
                  <p className="text-[10px] text-[#F5F0E8]/60">내 손안의 AI 1인 기업</p>
                </div>
              </button>
              <button onClick={() => setShowNavMenu(false)} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 text-lg pr-1">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {/* 프로젝트 섹션 */}
              <p className="px-5 pt-3 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">프로젝트</p>
              <button
                onClick={() => setShowNavMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-amber-500/8 transition-colors text-left"
              >
                <span className="text-base">{Icon.plus('#F5F0E8', 16)}</span>
                <div>
                  <p className="text-sm font-semibold text-amber-400">새 프로젝트</p>
                  <p className="text-xs text-[#F5F0E8]/60">새 프로젝트 등록</p>
                </div>
              </button>
              <button
                onClick={() => {
                  router.push('/dashboard?view=projects')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.folder('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">내 프로젝트</p>
                  <p className="text-xs text-[#F5F0E8]/60">전체 프로젝트 목록</p>
                </div>
              </button>
              {/* 운영 섹션 */}
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">운영</p>
              <button
                onClick={() => {
                  router.push('/dashboard?view=company')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.barChart('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">회사 현황</p>
                  <p className="text-xs text-[#F5F0E8]/60">전체 조직 운영 현황</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  router.push('/dashboard?view=dashboard&sub=grid')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.briefcase('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">회사 조직도</p>
                  <p className="text-xs text-[#F5F0E8]/60">9인 AI 임원진 및 부서</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  router.push('/dashboard?view=dashboard&sub=boardroom')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.msgCircle('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">이사회 회의실</p>
                  <p className="text-xs text-[#F5F0E8]/60">실시간 의사결정 및 세션</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  router.push('/dashboard?view=dashboard&sub=team_rooms')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.users('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">팀별 회의실</p>
                  <p className="text-xs text-[#F5F0E8]/60">9개 부서별 전용 실무 토론</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  router.push('/dashboard?view=dashboard&sub=task_logs')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.monitor('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">작업 실행 로그</p>
                  <p className="text-xs text-[#F5F0E8]/60">백엔드 개발 실황 CCTV 채널</p>
                </div>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard?view=dashboard&sub=service_guide')
                  setShowNavMenu(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-base">{Icon.helpCircle('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">서비스 가이드</p>
                  <p className="text-xs text-[#F5F0E8]/60">텔레그램 핫키 및 사용 설명서</p>
                </div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10">
              <p className="text-xs text-[#F5F0E8]/40">HiveDesk v4.0</p>
            </div>
          </div>
        </>
      )}

      {/* User 드로어 (오른쪽) */}
      {showUserMenu && (
        <>
          <div className="fixed inset-0 z-[110000] bg-black/60 backdrop-blur-sm" onClick={() => setShowUserMenu(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-64 z-[120000] bg-[#0D0D0D] border-l border-amber-500/15 flex flex-col" style={{ animation: 'slideInRight 0.22s ease' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-amber-500/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7.5 h-7.5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs">{Icon.user('#F5F0E8', 13)}</div>
                <div>
                  <p className="text-xs font-bold text-[#F5F0E8]">대표님</p>
                  <p className="text-[10px] text-[#F5F0E8]/60">🚀 Starter 플랜</p>
                </div>
              </div>
              <button onClick={() => setShowUserMenu(false)} className="text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 text-lg">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              <p className="px-5 pt-3 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">계정</p>
              <button onClick={() => { router.push('/dashboard'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{Icon.user('#F5F0E8', 18)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">개인정보</p><p className="text-xs text-[#F5F0E8]/60">프로필 및 계정 설정</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">플랜 & 결제</p>
              <button onClick={() => { router.push('/dashboard'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{Icon.rocket('#F5F0E8', 18)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">구독 관리</p><p className="text-xs text-[#F5F0E8]/60">플랜 업그레이드 · 결제</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">개발자</p>
              <button onClick={() => { router.push('/dashboard'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{Icon.key('#F5F0E8', 18)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">API Key 관리</p><p className="text-xs text-[#F5F0E8]/60">Claude · Gemini BYOK</p></div>
              </button>
              <button onClick={() => { router.push('/dashboard'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base"><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M16.36 7.64l1.42-1.42"/></svg></span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">인재 등급 관리</p><p className="text-xs text-[#F5F0E8]/60">A·B·C 등급별 AI 모델 설정</p></div>
              </button>
              <p className="px-5 pt-4 pb-1 text-xs font-bold text-[#F5F0E8]/50 uppercase tracking-wider">설정</p>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{Icon.globe('#F5F0E8', 18)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">언어 설정</p><p className="text-xs text-[#F5F0E8]/60">한국어 · English · 日本語</p></div>
              </button>
              <button onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left">
                <span className="text-base">{Icon.bell('#F5F0E8', 18)}</span>
                <div><p className="text-sm font-semibold text-[#F5F0E8]">알림 설정</p><p className="text-xs text-[#F5F0E8]/60">텔레그램 · 이메일 알림</p></div>
              </button>
            </nav>
            <div className="px-5 py-4 border-t border-amber-500/10 flex flex-col gap-2">
              <button onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 py-2 text-rose-400/80 hover:text-rose-400 transition-colors text-left">
                <span className="text-base">{Icon.logOut('#F87171', 18)}</span>
                <p className="text-sm font-semibold">로그아웃</p>
              </button>
              <div className="pt-2 border-t border-white/5 flex flex-col gap-0.5">
                <p className="text-[11px] text-[#F5F0E8]/40 font-bold">HiveDesk v4.0</p>
                <p className="text-[9px] text-[#F5F0E8]/20 font-mono">9-Executive Automation OS</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🔮 모바일 전용 아크릴 바텀 드로어 (Bottom Sheet Drawer) */}
      {showBottomDrawer && (
        <>
          <div
            className="fixed inset-0 z-[110000] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowBottomDrawer(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[120000] bg-[#070708]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl px-4 pt-4 pb-6 flex flex-col gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] h-fit max-h-[85vh] overflow-y-auto custom-scrollbar"
            style={{ animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* 드로어 헤더 */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl bee-float">🐝</span>
                <span className="text-xs font-bold text-shimmer">HiveDesk 메뉴</span>
              </div>
              <button
                onClick={() => setShowBottomDrawer(false)}
                className="text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 text-lg pr-1"
              >
                ✕
              </button>
            </div>

            {/* 📁 프로젝트 관리 섹션 */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest pl-2">프로젝트 관리</p>
              
              <button
                type="button"
                onClick={() => setShowBottomDrawer(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-500/12 text-[#F5F0E8] border border-amber-500/20 bg-amber-500/5 transition-all active:scale-[0.98] text-left"
              >
                <span className="shrink-0">{Icon.plus('#F59E0B', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-amber-400">새 프로젝트 생성</p>
                  <p className="text-[10px] text-amber-400/80 font-medium">새로운 AI 비즈니스 아이디어 기획</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  router.push('/dashboard?view=projects')
                  setShowBottomDrawer(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 text-[#F5F0E8]/70 border border-transparent transition-all"
              >
                <span className="shrink-0">{Icon.folder('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">내 프로젝트</p>
                  <p className="text-[10px] text-[#F5F0E8]/40 font-medium">진행 중인 전체 프로젝트 통합 관리</p>
                </div>
              </button>
            </div>

            {/* 💼 회사 운영 섹션 */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest pl-2">회사 운영</p>
              
              <button
                type="button"
                onClick={() => {
                  router.push('/dashboard?view=company')
                  setShowBottomDrawer(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 text-[#F5F0E8]/70 border border-transparent transition-all"
              >
                <span className="shrink-0">{Icon.barChart('#F5F0E8', 18)}</span>
                <div>
                  <p className="text-sm font-semibold text-[#F5F0E8]">회사 현황</p>
                  <p className="text-[10px] text-[#F5F0E8]/40 font-medium">전사 리소스 분석 및 재무 통계</p>
                </div>
              </button>

              {[
                { id: 'grid', label: '회사 조직도', desc: '9인 AI 임원진 및 소속 부서 체계', icon: (c: string) => Icon.briefcase(c, 18) },
                { id: 'boardroom', label: '이사회 회의실', desc: '텔레그램 실시간 AI 협업 및 의결 조율', icon: (c: string) => Icon.msgCircle(c, 18) },
                { id: 'team_rooms', label: '팀별 회의실', desc: '임원 산하 세부 실무 요원 토론 공간', icon: (c: string) => Icon.users(c, 18) },
                { id: 'task_logs', label: '작업 실행 로그', desc: '실무 에이전트 개발 실황 CCTV 생중계', icon: (c: string) => Icon.monitor(c, 18) },
                { id: 'service_guide', label: '서비스 가이드', desc: '하이브데스크 단축키 및 핵심 사용법', icon: (c: string) => Icon.helpCircle(c, 18) }
              ].map((menu) => {
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => {
                      router.push(`/dashboard?view=dashboard&sub=${menu.id}`)
                      setShowBottomDrawer(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 text-[#F5F0E8]/70 border border-transparent transition-all"
                  >
                    <span className="shrink-0">{menu.icon('#F5F0E8')}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#F5F0E8]">{menu.label}</p>
                      <p className="text-[10px] text-[#F5F0E8]/40 font-medium">{menu.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 🎯 활성 프로젝트 뱃지 (하단으로 이동하여 밀착) */}
            <div className="bg-sky-500/10 border border-sky-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2 mt-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <p className="text-[11px] text-sky-200 font-bold">
                활성 프로젝트: {activeProject ? activeProject.title : '활성 프로젝트 없음'}
              </p>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes bar-shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  )
}
