'use client'

import { useState, useEffect, useRef } from 'react'
import { hireTeamMember, SKILL_CATEGORIES, type SkillCategory, type HireResult } from '@/lib/skillHire'

// ── 타입 ──────────────────────────────────────────────────────
type HireStep = 'input' | 'pool' | 'create' | 'generating' | 'success' | 'error'

interface AgentCard {
  id: string
  agent_name: string
  agent_role: string
  skill_slugs: string[]
  skill_count: number
  primary_category: string
  avg_quality_score: number
  quality_grade: 'A' | 'B' | 'C' | 'D'
  agent_type: 'type_a' | 'type_b' | 'type_c'
  hired_count: number
  recommended_exec: string | null
}

interface HireModalProps {
  isOpen: boolean
  onClose: () => void
  onHired?: () => void
  defaultCategory?: SkillCategory
  parentExec?: { id: string; title: string; titleKo: string; color: string } | null
  orgId?: string
}

// ── 유틸 ──────────────────────────────────────────────────────
const GRADE_COLOR: Record<string, string> = { A: '#34D399', B: '#60A5FA', C: '#FBBF24', D: '#F87171' }
const GRADE_BG: Record<string, string>    = { A: 'rgba(52,211,153,0.12)', B: 'rgba(96,165,250,0.12)', C: 'rgba(251,191,36,0.12)', D: 'rgba(248,113,113,0.12)' }

const TYPE_LABEL: Record<string, string> = {
  type_a: '🏭 팩토리',
  type_b: '✨ 큐레이션',
  type_c: '🎨 커스텀',
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ color: GRADE_COLOR[grade] || '#fff', background: GRADE_BG[grade] || 'rgba(255,255,255,0.08)' }}>
      Grade {grade}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
