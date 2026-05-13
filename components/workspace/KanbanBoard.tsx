'use client'

type KanbanTask = {
  id: string
  title: string
  priority: 'high' | 'mid' | 'low'
}

type KanbanColumn = {
  id: string
  label: string
  tasks: KanbanTask[]
}

type ExecKanban = {
  [execId: string]: KanbanColumn[]
}

const KANBAN_DATA: ExecKanban = {
  ceo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: 'Q3 전략 수립', priority: 'high' },
      { id: 't2', title: '투자자 덱 업데이트', priority: 'high' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't3', title: 'Q2 목표 리뷰', priority: 'high' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: '9인 체제 확정', priority: 'high' },
    ]},
  ],
  cto: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: 'Docker 샌드박스 v2', priority: 'high' },
      { id: 't2', title: 'WebSocket 실시간 채팅', priority: 'mid' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't3', title: 'API 레이턴시 최적화', priority: 'high' },
      { id: 't4', title: 'Supabase RLS 강화', priority: 'mid' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't5', title: 'WebApp 대시보드 배포', priority: 'high' },
      { id: 't6', title: 'CORS 텔레그램 설정', priority: 'mid' },
    ]},
  ],
  cpo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: 'v3.1 로드맵 확정', priority: 'high' },
      { id: 't2', title: '사용자 인터뷰 5건', priority: 'mid' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't3', title: '온보딩 퍼널 개선 PRD', priority: 'high' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: '3-패널 기획 완료', priority: 'high' },
    ]},
  ],
  cdo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: '모바일 UX 개선', priority: 'mid' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't2', title: '9인 캐릭터 에셋', priority: 'high' },
      { id: 't3', title: '다크모드 시스템 v2', priority: 'mid' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: '브랜딩 리뉴얼 확정', priority: 'high' },
    ]},
  ],
  cmo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: '프로덕트헌트 론칭', priority: 'high' },
      { id: 't2', title: 'SEO 블로그 10편', priority: 'mid' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't3', title: 'X 바이럴 캠페인', priority: 'high' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: 'SNS 예열 콘텐츠', priority: 'mid' },
    ]},
  ],
  coo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: 'CS 자동화 봇 도입', priority: 'high' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't2', title: '운영 SOP 문서화', priority: 'mid' },
      { id: 't3', title: '파트너 계약 검토', priority: 'mid' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: 'CS 응답 프로세스 개선', priority: 'mid' },
    ]},
  ],
  cfo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: '가격 A/B 시나리오', priority: 'high' },
      { id: 't2', title: 'Q2 재무 보고서', priority: 'high' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't3', title: 'AWS 비용 최적화', priority: 'mid' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: '5월 예산 리뷰', priority: 'high' },
    ]},
  ],
  chro: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: '개발자 3명 면접', priority: 'high' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't2', title: 'SkillsMuse 인재 스크리닝', priority: 'high' },
      { id: 't3', title: '조직문화 가이드 작성', priority: 'low' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't4', title: '채용 공고 게시', priority: 'mid' },
    ]},
  ],
  clo: [
    { id: 'todo', label: 'Todo', tasks: [
      { id: 't1', title: '파트너십 계약 리스크 해소', priority: 'high' },
    ]},
    { id: 'doing', label: 'In Progress', tasks: [
      { id: 't2', title: 'GDPR 이용약관 v2', priority: 'high' },
    ]},
    { id: 'done', label: 'Done', tasks: [
      { id: 't3', title: '서비스 이용약관 검토', priority: 'high' },
      { id: 't4', title: '개인정보 처리방침', priority: 'high' },
    ]},
  ],
}

const PRIORITY_COLOR: Record<string, string> = {
  high: '#EF4444',
  mid: '#F59E0B',
  low: '#6B7280',
}

type Props = {
  execId: string
  execColor: string
}

export default function KanbanBoard({ execId, execColor }: Props) {
  const columns = KANBAN_DATA[execId] ?? KANBAN_DATA['ceo']

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: execColor, boxShadow: `0 0 6px ${execColor}80` }}/>
        <span className="text-[11px] font-bold text-[#F5F0E8]/80">Kanban</span>
        <span className="text-[9px] text-[#F5F0E8]/40 ml-auto uppercase tracking-wider">
          {execId.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 overflow-x-auto overscroll-contain">
        <div className="flex gap-2 p-2 h-full" style={{ minWidth: `${columns.length * 140}px` }}>
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col min-w-[130px]">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <span className="text-[10px] font-bold text-[#F5F0E8]/60 uppercase tracking-wider">
                  {col.label}
                </span>
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${execColor}20`, color: execColor }}
                >
                  {col.tasks.length}
                </span>
              </div>
              <div className="flex-1 space-y-1.5">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="glass rounded-lg p-2 cursor-pointer hover:brightness-110 transition-all active:scale-95"
                    style={{ borderLeft: `2px solid ${PRIORITY_COLOR[task.priority]}40` }}
                  >
                    <p className="text-[10px] text-[#F5F0E8]/80 leading-snug">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
                      />
                      <span className="text-[8px] text-[#F5F0E8]/30 capitalize">{task.priority}</span>
                    </div>
                  </div>
                ))}
                {col.tasks.length === 0 && (
                  <div className="border border-dashed border-white/10 rounded-lg p-3 text-center">
                    <span className="text-[9px] text-[#F5F0E8]/20">없음</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
