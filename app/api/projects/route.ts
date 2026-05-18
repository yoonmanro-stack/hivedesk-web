import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// ──────────────────────────────────────────────
// GET /api/projects?org_id=xxx
// 조직의 프로젝트 목록 조회
// ──────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org_id')

  if (!orgId) return NextResponse.json({ error: 'org_id required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, goal, status, active_project, target_audience, tech_stack, context_md, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ projects: data ?? [] })
}

// ──────────────────────────────────────────────
// POST /api/projects
// 새 프로젝트 생성
// ──────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json()
  const {
    org_id,
    name,           // → DB: title
    description,
    goals,          // → DB: goal
    stage,          // UI 단계 (idea|development|beta|live|growth)
    target_audience,
    revenue_model,
    price,
    category,
    tech_stack,
    website_url,
    github_url,
    notion_url,
    challenges,
    active_execs,   // 활성화할 임원 ID 배열
  } = body

  if (!org_id || !name || !description) {
    return NextResponse.json(
      { error: 'org_id, name, description은 필수입니다' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // 첫 번째 프로젝트이면 active_project = true
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('org_id', org_id)
    .limit(1)

  const isFirst = !existing || existing.length === 0

  // context_md 자동 생성 (Gemma4 일일 주입용 브리핑)
  const contextMd = buildContextMd({
    name, description, goals, stage, target_audience,
    revenue_model, price, category, tech_stack,
    website_url, github_url, notion_url, challenges,
  })

  // DB status 매핑 (UI stage → DB status)
  const dbStatus = stageToStatus(stage)

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      org_id,
      title: name,
      description,
      goal: goals ?? null,
      status: dbStatus,
      target_audience: target_audience ?? null,
      tech_stack: tech_stack ?? null,
      context_md: contextMd,
      active_project: isFirst,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // exec_workspaces 자동 초기화 (선택된 임원들)
  const execsToInit: string[] = active_execs?.length
    ? active_execs
    : ['ceo', 'cto', 'cmo'] // 기본 3명

  if (project) {
    const workspaces = execsToInit.map((execId: string) => ({
      org_id,
      project_id: project.id,
      exec_id: execId,
      context_md: contextMd, // 임원 초기 컨텍스트 = 프로젝트 브리핑
      status: 'idle',
    }))
    const { error: wsError } = await supabase.from('exec_workspaces').insert(workspaces)
    if (wsError) console.warn('[projects] exec_workspaces 초기화 실패:', wsError.message)
  }

  return NextResponse.json({ project, ok: true })
}

// ──────────────────────────────────────────────
// PATCH /api/projects  (active_project 전환)
// ──────────────────────────────────────────────
export async function PATCH(req: Request) {
  const { org_id, project_id } = await req.json()
  if (!org_id || !project_id) {
    return NextResponse.json({ error: 'org_id, project_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 기존 active 해제 후 새 active 설정
  await supabase
    .from('projects')
    .update({ active_project: false })
    .eq('org_id', org_id)

  const { error } = await supabase
    .from('projects')
    .update({ active_project: true })
    .eq('id', project_id)
    .eq('org_id', org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ──────────────────────────────────────────────
// 유틸: context_md 생성
// ──────────────────────────────────────────────
function buildContextMd(d: {
  name: string; description: string; goals?: string; stage?: string;
  target_audience?: string; revenue_model?: string; price?: string;
  category?: string; tech_stack?: string; website_url?: string;
  github_url?: string; notion_url?: string; challenges?: string;
}): string {
  const lines: string[] = [
    `# ${d.name} 프로젝트 브리핑`,
    ``,
    `## 개요`,
    `${d.description}${d.category ? ` (${d.category})` : ''}`,
    ``,
  ]

  if (d.stage) {
    lines.push(`## 현재 단계`, `${stageLabel(d.stage)}`, ``)
  }
  if (d.goals) {
    lines.push(`## 6개월 목표`, `${d.goals}`, ``)
  }
  if (d.target_audience) {
    lines.push(`## 타겟 사용자`, `${d.target_audience}`, ``)
  }
  if (d.revenue_model || d.price) {
    const rev = [d.revenue_model, d.price ? `(${d.price})` : ''].filter(Boolean).join(' ')
    lines.push(`## 수익 모델`, rev, ``)
  }
  if (d.tech_stack) {
    lines.push(`## 기술 스택`, `${d.tech_stack}`, ``)
  }
  if (d.challenges) {
    lines.push(`## 현재 과제 / 블로커`, `${d.challenges}`, ``)
  }

  const links = [
    d.website_url && `- 웹사이트: ${d.website_url}`,
    d.github_url && `- GitHub: ${d.github_url}`,
    d.notion_url && `- 문서: ${d.notion_url}`,
  ].filter(Boolean)

  if (links.length) {
    lines.push(`## 링크`, ...links as string[], ``)
  }

  lines.push(
    `---`,
    `> 이 브리핑은 HiveDesk 프로젝트 생성 시 자동 생성되었습니다.`,
    `> 임원 세션 시작 시 Gemma4로 주입됩니다.`
  )

  return lines.join('\n')
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    idea: '아이디어 단계',
    development: '개발 중',
    beta: '베타 테스트',
    live: '운영 중',
    growth: '성장 단계',
  }
  return map[stage] || stage
}

function stageToStatus(stage?: string): string {
  const map: Record<string, string> = {
    idea: 'planning',
    development: 'active',
    beta: 'active',
    live: 'launched',
    growth: 'launched',
  }
  return (stage && map[stage]) || 'active'
}
