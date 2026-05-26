'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

const TOTAL_STEPS = 5

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgId, setOrgId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dir, setDir] = useState<'forward' | 'back'>('forward')

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
  const [selectedDna, setSelectedDna] = useState<'amber' | 'glass' | 'clay'>('amber')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisPhase, setAnalysisPhase] = useState(0)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [customIntents, setCustomIntents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d.org_id) setOrgId(d.org_id)
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
      router.push('/dashboard?view=projects')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const maxWidthClass = (step === 2 || step === 3) ? 'max-w-3xl' : 'max-w-lg'

  return (
    <main className="h-screen h-[100dvh] overflow-hidden hero-bg honeycomb-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-[#060606]/90 sticky top-0 z-50 px-5 py-4 flex items-center gap-3 backdrop-blur-md">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm text-amber-400 hover:scale-105 active:scale-95 transition-all">←</button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none select-none tap-fast active:scale-95 transition-transform"
          >
            <span className="text-2xl bee-float">🐝</span>
            <h1 className="text-xl md:text-2xl font-black text-amber-400 tracking-tight text-shimmer font-mono leading-none">HiveDesk</h1>
          </button>
          <span className="text-[10px] md:text-xs font-extrabold text-neutral-100 px-2 py-0.75 rounded-md bg-amber-500/20 border border-amber-500/40 font-mono shadow-[0_0_12px_rgba(245,158,11,0.15)] ml-1 flex items-center justify-center self-center leading-none">
            Step {step} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="ml-auto flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-amber-400 step-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : i + 1 < step ? 'w-4 bg-amber-500/80' : 'w-4 bg-white/10'}`} />
          ))}
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
          <h3 className="text-xl font-extrabold text-amber-400 mb-3 tracking-wide text-shimmer">
            {ANALYSIS_PHASES[analysisPhase].title}
          </h3>
          <p className="text-sm text-neutral-200 font-semibold text-center max-w-sm leading-relaxed min-h-[4rem] px-4">
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
      <div className={`flex-1 overflow-y-auto px-5 py-8 ${maxWidthClass} mx-auto w-full`}>

        {/* ── STEP 1: 기본 정보 ── */}
        {step === 1 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-amber-400 tracking-tight mb-1.5">🚀 한 줄로 시작하는 초고속 AI 기획</h2>
              <p className="text-xs md:text-sm text-neutral-350 font-medium leading-relaxed">대표님은 아이디어 한 줄만 가볍게 던져주세요. 하이브데스크의 9인 전문 AI 임원진이 비즈니스 타겟 세분화, 시스템 아키텍처 설계, 디자인 캔버스 프리뷰까지 단 10초 만에 알아서 완벽하게 조율해 드립니다.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2.5">프로젝트 이름 *</label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="예: FitPulse"
                  className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all shadow-inner"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2.5">한 줄 아이디어 기획안 * <span className="text-neutral-400 font-medium ml-1">({description.length}/100)</span></label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="예: 오늘 진행한 운동과 컨디션을 기록하고 최적의 피트니스 루틴을 처방받는 맞춤형 헬스 케어 서비스"
                  className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all resize-none shadow-inner"
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
                    className={`w-full py-4.5 px-6 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between gap-3 border ${
                      name.trim() && description.trim()
                        ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-98 cursor-pointer'
                        : 'bg-amber-500/5 text-amber-450 border-amber-500/25 cursor-not-allowed hover:bg-amber-500/8'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-left">
                      <span className={`w-2 h-2 rounded-full ${
                        name.trim() && description.trim() ? 'bg-black animate-ping' : 'bg-amber-500 animate-pulse'
                      }`} />
                      {name.trim() && description.trim() ? 'Gemini AI로 맞춤 기획안 4개 즉시 생성' : '프로젝트명과 아이디어를 입력하면 AI가 분석합니다'}
                    </span>
                    <div className={`w-10 h-5.5 rounded-full relative p-0.5 flex items-center shrink-0 transition-all duration-300 ${
                      name.trim() && description.trim() ? 'bg-black border border-amber-500/30' : 'bg-amber-950/40 border border-amber-500/20'
                    }`}>
                      <div className={`w-4.5 h-4.5 rounded-full transition-all duration-300 transform ${
                        name.trim() && description.trim() ? 'translate-x-4.5 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'translate-x-0 bg-amber-500/60 shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                      }`} />
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(2)}
                    className="w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between gap-3 bg-amber-400 text-black border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-98"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                      ⚡ Gemini가 생성한 맞춤 기획안 {customIntents.length}개 확인하기
                    </span>
                    <div className="w-10 h-5.5 bg-black border border-amber-500/30 rounded-full relative p-0.5 flex items-center shrink-0 transition-colors duration-300">
                      <div className="w-4.5 h-4.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-all duration-300 transform translate-x-4.5" />
                    </div>
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
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">Gemini가 분석한 {customIntents.length}가지 방향을 선택하세요</h2>
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
                      <span className={`absolute top-4 right-4 text-[10px] px-2.5 py-0.75 rounded-full font-bold uppercase tracking-wider ${
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
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">Visual DNA (디자인 테마 프리셋)</h2>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed">CDO 하나가 제안하는 3종의 디자인 스키마입니다. 미리보기를 실시간으로 확인해보세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                type="button"
                onClick={() => { setSelectedDna('amber'); go(4); }}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'amber'
                    ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-neutral-100">Amber Sleek</span>
                    <span className="text-xs text-amber-400 font-extrabold font-mono uppercase tracking-wider">고성능 테크</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold leading-relaxed mb-4">깊은 차콜 블랙 배경과 네온 앰버 테두리 조합의 현대적 테크 감성</p>
                  
                  <div className="w-full bg-[#161616] border border-amber-500/40 rounded-lg p-3 space-y-2 mb-4 pointer-events-none shadow-inner">
                    <div className="h-2.5 w-14 bg-amber-500/30 rounded" />
                    <div className="h-4.5 w-full bg-white/10 rounded" />
                    <div className="h-6.5 w-18 bg-amber-500/20 border border-amber-500/50 rounded flex items-center justify-center text-[10px] text-amber-400 font-extrabold tracking-wider">
                      버튼
                    </div>
                  </div>
                </div>
                {selectedDna === 'amber' && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-[#0D0D0D] flex items-center justify-center text-black text-sm font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setSelectedDna('glass'); go(4); }}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden hover:scale-[1.01] ${
                  selectedDna === 'glass'
                    ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-neutral-100">Aurora Glass</span>
                    <span className="text-xs text-violet-300 font-extrabold font-mono uppercase tracking-wider">글래스모피즘</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold leading-relaxed mb-4">반투명 아크릴 유리 효과와 우아한 오로라 광원 그라데이션의 프리미엄 감성</p>
                  
                  <div className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3 space-y-2 mb-4 pointer-events-none shadow-inner">
                    <div className="h-2.5 w-10 bg-violet-400/40 rounded-full" />
                    <div className="h-4.5 w-full bg-white/15 rounded" />
                    <div className="h-6.5 w-22 bg-gradient-to-r from-violet-500/40 to-fuchsia-500/40 border border-white/20 rounded-full flex items-center justify-center text-[10px] text-violet-100 font-extrabold tracking-wider">
                      버튼
                    </div>
                  </div>
                </div>
                {selectedDna === 'glass' && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-400 border-2 border-[#0D0D0D] flex items-center justify-center text-black text-sm font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setSelectedDna('clay'); go(4); }}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-full transition-all duration-300 relative hover:scale-[1.01] ${
                  selectedDna === 'clay'
                    ? 'border-amber-900 bg-amber-900/15 shadow-[0_0_20px_rgba(146,64,14,0.15)] scale-[1.01]'
                    : 'border-white/10 bg-white/4 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-base font-extrabold text-neutral-100">Warm Clay</span>
                    <span className="text-xs text-amber-800 font-extrabold font-mono uppercase tracking-wider">뉴브루탈리즘</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold leading-relaxed mb-4">편안한 살구 아이보리 캔버스와 굵은 외곽선, 두꺼운 그림자의 위트 있는 감성</p>
                  
                  <div className="w-full bg-[#FAF7F2] border-2 border-neutral-800 rounded-xl p-3 space-y-2 mb-4 pointer-events-none shadow-[2px_2px_0px_#27272A]">
                    <div className="h-2.5 w-12 bg-amber-900/30 rounded" />
                    <div className="h-4.5 w-full bg-[#EAE3D2] rounded" />
                    <div className="h-6.5 w-18 bg-[#FF8A65] border-2 border-neutral-800 rounded-lg flex items-center justify-center text-[10px] text-neutral-900 font-extrabold shadow-[2px_2px_0px_#27272A] tracking-wider">
                      버튼
                    </div>
                  </div>
                </div>
                {selectedDna === 'clay' && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-800 border-2 border-[#0D0D0D] flex items-center justify-center text-[#FAF7F2] text-sm font-extrabold shadow-md">
                    ✓
                  </div>
                )}
              </button>
            </div>

            <div className="mt-8">
              <label className="block mb-3.5 text-center text-xs tracking-widest text-neutral-300 uppercase font-extrabold">
                🖥️ 실시간 컴포넌트 렌더링 미리보기 (CDO 하나 캔버스)
              </label>
              
              <div className="w-full rounded-2xl bg-neutral-950/90 border border-white/10 p-8 flex items-center justify-center min-h-[250px] transition-all relative overflow-hidden shadow-inner">
                {selectedDna === 'amber' && (
                  <div className="w-full max-w-sm bg-neutral-900 border-2 border-amber-500/40 rounded-xl p-6 shadow-[0_0_25px_rgba(245,158,11,0.12)] space-y-4 fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.75 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-extrabold uppercase tracking-wider">
                        PREVIEW
                      </span>
                      <span className="text-[10px] text-neutral-400 font-extrabold font-mono">v1.4</span>
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-base font-extrabold text-amber-400 tracking-tight font-mono">
                        {name || '프로젝트 제목'}
                      </h5>
                      <p className="text-xs text-neutral-200 font-semibold leading-relaxed">
                        {description || '한 줄 기획 아이디어가 여기에 렌더링됩니다.'}
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button onClick={() => go(4)} type="button" className="flex-1 py-2.5 bg-amber-500 text-black text-xs font-extrabold rounded hover:bg-amber-400 hover:scale-[1.02] active:scale-98 transition-all font-mono tracking-wider shadow-md">
                        🐝 기획서 승인
                      </button>
                      <button onClick={() => go(2)} type="button" className="px-4 py-2.5 bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-extrabold rounded hover:bg-neutral-700 transition-all font-mono">
                        닫기
                      </button>
                    </div>
                  </div>
                )}

                {selectedDna === 'glass' && (
                  <div className="w-full max-w-sm backdrop-blur-md bg-white/10 border-2 border-white/20 rounded-2xl p-6 shadow-[0_8_32px_0_rgba(139,92,246,0.22)] space-y-4 relative overflow-hidden fade-in">
                    <div className="absolute -left-20 -top-20 w-40 h-40 rounded-full bg-violet-600/15 blur-2xl pointer-events-none" />
                    <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-fuchsia-600/15 blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-100 border border-white/20 uppercase tracking-wider font-extrabold">
                        PREVIEW
                      </span>
                      <span className="text-[10px] text-white/40 font-extrabold font-mono">v1.4</span>
                    </div>
                    <div className="space-y-1.5 relative z-10">
                      <h5 className="text-base font-extrabold text-[#F5F0E8] tracking-tight bg-gradient-to-r from-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                        {name || '프로젝트 제목'}
                      </h5>
                      <p className="text-xs text-violet-100/90 font-semibold leading-relaxed">
                        {description || '한 줄 기획 아이디어가 여기에 렌더링됩니다.'}
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2 relative z-10">
                      <button onClick={() => go(4)} type="button" className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 hover:scale-[1.02] active:scale-98 text-white text-xs font-extrabold rounded-full transition-all shadow-lg shadow-violet-500/30 tracking-wider">
                        ✨ 기획서 승인
                      </button>
                      <button onClick={() => go(2)} type="button" className="px-4 py-2.5 bg-white/10 text-white border border-white/20 text-xs font-extrabold rounded-full hover:bg-white/20 transition-all">
                        닫기
                      </button>
                    </div>
                  </div>
                )}

                {selectedDna === 'clay' && (
                  <div className="w-full max-w-sm bg-[#FCF8F2] border-2 border-neutral-800 rounded-xl p-6 shadow-[5px_5px_0px_#1E1E1E] text-neutral-800 space-y-4 fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.75 rounded-md bg-[#FFE0B2] text-amber-900 border border-neutral-800 font-extrabold uppercase tracking-wider">
                        PREVIEW
                      </span>
                      <span className="text-[10px] text-neutral-500 font-extrabold font-mono">v1.4</span>
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-base font-extrabold text-neutral-800 tracking-tight">
                        {name || '프로젝트 제목'}
                      </h5>
                      <p className="text-xs text-neutral-700 font-bold leading-relaxed">
                        {description || '한 줄 기획 아이디어가 여기에 렌더링됩니다.'}
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button onClick={() => go(4)} type="button" className="flex-1 py-2.5 bg-[#FF8A65] hover:bg-[#FF7A50] text-neutral-900 text-xs font-extrabold rounded-lg border-2 border-neutral-800 shadow-[2px_2px_0px_#1E1E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all tracking-wider">
                        🚀 기획서 승인
                      </button>
                      <button onClick={() => go(2)} type="button" className="px-4 py-2.5 bg-[#EAE3D2] hover:bg-[#DDD6C3] text-neutral-700 text-xs font-extrabold rounded-lg border-2 border-neutral-800 shadow-[2px_2px_0px_#1E1E1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                        닫기
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                <label className="block text-sm font-extrabold text-neutral-100 mb-2.5">카테고리</label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(prev => prev === c ? '' : c)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
                        category === c 
                          ? 'bg-amber-500/30 text-amber-300 border-2 border-amber-400 shadow-sm scale-105' 
                          : 'bg-white/5 text-neutral-200 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2.5">개발 단계</label>
                <div className="grid grid-cols-5 gap-2.5">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all ${
                        stage === s.id 
                          ? 'border-2 border-amber-400 bg-amber-500/20 text-amber-300 font-extrabold shadow-sm scale-102' 
                          : 'border-white/10 bg-white/4 text-neutral-200 hover:border-white/25 hover:bg-white/6'
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-[10px] font-extrabold leading-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2">6개월 후 제품 목표</label>
                <textarea
                  id="project-goals"
                  value={goals}
                  onChange={e => setGoals(e.target.value)}
                  placeholder="예: 유료 구독자 100명, 스킬 1,000개 생성"
                  className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2">핵심 타겟 유저</label>
                <textarea
                  id="target-audience"
                  value={userTarget}
                  onChange={e => setUserTarget(e.target.value)}
                  placeholder="예: AI 자동화에 관심 있는 비개발자 1인 창업자"
                  className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2">추천 기술 스택</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  placeholder="예: Next.js · Supabase · n8n"
                  className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2">예상 해결 과제 (Blockers)</label>
                <textarea
                  value={challenges}
                  onChange={e => setChallenges(e.target.value)}
                  placeholder="예: 오프라인 데이터 실시간 동기화 이슈 해결"
                  className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-neutral-100 mb-2.5">수익 모델</label>
                <div className="flex flex-wrap gap-2.5">
                  {REVENUE_MODELS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRevenueModel(prev => prev === r ? '' : r)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
                        revenueModel === r 
                          ? 'bg-amber-500/30 text-amber-300 border-2 border-amber-400 scale-105 shadow-sm' 
                          : 'bg-white/5 text-neutral-200 border-white/15 hover:border-white/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {revenueModel === '구독제' && (
                <div>
                  <label className="block text-sm font-extrabold text-neutral-100 mb-2">가격대 (선택)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="예: 기본 ₩9,900/월 · 프로 ₩29,900/월"
                    className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-neutral-100 mb-2">웹사이트 (선택)</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-neutral-100 mb-2">GitHub (선택)</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/"
                    className="w-full px-4 py-3.5 rounded-xl text-base font-semibold bg-white/5 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: 임원진 활성화 ── */}
        {step === 5 && (
          <div className="fade-in-up space-y-7">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-100 tracking-tight mb-1.5">AI 임원진 활성화 및 프로젝트 담당 지정</h2>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed">체크한 HiveDesk 소속 상주 임원진들이 가상 보드룸 회의와 기획 오케스트레이션을 주도합니다.</p>
            </div>

            <div className="glass rounded-2xl p-4 space-y-1.5 border border-white/10 shadow-inner">
              {EXECUTIVES.map(exec => {
                const on = activeExecs.includes(exec.id)
                const isDefault = ['ceo', 'cto', 'cmo'].includes(exec.id)
                return (
                  <button
                    key={exec.id}
                    type="button"
                    onClick={() => toggleExec(exec.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
                      on 
                        ? 'bg-amber-500/15 border-2 border-amber-500/40 shadow-sm' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-2xl w-8 text-center">{exec.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-neutral-100">{exec.title}</span>
                        {isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">기본</span>}
                        {exec.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold">{exec.badge}</span>}
                      </div>
                      <span className="text-xs text-neutral-300 font-semibold leading-tight">{exec.desc}</span>
                    </div>
                    <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${on ? 'border-amber-400 bg-amber-500/30' : 'border-white/30'}`}>
                      {on && <span className="text-amber-400 text-xs font-extrabold">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="glass rounded-xl p-4 border border-amber-500/25 bg-amber-950/10">
              <p className="text-xs text-neutral-200 leading-relaxed font-bold">
                🟢 <strong className="text-white">Gemma4 (무료)</strong> — 일일 브리핑·토론·라우팅<br/>
                🟡 <strong className="text-white">Sonnet 4.6</strong> — 전략 문서·보고서 (BYOK)<br/>
                🔴 <strong className="text-white">Opus 4.7</strong> — CTO 코딩·기술 (BYOK)
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-bold shadow-md">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 bg-[#060606]/98 border-t border-white/10 px-5 py-4 pb-safe-6 flex gap-3.5 max-w-lg mx-auto w-full">
        {step > 1 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="flex-1 py-3.5 rounded-xl text-sm font-extrabold glass text-neutral-200 hover:text-white transition-all active:scale-95 border border-white/10"
          >
            ← 이전
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => { if (canNext()) go(step + 1) }}
            disabled={!canNext()}
            className={`flex-[2] py-3.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
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
            disabled={loading || activeExecs.length === 0}
            className="flex-[2] py-3.5 rounded-xl text-sm font-extrabold bg-amber-400 text-black border-2 border-amber-300 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.2)] cta-pulse transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '🐝 임원진 소집 중...' : `🚀 ${name || '프로젝트'} 시작하기`}
          </button>
        )}
      </div>
    </main>
  )
}
