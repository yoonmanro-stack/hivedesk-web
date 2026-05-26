import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org_id')
  const execId = searchParams.get('exec_id') // 특정 임원 필터 (선택)

  if (!orgId) {
    return NextResponse.json({ error: 'org_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    let query = supabase
      .from('tasks')
      .select('id, title, description, status, assigned_exec, branch_name, preview_url, progress, hired_agent_id, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (execId) {
      query = query.eq('assigned_exec', execId)
    }

    const { data: tasks, error } = await query

    if (error) throw error

    // 각 task 마다 채용 요원 정보가 연결되어 있다면, hired_agents 에서 추가 상세 정보를 긁어옴
    const agentIds = (tasks ?? []).map(t => t.hired_agent_id).filter(Boolean)
    let agentsMap: Record<string, any> = {}

    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('hired_agents')
        .select('id, agent_name, agent_role, primary_category, avatar_url')
        .in('id', agentIds)
      
      if (agents) {
        agents.forEach(a => {
          agentsMap[a.id] = a
        })
      }
    }

    // task_logs 에서 각 task 별 서브 진행 로그도 가져옴
    const taskIds = (tasks ?? []).map(t => t.id)
    let logsMap: Record<string, any[]> = {}

    if (taskIds.length > 0) {
      const { data: logs } = await supabase
        .from('task_logs')
        .select('id, task_id, log_message, step_name, status, created_at')
        .in('task_id', taskIds)
        .order('created_at', { ascending: true })
      
      if (logs) {
        logs.forEach(l => {
          if (!logsMap[l.task_id]) logsMap[l.task_id] = []
          logsMap[l.task_id].push(l)
        })
      }
    }

    // 최종 결합
    const enrichedTasks = (tasks ?? []).map(t => ({
      ...t,
      agent: t.hired_agent_id ? agentsMap[t.hired_agent_id] : null,
      logs: logsMap[t.id] ?? []
    }))

    return NextResponse.json({ tasks: enrichedTasks })
  } catch (err: any) {
    // 만약 hired_agents 나 task_logs 테이블이 없거나 에러가 나는 경우, simple tasks 반환
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (execId) {
        query = query.eq('assigned_exec', execId)
      }

      const { data: tasks, error } = await query
      if (error) throw error

      const fallbackTasks = (tasks ?? []).map(t => ({
        ...t,
        agent: null,
        logs: []
      }))
      return NextResponse.json({ tasks: fallbackTasks, fallback: true })
    } catch (fallbackErr: any) {
      return NextResponse.json({ error: fallbackErr.message || '조회 실패' }, { status: 500 })
    }
  }
}