export default function HireModal({ isOpen, onClose, onHired, defaultCategory, parentExec, orgId }: HireModalProps) {
  const execColor = parentExec?.color || '#F59E0B'

  // ── 공통 상태 ──────────────────────────────────────────────
  const [step, setStep]       = useState<HireStep>('input')
  const [role, setRole]       = useState('')
  const [poolAgents, setPool] = useState<AgentCard[]>([])
  const [searching, setSearching] = useState(false)
  const [result, setResult]   = useState<HireResult | null>(null)
  const [errMsg, setErrMsg]   = useState('')

  // ── Method 2 (생성) 상태 ───────────────────────────────────
  const [category, setCategory]     = useState<string>(defaultCategory || '')
  const [memberName, setMemberName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestReason, setSuggestReason] = useState('')
  const [statusMsg, setStatusMsg]   = useState('')

  // ── 디바운스 풀 검색 ────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (role.trim().length < 2) { setPool([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const exec = parentExec?.id || ''
        const res  = await fetch(`/api/agents/search?role=${encodeURIComponent(role)}&exec=${exec}&limit=3`)
        const data = await res.json()
        setPool(data.agents || [])
      } catch { setPool([]) }
      finally { setSearching(false) }
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [role, isOpen, parentExec?.id])

  if (!isOpen) return null

  const reset = () => {
    setStep('input'); setRole(''); setPool([]); setCategory(defaultCategory || '')
    setMemberName(''); setRequirements(''); setResult(null); setErrMsg(''); setStatusMsg(''); setSuggestReason('')
  }
  const handleClose = () => {
    if (step === 'generating') return
    reset(); onClose()
  }

  // ── Method 1: 풀에서 1클릭 채용 ────────────────────────────
  const hireFromPool = async (agent: AgentCard) => {
    setStep('generating')
    setStatusMsg(`${agent.agent_name} 채용 처리 중...`)
    try {
      const res = await fetch('/api/agents/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          agent_name: agent.agent_name,
          agent_role: agent.agent_role,
          skill_slugs: agent.skill_slugs,
          skill_count: agent.skill_count,
          primary_category: agent.primary_category,
          avg_quality_score: agent.avg_quality_score,
          quality_grade: agent.quality_grade,
          agent_type: agent.agent_type,
          assigned_exec: parentExec?.id || 'cto',
          org_id: orgId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setResult({ success: true, message: data.message, skillName: agent.agent_name, qualityScore: agent.avg_quality_score, category: agent.primary_category } as any)
      setStep('success')
      onHired?.()
    } catch (e: any) {
      setErrMsg(e.message); setStep('error')
    }
  }

  // ── AI 카테고리 추천 ────────────────────────────────────────
  const handleSuggest = async () => {
    if (!role.trim()) return
    setSuggesting(true); setSuggestReason('')
    try {
      const res  = await fetch('/api/hire/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
      const data = await res.json()
      if (data.category) { setCategory(data.category); setSuggestReason(data.reason || '') }
    } catch {}
    finally { setSuggesting(false) }
  }

  // ── Method 2: n8n 생성 채용 ─────────────────────────────────
  const handleGenerate = async () => {
    if (!category || !role.trim()) return
    setStep('generating')
    setStatusMsg('SkillsMuse 팩토리에 에이전트 생성 요청 중...')
    try {
      const messages = [
        '스킬 분석 중... 🔍',
        '에이전트 번들 구성 중... 🧩',
        '품질 검증 중 (70점+ 통과 필요)... ✅',
        '온보딩 처리 중... 🚀',
      ]
      let mi = 0
      const iv = setInterval(() => { if (mi < messages.length - 1) setStatusMsg(messages[++mi]) }, 6000)

      const res = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          category,
          requirements,
          assigned_exec: parentExec?.id || 'cto',
          org_id: orgId,
          member_name: memberName || undefined,
        }),
      })
      clearInterval(iv)
      const data = await res.json()

      if (!data.success) throw new Error(data.message)

      setResult({
        success: true,
        message: data.message,
        skillName: data.agent_name,
        qualityScore: 0,
        category,
      } as any)
      setStep('success')
      onHired?.()
    } catch (e: any) {
      setErrMsg(e.message); setStep('error')
    }
  }


  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={handleClose} />
      <div className="relative w-full max-w-lg flex flex-col rounded-t-3xl shadow-2xl"
        style={{
          background: '#1a1a1a',
          borderTop: `2px solid ${execColor}40`,
          height: '82vh',
          maxHeight: '82vh',
        }}>

        {/* ── 고정 헤더 (스크롤 안됨) ── */}
        <div className="shrink-0 px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors" style={{ background: 'rgba(255,255,255,0.12)', color: '#F5F0E8' }} aria-label="닫기">✕</button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="text-lg font-black" style={{ color: execColor }}>인재 채용</h2>
            {parentExec && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                style={{ color: execColor, background: `${execColor}18`, border: `1px solid ${execColor}25` }}>
                {parentExec.title} 산하
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(245,240,232,0.55)' }}>최고의 에이전트를 팀에 합류시킵니다</p>
        </div>

        {/* ── 스크롤 바디 ── */}
        <div className="flex-1 min-h-0 px-5 py-4" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>

        {/* ── Step: input / pool ──────────────────────────── */}
        {(step === 'input' || step === 'pool') && (
          <div>
            {/* 역할 입력 */}
            <div className="mb-4">
              <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-1.5">어떤 전문가가 필요하신가요?</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${role.length > 1 ? execColor + '50' : 'rgba(255,255,255,0.12)'}` }}
                  placeholder="예: React 개발자, SNS 마케터, 법률 전문가..."
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${execColor}60`, borderTopColor: 'transparent' }} />
                  </div>
                )}
              </div>
            </div>

            {/* 인재풀 결과 */}
            {poolAgents.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-black text-[#F5F0E8]/85">🏆 인재풀 매칭</span>
                  <span className="text-[10px] text-[#F5F0E8]/50">{poolAgents.length}명 발견</span>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: '#34D399', background: 'rgba(52,211,153,0.10)' }}>즉시 채용 가능</span>
                </div>
                <div className="space-y-2.5">
                  {poolAgents.map(agent => (
                    <div key={agent.id} className="panel-card p-4 transition-all hover:border-white/20">
                      {/* 에이전트 카드 헤더 */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-black text-[#F5F0E8]">{agent.agent_name}</p>
                            <GradeBadge grade={agent.quality_grade} />
                          </div>
                          <p className="text-[11px] text-[#F5F0E8]/70">{agent.agent_role}</p>
                        </div>
                        <button
                          onClick={() => hireFromPool(agent)}
                          className="shrink-0 text-xs font-black px-3 py-1.5 rounded-xl transition-all hover:brightness-125 active:scale-95"
                          style={{ backgroundColor: `${execColor}20`, color: execColor, border: `1px solid ${execColor}35` }}>
                          바로 채용
                        </button>
                      </div>
                      {/* 스킬 목록 */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {agent.skill_slugs.slice(0, 5).map(slug => (
                          <span key={slug} className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                            style={{ color: '#F5F0E8', opacity: 0.6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            {slug.replace(/-/g, ' ')}
                          </span>
                        ))}
                        {agent.skill_count > 5 && (
                          <span className="text-[9px] text-[#F5F0E8]/40">+{agent.skill_count - 5}개</span>
                        )}
                      </div>
                      {/* 풋터 */}
                      <div className="flex items-center gap-3 text-[10px] text-[#F5F0E8]/50">
                        <span>⭐ {agent.avg_quality_score}점</span>
                        <span>👥 {agent.hired_count}개 조직 채용</span>
                        <span>{TYPE_LABEL[agent.agent_type]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 풀 없을 때 + 항상 노출하는 "새 인재 생성" */}
            {role.length >= 2 && !searching && (
              <div className="mt-3">
                {poolAgents.length === 0 && (
                  <p className="text-center text-[11px] text-[#F5F0E8]/45 mb-3">
                    인재풀에 딱 맞는 에이전트가 없어요. 맞춤 생성해드릴게요 🏭
                  </p>
                )}
                <button
                  onClick={() => setStep('create')}
                  className="w-full py-3 rounded-xl text-sm font-bold border border-dashed transition-all hover:brightness-110 active:scale-95"
                  style={{ color: `${execColor}90`, borderColor: `${execColor}35` }}>
                  {poolAgents.length > 0 ? '+ 새 인재 직접 생성하기' : '🏭 맞춤 인재 생성하기'}
                </button>
              </div>
            )}

            {role.length < 2 && (
              <p className="text-center text-[11px] text-[#F5F0E8]/35 mt-4">
                역할을 2글자 이상 입력하면 인재풀에서 자동 검색합니다
              </p>
            )}
          </div>
        )}

        {/* ── Step: create (Method 2) ─────────────────────── */}
        {step === 'create' && (
          <div>
            <button onClick={() => setStep('input')} className="flex items-center gap-1 text-[11px] text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 mb-4 transition-colors">
              ← 인재풀로 돌아가기
            </button>

            {/* 요청 역할 (readonly 표시) */}
            <div className="panel-card p-3 mb-4 flex items-center gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-[10px] text-[#F5F0E8]/50">요청 역할</p>
                <p className="text-sm font-bold text-[#F5F0E8]">{role}</p>
              </div>
              <button onClick={() => setStep('input')} className="ml-auto text-[10px] text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70">수정</button>
            </div>

            {/* 이름 (선택) */}
            <div className="mb-3">
              <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-1.5">팀원 이름 <span className="text-[#F5F0E8]/40 font-normal">(선택)</span></label>
              <input
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="예: Alex, Luna, 김지수..."
                value={memberName}
                onChange={e => setMemberName(e.target.value)}
              />
            </div>

            {/* 카테고리 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F5F0E8]/80">스킬 카테고리</label>
                <button onClick={handleSuggest} disabled={suggesting || !role.trim()}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:brightness-110 disabled:opacity-40"
                  style={{ color: execColor, background: `${execColor}15`, border: `1px solid ${execColor}25` }}>
                  {suggesting ? '분석 중...' : '🤖 AI 추천'}
                </button>
              </div>
              {suggestReason && <p className="text-[10px] text-[#F5F0E8]/55 mb-1.5 px-1">💡 {suggestReason}</p>}
              <select
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] outline-none appearance-none"
                style={{ background: 'rgba(30,30,30,0.95)', border: `1px solid ${category ? execColor + '40' : 'rgba(255,255,255,0.12)'}` }}
                value={category}
                onChange={e => setCategory(e.target.value)}>
                <option value="">카테고리 선택...</option>
                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 추가 요청사항 */}
            <div className="mb-5">
              <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-1.5">추가 요청사항 <span className="text-[#F5F0E8]/40 font-normal">(선택)</span></label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                rows={3}
                placeholder="원하는 특화 스킬이나 경험을 적어주세요..."
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!category || !role.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${execColor}CC, ${execColor}88)`, color: '#0D0D0D' }}>
              🏭 인재 생성 시작
            </button>
            <p className="text-center text-[10px] text-[#F5F0E8]/40 mt-2">생성 후 자동으로 인재풀에 기여됩니다</p>
          </div>
        )}

        {/* ── Step: generating ────────────────────────────── */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${execColor}40`, borderTopColor: execColor }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🐝</span>
            </div>
            <p className="text-sm font-bold text-[#F5F0E8]/90 mb-2">{statusMsg || '처리 중...'}</p>
            <p className="text-[11px] text-[#F5F0E8]/45">잠시만 기다려 주세요</p>
          </div>
        )}

        {/* ── Step: success ───────────────────────────────── */}
        {step === 'success' && result && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4" style={{ background: `${execColor}18`, border: `2px solid ${execColor}35` }}>🎉</div>
            <h3 className="text-lg font-black mb-1" style={{ color: execColor }}>채용 완료!</h3>
            <p className="text-sm font-bold text-[#F5F0E8]/90 mb-1">{result.skillName || '에이전트'}</p>
            <p className="text-[11px] text-[#F5F0E8]/55 mb-4">{parentExec?.title} 팀에 합류했습니다 🚀</p>
            {result.qualityScore && result.qualityScore > 0 && (
              <div className="panel-card px-4 py-2 flex items-center gap-4 mb-5">
                <div><p className="text-xs font-black" style={{ color: result.qualityScore >= 80 ? '#34D399' : '#FBBF24' }}>{result.qualityScore}점</p><p className="text-[9px] text-[#F5F0E8]/50">품질</p></div>
                <div><p className="text-xs font-black text-[#F5F0E8]/80">{result.category}</p><p className="text-[9px] text-[#F5F0E8]/50">카테고리</p></div>
              </div>
            )}
            <button onClick={() => { reset(); onClose() }} className="w-full py-3 rounded-xl text-sm font-black transition-all hover:brightness-110"
              style={{ background: `${execColor}20`, color: execColor, border: `1px solid ${execColor}30` }}>
              확인
            </button>
          </div>
        )}

        {/* ── Step: error ─────────────────────────────────── */}
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 bg-red-500/10 border border-red-500/25">⚠️</div>
            <h3 className="text-base font-black text-red-400 mb-2">채용 실패</h3>
            <p className="text-[11px] text-[#F5F0E8]/60 mb-5">{errMsg || '알 수 없는 오류가 발생했습니다.'}</p>
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button onClick={() => setStep('create')} className="py-2.5 rounded-xl text-xs font-bold border border-white/15 text-[#F5F0E8]/70 hover:bg-white/5 transition-all">다시 시도</button>
              <button onClick={() => { reset(); onClose() }} className="py-2.5 rounded-xl text-xs font-bold border border-white/15 text-[#F5F0E8]/70 hover:bg-white/5 transition-all">닫기</button>
            </div>
          </div>
        )}
      </div>{/* 스크롤 바디 끝 */}
      </div>{/* 패널 끝 */}
    </div>
  )
}
