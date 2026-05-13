import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Telegram-Web-App-Init-Data',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
}

// executives 테이블에는 color 컬럼이 없으므로 ID 기반 매핑 사용
const EXEC_COLOR_MAP: Record<string, string> = {
  cto:  '#3B82F6',
  cmo:  '#EC4899',
  cfo:  '#10B981',
  cpo:  '#8B5CF6',
  coo:  '#F97316',
  chro: '#06B6D4',
  cao:  '#94A3B8',
}

const FALLBACK_DATA = {
  source: 'fallback',
  executives: [
    { id: 'ceo',  title: 'CEO',  titleKo: '대표이사',   color: '#F59E0B', status: 'active' },
    { id: 'cto',  title: 'CTO',  titleKo: '기술 총괄',   color: '#3B82F6', status: 'active' },
    { id: 'cpo',  title: 'CPO',  titleKo: '제품 총괄',   color: '#8B5CF6', status: 'active' },
    { id: 'cdo',  title: 'CDO',  titleKo: '디자인 총괄', color: '#F472B6', status: 'active' },
    { id: 'cmo',  title: 'CMO',  titleKo: '마케팅 총괄', color: '#EC4899', status: 'active' },
    { id: 'coo',  title: 'COO',  titleKo: '운영 총괄',   color: '#F97316', status: 'active' },
    { id: 'cfo',  title: 'CFO',  titleKo: '재무 총괄',   color: '#10B981', status: 'active' },
    { id: 'chro', title: 'CHRO', titleKo: '인사 총괄',   color: '#06B6D4', status: 'active' },
    { id: 'clo',  title: 'CLO',  titleKo: '법무 총괄',   color: '#94A3B8', status: 'active' },
  ],
  stats: {
    activeExecutives: 9,
    availableTeamMembers: 45,
    monthlySpend: 0,
    skillsPoolSize: 4500,
  },
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  const timeoutMs = 5000

  try {
    const supabase = createServiceClient()

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), timeoutMs)
    )

    const queryPromise = supabase
      .from('executives')
      .select('id, title, title_ko, emoji, is_active, sort_order')
      .order('sort_order')
      .limit(10)

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error) throw error

    const executives = (data ?? []).map((e: any) => ({
      id:      e.id,
      title:   e.title,
      titleKo: e.title_ko,
      emoji:   e.emoji,
      color:   EXEC_COLOR_MAP[e.id] ?? '#94A3B8',
      status:  e.is_active ? 'active' : 'inactive',
    }))

    return NextResponse.json(
      { source: 'supabase', executives, stats: FALLBACK_DATA.stats },
      { headers: CORS_HEADERS }
    )
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development'
    const detail = isDev && err instanceof Error ? err.message : undefined

    return NextResponse.json(
      { ...FALLBACK_DATA, ...(detail ? { _debug: detail } : {}) },
      { headers: CORS_HEADERS }
    )
  }
}
