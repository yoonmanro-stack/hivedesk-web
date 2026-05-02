'use client'

import { useState } from 'react'
import { hireTeamMember, SKILL_CATEGORIES, type SkillCategory, type Difficulty, type HireResult } from '@/lib/skillHire'

// ── 채용 단계 ───────────────────────────────────────────────
type HireStep = 'form' | 'searching' | 'generating' | 'success' | 'error'

interface HireModalProps {
  isOpen: boolean
  onClose: () => void
  onHired?: () => void
  defaultCategory?: SkillCategory
  parentExec?: { id: string; title: string; titleKo: string; color: string } | null
  orgId?: string
}

export default function HireModal({ isOpen, onClose, onHired, defaultCategory, parentExec, orgId }: HireModalProps) {
  const [step, setStep] = useState<HireStep>('form')
  const [category, setCategory] = useState<string>(defaultCategory || '')
  const [role, setRole] = useState('')
  const [memberName, setMemberName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [result, setResult] = useState<HireResult | null>(null)
  // AI 카테고리 추천
  const [suggesting, setSuggesting] = useState(false)
  const [suggestReason, setSuggestReason] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    // 로딩 중에는 닫기 방지
    if (step === 'searching' || step === 'generating') return
    setStep('form')
    setRole('')
    setMemberName('')
    setRequirements('')
    setResult(null)
    onClose()
  }

  const handleSuggest = async () => {
    if (!role.trim()) return
    setSuggesting(true)
    setSuggestReason('')
    try {
      const res = await fetch('/api/hire/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.trim(), requirements: requirements.trim() }),
      })
      const data = await res.json()
      if (data.category) {
        setCategory(data.category)
        setSuggestReason(`✅ ${data.reason}`)
      } else {
        setSuggestReason(`⚠️ ${data.reason || '추천 실패'}`)
      }
    } catch {
      setSuggestReason('⚠️ 네트워크 오류')
    }
    setSuggesting(false)
  }

  const handleHire = async () => {
    if (!role.trim()) return

    setStep('searching')
    setStatusMsg('기존 AI 팀원을 검색 중...')

    const res = await hireTeamMember(
      { category: category as SkillCategory, role: role.trim(), requirements: requirements.trim() || undefined, difficulty: 'advanced' as Difficulty, orgId: orgId || 'default', hiredBy: parentExec?.id || 'cto', assignedExec: parentExec?.id || 'cto', memberName: memberName.trim() || undefined },
      {
        onSearching: (msg) => { setStep('searching'); setStatusMsg(msg) },
        onGenerating: (msg) => { setStep('generating'); setStatusMsg(msg) },
        onSuccess: (data) => { setResult(data); setStep('success'); onHired?.() },
        onError: (data) => { setResult(data); setStep('error') },
      }
    )

    if (!res.success && step !== 'error') {
      setResult(res)
      setStep('error')
    }
  }



  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
        <div
          className={`w-full sm:max-w-md bg-[#0F0F0F] sm:rounded-2xl rounded-t-3xl border overflow-hidden shadow-[0_0_60px_${parentExec ? parentExec.color : 'rgba(6,182,212,0.15)'}]`}
          style={{ borderColor: parentExec ? `${parentExec.color}30` : 'rgba(6,182,212,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔍</span>
              <div>
                <h2 className="font-bold text-base text-[#F5F0E8] flex items-center gap-1.5">
                  {parentExec ? (
                    <>
                      <span style={{ color: parentExec.color }}>{parentExec.title}</span>
                      <span className="text-[#F5F0E8]/30">→</span>
                      <span>팀원 채용</span>
                    </>
                  ) : (
                    '팀원 채용'
                  )}
                </h2>
                <p className="text-xs text-[#F5F0E8]/50">
                  {parentExec ? `${parentExec.titleKo} 산하 배속 · CHRO via SkillsMuse` : 'CHRO via SkillsMuse'}
                </p>
              </div>
            </div>
            {step !== 'searching' && step !== 'generating' && (
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#F5F0E8]/50 hover:text-[#F5F0E8] hover:bg-white/20 transition-all text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="px-5 py-4 max-h-[75dvh] overflow-y-auto">

            {/* ── FORM ── */}
            {step === 'form' && (
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                    직군 카테고리
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SkillCategory)}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none pr-10 ${category ? 'text-[#F5F0E8]' : 'text-[#F5F0E8]/40'}`}
                    >
                      <option value="" disabled className="bg-[#1a1a1a]">-- 카테고리를 선택하세요 --</option>
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/40 pointer-events-none text-sm">▼</span>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      역할 / 포지션 <span className="text-red-400">*</span>
                    </label>
                    <button
                      onClick={() => {
                        if (!role.trim()) {
                          setSuggestReason('⚠️ 먼저 역할/포지션을 입력해주세요')
                          return
                        }
                        handleSuggest()
                      }}
                      disabled={suggesting}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md transition-all hover:brightness-125 disabled:opacity-50"
                      style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}
                    >
                      {suggesting ? (
                        <><span className="animate-spin">⚡</span> 분석중</>
                      ) : (
                        <>🤖 AI 카테고리 추천</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setSuggestReason('') }}
                    placeholder="예: Kubernetes Expert, 보안 전문가, SNS 마케터..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  {suggestReason && (
                    <p className="mt-1.5 text-[10px] text-violet-300/70">{suggestReason}</p>
                  )}
                </div>

                {/* Member Name */}
                <div>
                  <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                    팀원 이름 <span className="text-[#F5F0E8]/30">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="예: Alex, Luna... (미입력 시 자동 생성)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F0E8]/50 mb-2 uppercase tracking-wider">
                    추가 요청사항 <span className="text-[#F5F0E8]/30">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="예: SNS 마케팅 경험, 한국 시장 전문, React..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>



                {/* Notice */}
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 flex gap-2.5">
                  <span className="text-base shrink-0">⏱️</span>
                  <p className="text-xs text-[#F5F0E8]/50 leading-relaxed">
                    기존 인재풀 우선 검색 후, 없으면 AI가 신규 팀원을 생성합니다. <strong className="text-amber-400/70">최대 45초</strong> 소요될 수 있습니다.
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={handleHire}
                  disabled={!category || !role.trim()}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: (category && role.trim()) ? 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))' : undefined,
                    backgroundColor: (!category || !role.trim()) ? 'rgba(255,255,255,0.05)' : undefined,
                    color: (category && role.trim()) ? '#06B6D4' : 'rgba(245,240,232,0.3)',
                    border: `1px solid ${(category && role.trim()) ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  🔍 채용 시작
                </button>
              </div>
            )}

            {/* ── LOADING (Searching / Generating) ── */}
            {(step === 'searching' || step === 'generating') && (
              <div className="py-8 flex flex-col items-center text-center gap-4">
                {/* Animated spinner */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">
                    {step === 'searching' ? '🔍' : '⚡'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-cyan-400 mb-1">
                    {step === 'searching' ? 'SkillsMuse 인재풀 검색 중...' : 'AI 팀원 생성 중...'}
                  </p>
                  <p className="text-[10px] text-[#F5F0E8]/40">{statusMsg}</p>
                </div>
                {step === 'generating' && (
                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 animate-pulse rounded-full" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === 'success' && result && (
              <div className="py-4 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                  ✅
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-400 mb-1">채용 완료!</p>
                  <p className="text-xs text-[#F5F0E8]/60">{result.message}</p>
                </div>

                {/* Skill Card */}
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F0E8]">{result.skillName || role}</span>
                    {result.isExisting && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        기존 인재
                      </span>
                    )}
                    {!result.isExisting && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                        신규 생성
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#F5F0E8]/50">{result.category}</p>
                  {result.qualityScore && result.qualityScore > 0 && (
                    <>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                          style={{ width: `${result.qualityScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">{result.qualityScore}점</span>
                    </div>
                    {result.qualityGrade && (
                      <span style={{
                        display: "inline-block",
                        fontSize: "9px",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontWeight: "bold",
                        border: "1px solid",
                        color: result.qualityGrade === "A" ? "#fbbf24" : result.qualityGrade === "B" ? "#34d399" : result.qualityGrade === "C" ? "#22d3ee" : "rgba(255,255,255,0.4)",
                        borderColor: result.qualityGrade === "A" ? "rgba(251,191,36,0.3)" : result.qualityGrade === "B" ? "rgba(52,211,153,0.3)" : result.qualityGrade === "C" ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.2)",
                        background: result.qualityGrade === "A" ? "rgba(251,191,36,0.1)" : result.qualityGrade === "B" ? "rgba(52,211,153,0.1)" : result.qualityGrade === "C" ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.05)"
                      }}>
                        Grade {result.qualityGrade}
                      </span>
                    )}
                    </>
                  )}
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:brightness-110 transition-all"
                >
                  닫기
                </button>
              </div>
            )}

            {/* ── ERROR ── */}
            {step === 'error' && result && (
              <div className="py-4 flex flex-col items-center text-center gap-4">
                {/* 업그레이드 유도 (Free 유저) */}
                {result.limitInfo?.reason === 'upgrade_required' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                      🔒
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-400 mb-1">Pro 요금제 필요</p>
                      <p className="text-xs text-[#F5F0E8]/50">팀원 채용은 Pro 이상 요금제에서 이용 가능합니다.</p>
                    </div>
                    <div className="w-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-2xl p-4 text-left space-y-2">
                      <p className="text-xs font-bold text-cyan-400">🚀 Pro 요금제</p>
                      <p className="text-xs text-[#F5F0E8]/50">임원당 5명의 전문 AI 팀원 배속</p>
                      <p className="text-xs font-bold text-[#F5F0E8]/40 mt-2">💎 Premium 요금제</p>
                      <p className="text-xs text-[#F5F0E8]/50">무제한 팀원 채용</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:brightness-110 transition-all"
                    >
                      닫기
                    </button>
                  </>
                ) : result.limitInfo?.reason === 'limit_reached' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                      📊
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-400 mb-1">채용 한도 도달</p>
                      <p className="text-xs text-[#F5F0E8]/50">{result.message}</p>
                    </div>
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#F5F0E8]/50">현재 인원</span>
                        <span className="text-xs font-bold text-amber-400">{result.limitInfo.current}/{result.limitInfo.limit}명</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:brightness-110 transition-all"
                    >
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
                      ❌
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400 mb-1">채용 실패</p>
                      <p className="text-xs text-[#F5F0E8]/50">{result.message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => setStep('form')}
                        className="py-2.5 rounded-xl text-sm font-bold bg-white/5 text-[#F5F0E8]/60 border border-white/10 hover:brightness-110 transition-all"
                      >
                        다시 시도
                      </button>
                      <button
                        onClick={handleClose}
                        className="py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:brightness-110 transition-all"
                      >
                        닫기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
