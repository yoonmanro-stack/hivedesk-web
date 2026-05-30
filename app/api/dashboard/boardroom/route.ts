import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const supabase = createServiceClient()

  try {
    // exec_id가 'boardroom'인 이사회 대화 내역 조회
    const { data: threads, error } = await supabase
      .from('conversation_threads')
      .select('*')
      .eq('exec_id', 'boardroom')
      .order('created_at', { ascending: false })
      .limit(300)
    
    if (error) throw error

    return NextResponse.json({ threads: threads ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '조회 실패' }, { status: 500 })
  }
}

