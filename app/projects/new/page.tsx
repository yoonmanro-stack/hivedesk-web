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
  { id: 'ceo', title: 'CEO', icon: '👑', desc: '전략 조율' },
  { id: 'cto', title: 'CTO', icon: '💻', desc: '개발·기술', badge: 'Opus 4.7' },
  { id: 'cmo', title: 'CMO', icon: '📢', desc: '마케팅·성장' },
  { id: 'cfo', title: 'CFO', icon: '💰', desc: '재무 분석' },
  { id: 'cpo', title: 'CPO', icon: '📦', desc: '기획·로드맵' },
  { id: 'cdo', title: 'CDO', icon: '🎨', desc: '디자인·브랜드' },
  { id: 'coo', title: 'COO', icon: '⚙️', desc: '운영 관리' },
  { id: 'chro', title: 'CHRO', icon: '👥', desc: '채용·조직' },
  { id: 'clo', title: 'CLO', icon: '⚖️', desc: '법무·약관' },
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

  const canNext = () => {
    if (step === 1) return name.trim().length > 0 && description.trim().length > 0
    if (step === 2) return stage.length > 0
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
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '프로젝트 생성 실패')
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen hero-bg honeycomb-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-500/10 bg-[#0D0D0D]/80 sticky top-0 z-50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm text-amber-400 hover:brightness-125 transition-all">←</button>
        <span className="text-xl bee-float">🐝</span>
        <div>
          <h1 className="text-sm font-bold text-shimmer">새 프로젝트</h1>
          <p className="text-[9px] text-[#F5F0E8]/50">Step {step} / {TOTAL_STEPS}</p>
        </div>
        <div className="ml-auto flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 bg-amber-400 step-pulse' : i + 1 < step ? 'w-3 bg-amber-500/60' : 'w-3 bg-white/15'}`} />
          ))}
        </div>
      </header>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">

        {/* ── STEP 1: 기본 정보 ── */}
        {step === 1 && (
          <div className="fade-in-up space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">어떤 프로젝트인가요?</h2>
              <p className="text-[12px] text-[#F5F0E8]/55">임원들이 처음 읽을 프로젝트 소개입니다</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="hd-text-label block mb-2">프로젝트 이름 *</label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="예: SkillsMuse, Melodio, HiveDesk"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="hd-text-label block mb-2">한줄 설명 * <span className="text-[#F5F0E8]/35 font-normal">({description.length}/100)</span></label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="예: AI 에이전트 스킬 생성 팩토리 + 마켓플레이스"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all resize-none"
                  rows={2}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="hd-text-label block mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(prev => prev === c ? '' : c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? 'bg-amber-500/25 text-amber-400 border border-amber-500/40' : 'bg-white/6 text-[#F5F0E8]/60 border border-white/10 hover:border-white/20'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 단계 & 목표 ── */}
        {step === 2 && (
          <div className="fade-in-up space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">지금 어디까지 왔나요?</h2>
              <p className="text-[12px] text-[#F5F0E8]/55">임원들이 현재 상황을 파악합니다</p>
            </div>

            <div>
              <label className="hd-text-label block mb-3">현재 단계 *</label>
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all ${stage === s.id ? 'border-amber-500/50 bg-amber-500/12 text-amber-400' : 'border-white/10 bg-white/4 text-[#F5F0E8]/55 hover:border-white/20'}`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[9px] font-semibold leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="hd-text-label block mb-2">6개월 후 목표</label>
              <textarea
                id="project-goals"
                value={goals}
                onChange={e => setGoals(e.target.value)}
                placeholder="예: 유료 구독자 100명, 스킬 1,000개 생성"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: 타겟 & 수익 ── */}
        {step === 3 && (
          <div className="fade-in-up space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">누구를 위한 서비스인가요?</h2>
              <p className="text-[12px] text-[#F5F0E8]/55">CMO·CFO가 전략 수립에 활용합니다</p>
            </div>

            <div>
              <label className="hd-text-label block mb-2">타겟 사용자</label>
              <textarea
                id="target-audience"
                value={userTarget}
                onChange={e => setUserTarget(e.target.value)}
                placeholder="예: AI 자동화에 관심 있는 비개발자 1인 창업자, n8n을 배우고 싶은 마케터"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="hd-text-label block mb-3">수익 모델</label>
              <div className="flex flex-wrap gap-2">
                {REVENUE_MODELS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRevenueModel(prev => prev === r ? '' : r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${revenueModel === r ? 'bg-amber-500/25 text-amber-400 border border-amber-500/40' : 'bg-white/6 text-[#F5F0E8]/60 border border-white/10 hover:border-white/20'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {revenueModel === '구독제' && (
              <div>
                <label className="hd-text-label block mb-2">가격대 (선택)</label>
                <input
                  type="text"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="예: 기본 ₩9,900/월 · 프로 ₩29,900/월"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: 기술 & 링크 ── */}
        {step === 4 && (
          <div className="fade-in-up space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">기술 & 링크</h2>
              <p className="text-[12px] text-[#F5F0E8]/55">CTO·CPO가 참고합니다. 모두 선택 사항이에요</p>
            </div>

            <div>
              <label className="hd-text-label block mb-2">기술 스택</label>
              <input
                type="text"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                placeholder="예: Next.js · Supabase · n8n · Vercel · Claude API"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div>
              <label className="hd-text-label block mb-2">웹사이트</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div>
              <label className="hd-text-label block mb-2">GitHub</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div>
              <label className="hd-text-label block mb-2">지금 가장 큰 과제 또는 블로커</label>
              <textarea
                value={challenges}
                onChange={e => setChallenges(e.target.value)}
                placeholder="예: API 파이프라인 에러 반복, 마케팅 채널 전략 아직 없음"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/6 border border-white/12 text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ── STEP 5: 임원진 활성화 ── */}
        {step === 5 && (
          <div className="fade-in-up space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">AI 임원진 활성화</h2>
              <p className="text-[12px] text-[#F5F0E8]/55">선택한 임원이 이 프로젝트를 담당합니다</p>
            </div>

            <div className="glass rounded-2xl p-4 space-y-1">
              {EXECUTIVES.map(exec => {
                const on = activeExecs.includes(exec.id)
                const isDefault = ['ceo', 'cto', 'cmo'].includes(exec.id)
                return (
                  <button
                    key={exec.id}
                    onClick={() => toggleExec(exec.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${on ? 'bg-amber-500/12 border border-amber-500/25' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <span className="text-xl w-8 text-center">{exec.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F5F0E8]/90">{exec.title}</span>
                        {isDefault && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">기본</span>}
                        {exec.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">{exec.badge}</span>}
                      </div>
                      <span className="text-[11px] text-[#F5F0E8]/45">{exec.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${on ? 'border-amber-400 bg-amber-500/20' : 'border-white/20'}`}>
                      {on && <span className="text-amber-400 text-[10px] font-bold">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="glass rounded-xl p-3 border-amber-500/20">
              <p className="text-[11px] text-[#F5F0E8]/55 leading-relaxed">
                🟢 <strong className="text-[#F5F0E8]/75">Gemma4 (무료)</strong> — 일일 브리핑·토론·라우팅<br/>
                🟡 <strong className="text-[#F5F0E8]/75">Sonnet 4.6</strong> — 전략 문서·보고서 (BYOAK)<br/>
                🔴 <strong className="text-[#F5F0E8]/75">Opus 4.7</strong> — CTO 코딩·기술 (BYOAK)
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/12 border border-red-500/25 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 bg-[#0D0D0D]/95 border-t border-white/8 px-4 py-4 pb-safe-6 flex gap-3 max-w-lg mx-auto w-full">
        {step > 1 && (
          <button
            onClick={() => go(step - 1)}
            className="flex-1 py-3 rounded-xl text-sm font-bold glass text-[#F5F0E8]/70 hover:text-[#F5F0E8]/90 transition-all active:scale-95"
          >
            ← 이전
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => { if (canNext()) go(step + 1) }}
            disabled={!canNext()}
            className={`flex-[2] py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${canNext() ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35 hover:brightness-110 cta-pulse' : 'bg-white/5 text-[#F5F0E8]/25 border border-white/8 cursor-not-allowed'}`}
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || activeExecs.length === 0}
            className="flex-[2] py-3 rounded-xl text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35 hover:brightness-110 cta-pulse transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '🐝 임원진 소집 중...' : `🚀 ${name || '프로젝트'} 시작하기`}
          </button>
        )}
      </div>
    </main>
  )
}
