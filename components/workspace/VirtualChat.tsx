'use client'

import { useEffect, useRef, useState } from 'react'

type ChatMessage = {
  id: number
  exec: string
  title: string
  color: string
  text: string
  ts: string
}

const SEED_MESSAGES: ChatMessage[] = [
  { id: 1,  exec: 'ceo', title: 'CEO', color: '#F59E0B', text: '전사 Q2 목표 공유합니다. MAU 10만, MRR $30K 달성이 핵심입니다.', ts: '09:01' },
  { id: 2,  exec: 'cto', title: 'CTO', color: '#3B82F6', text: '텔레그램 WebApp v2 배포 완료. 로딩 속도 40% 개선됐습니다.', ts: '09:03' },
  { id: 3,  exec: 'cmo', title: 'CMO', color: '#EC4899', text: '프로덕트헌트 론칭 D-7. SNS 예열 캠페인 시작합니다.', ts: '09:05' },
  { id: 4,  exec: 'cfo', title: 'CFO', color: '#10B981', text: '이번 달 AWS 비용 $1,240. 지난 달 대비 18% 절감. 버퍼 여유 있습니다.', ts: '09:07' },
  { id: 5,  exec: 'cpo', title: 'CPO', color: '#8B5CF6', text: '온보딩 퍼널 분석 완료. Step 3에서 42% 이탈 중. 개선안 PRD 오늘 공유합니다.', ts: '09:10' },
  { id: 6,  exec: 'chro', title: 'CHRO', color: '#06B6D4', text: 'SkillsMuse에서 풀스택 개발자 3명 후보 선정 완료. 면접 일정 잡겠습니다.', ts: '09:12' },
  { id: 7,  exec: 'coo', title: 'COO', color: '#F97316', text: '고객 CS 평균 응답 시간 2.3시간. 목표치 1시간 달성 위해 자동화 봇 붙입니다.', ts: '09:15' },
  { id: 8,  exec: 'cdo', title: 'CDO', color: '#F472B6', text: '대시보드 3-패널 와이어프레임 완성. 피그마 링크 공유했습니다.', ts: '09:17' },
  { id: 9,  exec: 'clo', title: 'CLO', color: '#94A3B8', text: 'SaaS 이용약관 v2 검토 완료. 개인정보 처리방침 GDPR 항목 추가했습니다.', ts: '09:18' },
  { id: 10, exec: 'cto', title: 'CTO', color: '#3B82F6', text: '@CPO 온보딩 이탈 이슈, 서버 응답 레이턴시도 원인일 수 있습니다. 확인해보겠습니다.', ts: '09:20' },
  { id: 11, exec: 'cpo', title: 'CPO', color: '#8B5CF6', text: '@CTO 감사합니다. P1 이슈로 올리겠습니다.', ts: '09:21' },
  { id: 12, exec: 'cmo', title: 'CMO', color: '#EC4899', text: 'X(트위터) 바이럴 실험 결과: 훅 문구 "당신의 회사를 텔레그램 안에" — CTR 8.4% 최고치.', ts: '09:24' },
  { id: 13, exec: 'cfo', title: 'CFO', color: '#10B981', text: 'Pro 플랜 전환율 2.1%. 벤치마크 대비 -0.4%p. 가격 A/B 테스트 제안합니다.', ts: '09:26' },
  { id: 14, exec: 'ceo', title: 'CEO', color: '#F59E0B', text: '좋습니다. CFO, CMO 함께 A/B 시나리오 정리해서 내일 오전 보고해주세요.', ts: '09:28' },
  { id: 15, exec: 'cdo', title: 'CDO', color: '#F472B6', text: '9인 체제 브랜딩 에셋 리뉴얼 중. 캐릭터 이미지 오늘 배포 예정입니다.', ts: '09:30' },
]

const LIVE_MESSAGES: Omit<ChatMessage, 'id'>[] = [
  { exec: 'chro', title: 'CHRO', color: '#06B6D4', text: '신규 팀원 SkillsMuse 인재풀 검색 완료. 10명 후보군 확보.', ts: '' },
  { exec: 'cto',  title: 'CTO',  color: '#3B82F6', text: 'Supabase 쿼리 최적화 완료. API 응답 220ms → 85ms.', ts: '' },
  { exec: 'cmo',  title: 'CMO',  color: '#EC4899', text: 'LinkedIn 광고 CTR 3.2%. 예산 재배분 추천합니다.', ts: '' },
  { exec: 'clo',  title: 'CLO',  color: '#94A3B8', text: '파트너십 계약서 리스크 2건 발견. 수정안 전달하겠습니다.', ts: '' },
  { exec: 'coo',  title: 'COO',  color: '#F97316', text: '운영 SOP 업데이트 완료. 팀 전파하겠습니다.', ts: '' },
  { exec: 'cpo',  title: 'CPO',  color: '#8B5CF6', text: 'v3.1 로드맵 초안 완성. 리뷰 요청드립니다.', ts: '' },
  { exec: 'cfo',  title: 'CFO',  color: '#10B981', text: '월말 번아웃 예산 소진율 67%. 안정권입니다.', ts: '' },
  { exec: 'cdo',  title: 'CDO',  color: '#F472B6', text: '다크모드 컬러 시스템 v2 적용 완료.', ts: '' },
]

function getNow() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function VirtualChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES)
  const [liveIdx, setLiveIdx] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const next = LIVE_MESSAGES[liveIdx % LIVE_MESSAGES.length]
      setMessages(prev => [...prev, { ...next, id: Date.now(), ts: getNow() }])
      setLiveIdx(i => i + 1)
    }, 4500)
    return () => clearInterval(interval)
  }, [liveIdx])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"/>
        <span className="text-[11px] font-bold text-[#F5F0E8]/80">Live Feed</span>
        <span className="text-[9px] text-[#F5F0E8]/40 ml-auto">실시간 업무 채널</span>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 space-y-2.5">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: `${msg.color}20`, border: `1px solid ${msg.color}40`, color: msg.color }}
            >
              {msg.title.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold" style={{ color: msg.color }}>{msg.title}</span>
                <span className="text-[9px] text-[#F5F0E8]/30">{msg.ts}</span>
              </div>
              <p className="text-[10px] text-[#F5F0E8]/75 leading-relaxed break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="px-3 py-2 border-t border-white/5">
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-[10px] text-[#F5F0E8]/30 flex-1">임원에게 지시하기...</span>
          <span className="text-[10px] text-amber-400/60">↑</span>
        </div>
      </div>
    </div>
  )
}
