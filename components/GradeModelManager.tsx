'use client'
import { useState, useEffect } from 'react'

const MODELS = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', desc: '최고 성능 · 복잡한 추론', cost: '$$$$', color: '#F59E0B' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', desc: '균형형 · 코딩 특화', cost: '$$$', color: '#3B82F6' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', desc: '초고속 · 대량 처리', cost: '$', color: '#10B981' },
  { id: 'gemma-4', name: 'Gemma 4', desc: '로컬 · 무료', cost: '무료', color: '#A78BFA' },
]

const GRADES = [
  { grade: 'A', label: 'A급 인재', desc: '핵심 전략 · 고난도 업무', color: '#F59E0B', defaultModel: 'claude-opus-4.6' },
  { grade: 'B', label: 'B급 인재', desc: '실무 주력 · 일반 업무', color: '#3B82F6', defaultModel: 'claude-sonnet-4.6' },
  { grade: 'C', label: 'C급 인재', desc: '보조 업무 · 대량 처리', color: '#10B981', defaultModel: 'claude-haiku-4.5' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  orgId: string
}

export default function GradeModelManager({ isOpen, onClose, orgId }: Props) {
  const [settings, setSettings] = useState<Record<string, string>>({
    A: 'claude-opus-4.6',
    B: 'claude-sonnet-4.6',
    C: 'claude-haiku-4.5',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isOpen || !orgId) return
    fetch(`/api/grade-models?org_id=${orgId}`)
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [isOpen, orgId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/grade-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, settings }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const handleReset = () => {
    setSettings({
      A: 'claude-opus-4.6',
      B: 'claude-sonnet-4.6',
      C: 'claude-haiku-4.5',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M16.36 7.64l1.42-1.42"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5F0E8]">인재 등급별 AI 모델</h2>
                <p className="text-xs text-[#F5F0E8]/50">등급별 모델을 선택하여 비용을 최적화하세요</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-[#F5F0E8]/60 hover:text-[#F5F0E8]">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {GRADES.map(({ grade, label, desc, color }) => {
            const selectedModel = MODELS.find(m => m.id === settings[grade])
            return (
              <div key={grade}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>{grade}</span>
                  <span className="text-sm font-bold text-[#F5F0E8]">{label}</span>
                  <span className="text-xs text-[#F5F0E8]/40 ml-auto">{desc}</span>
                </div>
                <div className="relative">
                  <select
                    value={settings[grade]}
                    onChange={e => setSettings(prev => ({ ...prev, [grade]: e.target.value }))}
                    className="w-full appearance-none rounded-xl px-4 py-3 text-sm font-semibold text-[#F5F0E8] cursor-pointer focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${color}30`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23F5F0E8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {MODELS.map(m => (
                      <option key={m.id} value={m.id} style={{ background: '#1a1a1a' }}>
                        {m.name}  ·  {m.cost}  —  {m.desc}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedModel && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-[#F5F0E8]/35">비용:</span>
                    <span className="text-[10px] font-bold" style={{ color: selectedModel.color }}>{selectedModel.cost}</span>
                    <span className="text-[10px] text-[#F5F0E8]/35 ml-1">{selectedModel.desc}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
          <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            style={{ background: saved ? '#10B981' : 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            {saving ? '저장 중...' : saved ? '✓ 저장됨' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
