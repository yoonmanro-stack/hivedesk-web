'use client'

import { useState, useRef } from 'react'
import { SKILL_CATEGORIES, TIER1_CATEGORIES } from '@/lib/skillHire'

type HireStep = 'input' | 'searching' | 'pool' | 'create' | 'generating' | 'success' | 'error'

interface AgentCard {
  id: string; agent_name: string; agent_role: string; skill_slugs: string[]
  skill_tags: string[]; skill_count: number; primary_category: string
  sub_category?: string; avg_quality_score: number; quality_grade: 'A'|'B'|'C'|'D'
  agent_type: string; hired_count: number; recommended_exec: string | null
  employment_history?: { org_label: string; exec_title: string; hired_at: string; context: string }[]
}

interface HireModalProps {
  isOpen: boolean; onClose: () => void; onHired?: () => void
  defaultCategory?: string
  parentExec?: { id: string; title: string; titleKo: string; color: string } | null
  orgId?: string
}

const GRADE_COLOR: Record<string, string> = { A: '#34D399', B: '#60A5FA', C: '#FBBF24', D: '#F87171' }
const GRADE_BG: Record<string, string> = { A: 'rgba(52,211,153,0.12)', B: 'rgba(96,165,250,0.12)', C: 'rgba(251,191,36,0.12)', D: 'rgba(248,113,113,0.12)' }

function GradeBadge({ grade }: { grade: string }) {
  return <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: GRADE_COLOR[grade]||'#fff', background: GRADE_BG[grade]||'rgba(255,255,255,0.08)' }}>Grade {grade}</span>
}

export default function HireModal({ isOpen, onClose, onHired, defaultCategory, parentExec, orgId }: HireModalProps) {
  const execColor = parentExec?.color || '#F59E0B'

  const [step, setStep] = useState<HireStep>('input')
  const [role, setRole] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory || '')
  const [poolAgents, setPool] = useState<AgentCard[]>([])
  const [result, setResult] = useState<any>(null)
  const [errMsg, setErrMsg] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  // create form
  const [category, setCategory] = useState(defaultCategory || '')
  const [memberName, setMemberName] = useState('')
  const [requirements, setRequirements] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestReason, setSuggestReason] = useState('')

  if (!isOpen) return null

  const reset = () => {
    setStep('input'); setRole(''); setPool([]); setCategoryFilter(defaultCategory || '')
    setCategory(defaultCategory || ''); setMemberName(''); setRequirements('')
    setResult(null); setErrMsg(''); setStatusMsg(''); setSuggestReason('')
  }
  const handleClose = () => { if (step === 'generating') return; reset(); onClose() }

  // ── 인재풀 검색 (명시적 버튼) ──
  const handleSearch = async () => {
    if (!role.trim()) return
    setStep('searching')
    try {
      const exec = parentExec?.id || ''
      const catParam = categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : ''
      const res = await fetch(`/api/agents/search?role=${encodeURIComponent(role)}&exec=${exec}&limit=5${catParam}`)
      const data = await res.json()
      setPool(data.agents || [])
    } catch { setPool([]) }
    setStep('pool')
  }

  // ── 인재풀에서 즉시 채용 ──
  const hireFromPool = async (agent: AgentCard) => {
    setStep('generating'); setStatusMsg(`${agent.agent_name} 채용 처리 중...`)
    try {
      const res = await fetch('/api/agents/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id, agent_name: agent.agent_name, agent_role: agent.agent_role,
          skill_slugs: agent.skill_slugs, skill_count: agent.skill_count,
          primary_category: agent.primary_category, avg_quality_score: agent.avg_quality_score,
          quality_grade: agent.quality_grade, agent_type: agent.agent_type,
          assigned_exec: parentExec?.id || 'cto', org_id: orgId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setResult({ success: true, skillName: agent.agent_name, qualityScore: agent.avg_quality_score, category: agent.primary_category })
      setStep('success'); onHired?.()
    } catch (e: any) { setErrMsg(e.message); setStep('error') }
  }

  // ── AI 카테고리 추천 ──
  const handleSuggest = async () => {
    if (!role.trim()) return
    setSuggesting(true); setSuggestReason('')
    try {
      const res = await fetch('/api/hire/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
      const data = await res.json()
      if (data.category) { setCategory(data.category); setSuggestReason(data.reason || '') }
    } catch {} finally { setSuggesting(false) }
  }

  // ── 맞춤 인재 생성 ──
  const handleGenerate = async () => {
    if (!category || !role.trim()) return
    setStep('generating')
    const msgs = ['스킬 분석 중... 🔍', '에이전트 번들 구성 중... 🧩', '품질 검증 중... ✅', '온보딩 처리 중... 🚀']
    let mi = 0; setStatusMsg(msgs[0])
    const iv = setInterval(() => { if (mi < msgs.length - 1) setStatusMsg(msgs[++mi]) }, 6000)
    try {
      const res = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, category, requirements, assigned_exec: parentExec?.id || 'cto', org_id: orgId, member_name: memberName || undefined }),
      })
      clearInterval(iv)
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setResult({ success: true, skillName: data.agent_name, qualityScore: 0, category })
      setStep('success'); onHired?.()
    } catch (e: any) { clearInterval(iv); setErrMsg(e.message); setStep('error') }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={handleClose} />
      <div className="relative w-full max-w-lg flex flex-col shadow-2xl"
        style={{ background: '#1a1a1a', borderBottom: `2px solid ${execColor}40`, height: '100dvh', maxHeight: '100dvh' }}>

        {/* 고정 헤더 */}
        <div className="shrink-0 px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#F5F0E8' }}>✕</button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="text-lg font-black" style={{ color: execColor }}>인재 채용</h2>
            {parentExec && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ color: execColor, background: `${execColor}18`, border: `1px solid ${execColor}25` }}>{parentExec.title} 산하</span>}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(245,240,232,0.55)' }}>최고의 에이전트를 팀에 합류시킵니다</p>
        </div>

        {/* 스크롤 바디 */}
        <div className="flex-1 min-h-0 px-5 py-4" style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>

          {/* ── Step: input ── */}
          {step === 'input' && (
            <div>
              <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-2">어떤 전문가가 필요하신가요?</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${role.length > 1 ? execColor+'50' : 'rgba(255,255,255,0.12)'}` }}
                placeholder="예: React 개발자, SNS 마케터, 법률 전문가..."
                value={role}
                onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && role.trim().length > 1 && handleSearch()}
                autoFocus
              />

              {/* 카테고리 필터 칩 — 34개 전체 가로 스크롤 */}
              <div className="mb-4">
                <p className="text-[10px] text-[#F5F0E8]/40 mb-2">카테고리 필터 (선택)</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all"
                      style={{
                        background: categoryFilter === cat ? `${execColor}25` : 'rgba(255,255,255,0.06)',
                        color: categoryFilter === cat ? execColor : 'rgba(245,240,232,0.55)',
                        border: `1px solid ${categoryFilter === cat ? execColor+'40' : 'rgba(255,255,255,0.10)'}`,
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={role.trim().length < 2}
                className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${execColor}CC, ${execColor}88)`, color: '#0D0D0D' }}>
                🔍 맞춤인재 찾기
              </button>
              <p className="text-center text-[10px] text-[#F5F0E8]/30 mt-2">2글자 이상 입력 후 검색</p>
            </div>
          )}

          {/* ── Step: searching ── */}
          {step === 'searching' && (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${execColor}40`, borderTopColor: execColor }} />
                <span className="absolute inset-0 flex items-center justify-center text-xl">🔍</span>
              </div>
              <p className="text-sm font-bold text-[#F5F0E8]/80">인재풀 검색 중...</p>
              <p className="text-[11px] text-[#F5F0E8]/40 mt-1">"{role}"</p>
            </div>
          )}

          {/* ── Step: pool (결과) ── */}
          {step === 'pool' && (
            <div>
              <button onClick={() => setStep('input')} className="flex items-center gap-1 text-[11px] text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 mb-4 transition-colors">← 다시 검색</button>

              {poolAgents.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black text-[#F5F0E8]/85">🏆 인재풀 매칭</span>
                    <span className="text-[10px] text-[#F5F0E8]/50">{poolAgents.length}명 발견</span>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#34D399', background: 'rgba(52,211,153,0.10)' }}>즉시 채용 가능</span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {poolAgents.map(agent => (
                      <div key={agent.id} className="panel-card p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-black text-[#F5F0E8]">{agent.agent_name}</p>
                              <GradeBadge grade={agent.quality_grade} />
                            </div>
                            <p className="text-[11px] text-[#F5F0E8]/65">{agent.agent_role}</p>
                            {agent.sub_category && <p className="text-[10px] text-[#F5F0E8]/40">{agent.primary_category} › {agent.sub_category}</p>}
                          </div>
                          <button onClick={() => hireFromPool(agent)}
                            className="shrink-0 text-xs font-black px-3 py-1.5 rounded-xl transition-all hover:brightness-125 active:scale-95"
                            style={{ backgroundColor: `${execColor}20`, color: execColor, border: `1px solid ${execColor}35` }}>
                            바로 채용
                          </button>
                        </div>

                        {/* 스킬 태그 */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(agent.skill_tags?.length ? agent.skill_tags : agent.skill_slugs).slice(0, 5).map((tag: string) => (
                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full"
                              style={{ color: 'rgba(245,240,232,0.55)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>
                              {tag.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>

                        {/* 채용 이력 뱃지 */}
                        {agent.hired_count > 0 && (
                          <div className="flex items-center gap-2 text-[10px] text-[#F5F0E8]/45">
                            <span>⭐ {agent.avg_quality_score}점</span>
                            <span className="font-semibold" style={{ color: '#34D399' }}>✓ {agent.hired_count}개 기업이 채용</span>
                            {agent.employment_history && agent.employment_history.length > 0 && (
                              <span className="text-[#F5F0E8]/30">· {agent.employment_history[agent.employment_history.length-1].org_label} 외</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 원하는 인재 없을 때 생성 옵션 */}
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-[11px] text-[#F5F0E8]/40 text-center mb-2">원하는 인재가 없다면?</p>
                    <button onClick={() => { setCategory(defaultCategory || ''); setStep('create') }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold border border-dashed transition-all hover:brightness-110"
                      style={{ color: `${execColor}90`, borderColor: `${execColor}35` }}>
                      🎯 맞춤 인재 직접 생성하기
                    </button>
                  </div>
                </div>
              ) : (
                /* 결과 없음 */
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-sm font-bold text-[#F5F0E8]/80 mb-1">인재풀에 딱 맞는 에이전트가 없어요</p>
                  <p className="text-[11px] text-[#F5F0E8]/40 mb-6">"{role}" 검색 결과 없음</p>
                  <button onClick={() => { setCategory(defaultCategory || ''); setStep('create') }}
                    className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: `linear-gradient(135deg, ${execColor}CC, ${execColor}88)`, color: '#0D0D0D' }}>
                    🎯 맞춤 인재 직접 생성하기
                  </button>
                  <p className="text-[10px] text-[#F5F0E8]/30 mt-2">생성 후 인재풀에 자동 등록됩니다</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step: create ── */}
          {step === 'create' && (
            <div>
              <button onClick={() => setStep(poolAgents.length > 0 ? 'pool' : 'input')}
                className="flex items-center gap-1 text-[11px] text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 mb-4 transition-colors">
                ← 인재풀로 돌아가기
              </button>

              <div className="panel-card p-3 mb-4 flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <div><p className="text-[10px] text-[#F5F0E8]/50">요청 역할</p><p className="text-sm font-bold text-[#F5F0E8]">{role}</p></div>
                <button onClick={() => setStep('input')} className="ml-auto text-[10px] text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70">수정</button>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-1.5">팀원 이름 <span className="text-[#F5F0E8]/40 font-normal">(선택)</span></label>
                <input className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  placeholder="예: Alex, Luna, 김지수..." value={memberName} onChange={e => setMemberName(e.target.value)} />
              </div>

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
                <select className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] outline-none appearance-none"
                  style={{ background: 'rgba(30,30,30,0.95)', border: `1px solid ${category ? execColor+'40' : 'rgba(255,255,255,0.12)'}` }}
                  value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">카테고리 선택...</option>
                  {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="mb-5">
                <label className="text-xs font-bold text-[#F5F0E8]/80 block mb-1.5">추가 요청사항 <span className="text-[#F5F0E8]/40 font-normal">(선택)</span></label>
                <textarea className="w-full px-4 py-2.5 rounded-xl text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  rows={3} placeholder="원하는 특화 스킬이나 경험을 적어주세요..."
                  value={requirements} onChange={e => setRequirements(e.target.value)} />
              </div>

              <button onClick={handleGenerate} disabled={!category || !role.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${execColor}CC, ${execColor}88)`, color: '#0D0D0D' }}>
                🏭 인재 생성 시작
              </button>
              <p className="text-center text-[10px] text-[#F5F0E8]/35 mt-2">생성 후 자동으로 인재풀에 등록됩니다</p>
            </div>
          )}

          {/* ── Step: generating ── */}
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

          {/* ── Step: success ── */}
          {step === 'success' && result && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4" style={{ background: `${execColor}18`, border: `2px solid ${execColor}35` }}>🎉</div>
              <h3 className="text-lg font-black mb-1" style={{ color: execColor }}>채용 완료!</h3>
              <p className="text-sm font-bold text-[#F5F0E8]/90 mb-1">{result.skillName || '에이전트'}</p>
              <p className="text-[11px] text-[#F5F0E8]/55 mb-2">{parentExec?.title} 팀에 합류했습니다 🚀</p>
              <p className="text-[10px] text-[#F5F0E8]/35 mb-5">인재풀에도 자동 등록됐습니다</p>
              <button onClick={() => { reset(); onClose() }}
                className="w-full py-3 rounded-xl text-sm font-black transition-all hover:brightness-110"
                style={{ background: `${execColor}20`, color: execColor, border: `1px solid ${execColor}30` }}>
                확인
              </button>
            </div>
          )}

          {/* ── Step: error ── */}
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

        </div>
      </div>
    </div>
  )
}
