import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

// ──────────────────────────────────────────────
// GET /api/projects?org_id=xxx
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
// POST /api/projects — 새 프로젝트 생성
// Gemini 3.5 Flash로 실제 프로젝트 기획서 자동 생성
// ──────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json()
  const {
    org_id, name, description, goals, stage,
    target_audience, revenue_model, price, category,
    tech_stack, website_url, github_url, notion_url,
    challenges, active_execs,
    selected_intent,  // 선택된 방향 제목
    cdo,              // CDO 디자인 방향
    cto,              // CTO 기술 방향
    design_dna,
  } = body

  if (!org_id || !name || !description) {
    return NextResponse.json({ error: 'org_id, name, description은 필수입니다' }, { status: 400 })
  }

  const supabase = createServiceClient()
  await supabase.from('projects').update({ active_project: false }).eq('org_id', org_id)

  // ✨ Gemini 3.5 Flash로 실제 프로젝트 기획서 생성
  const contextMd = await generateProjectBriefWithGemini({
    name, description, goals, stage, target_audience,
    revenue_model, price, category, tech_stack,
    website_url, github_url, challenges,
    selected_intent, cdo, cto,
  })

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
      active_project: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const execsToInit: string[] = active_execs?.length ? active_execs : ['ceo', 'cto', 'cmo']
  if (project) {
    const workspaces = execsToInit.map((execId: string) => ({
      org_id, project_id: project.id, exec_id: execId,
      context_md: contextMd, status: 'idle',
    }))
    const { error: wsError } = await supabase.from('exec_workspaces').insert(workspaces)
    if (wsError) console.warn('[projects] exec_workspaces 초기화 실패:', wsError.message)
  }

  return NextResponse.json({ project, ok: true })
}

// ──────────────────────────────────────────────
// PATCH /api/projects — 프로젝트 수정 (기획서 포함)
// ──────────────────────────────────────────────
export async function PATCH(req: Request) {
  const body = await req.json()
  const { org_id, project_id, action, title, description, goal, context_md } = body
  if (!org_id || !project_id) {
    return NextResponse.json({ error: 'org_id, project_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (action === 'update') {
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (goal !== undefined) updateData.goal = goal
    if (context_md !== undefined) {
      updateData.context_md = context_md
      // 임원 workspace context_md도 동기화
      await supabase
        .from('exec_workspaces')
        .update({ context_md })
        .eq('project_id', project_id)
        .eq('org_id', org_id)
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', project_id)
      .eq('org_id', org_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ project: data, ok: true })
  }

  // 활성 프로젝트 전환
  await supabase.from('projects').update({ active_project: false }).eq('org_id', org_id)
  
  // 텔레그램 알림용 프로젝트 타이틀 조회
  const { data: projData } = await supabase
    .from('projects')
    .select('title')
    .eq('id', project_id)
    .eq('org_id', org_id)
    .single()

  const { error } = await supabase
    .from('projects').update({ active_project: true })
    .eq('id', project_id).eq('org_id', org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 텔레그램 동적 배너 알림 비동기 트리거
  if (projData && projData.title) {
    sendProjectActivationAlert(projData.title).catch(err => {
      console.error('[Background Telegram Alert Error]', err)
    })
  }

  return NextResponse.json({ ok: true })
}

// ──────────────────────────────────────────────
// 한국어 폰트 스마트 로드 (로컬 AppleGothic ➡️ 원격 NotoSansKR CDN 폴백)
// ──────────────────────────────────────────────
async function loadKoreanFont() {
  // 1. 최우선순위: 프로젝트 폴더에 상시 저장된 NotoSansKR-Black.ttf 로드 (극도로 두꺼운 Black 900 서체 확정)
  const projectFontPaths = [
    path.resolve(process.cwd(), 'public/fonts/NotoSansKR-Black.ttf'),
    path.resolve(process.cwd(), 'web/public/fonts/NotoSansKR-Black.ttf'),
    '/Users/muse/Desktop/project/HiveDesk/web/public/fonts/NotoSansKR-Black.ttf',
    '/Users/yoonmanro/Desktop/project/HiveDesk_Ops/web/public/fonts/NotoSansKR-Black.ttf'
  ]
  for (const p of projectFontPaths) {
    try {
      if (fs.existsSync(p)) {
        console.log(`[Font Load] 프로젝트 로컬 NotoSansKR-Black.ttf 로드 성공: ${p}`)
        const buffer = fs.readFileSync(p)
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      }
    } catch (e) {
      console.warn(`[Font Load] 프로젝트 로컬 폰트 로드 실패 (${p}):`, e)
    }
  }

  // 2. macOS 로컬 시스템 AppleGothic.ttf 로드 시도
  const localPath = '/System/Library/Fonts/Supplemental/AppleGothic.ttf'
  try {
    if (fs.existsSync(localPath)) {
      console.log('[Font Load] macOS 로컬 AppleGothic.ttf 로드 성공')
      const buffer = fs.readFileSync(localPath)
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }
  } catch (e) {
    console.warn('[Font Load] 로컬 시스템 폰트 로드 실패:', e)
  }

  // 3. 로컬 폰트 모두 누락 시 Google Font CDN 원격 Fetch (900 Black 굵기 확정 버전)
  try {
    const fontUrl = 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzkM1eLTq9n4g.ttf'
    const res = await fetch(fontUrl)
    if (!res.ok) throw new Error('Font CDN download failed')
    console.log('[Font Load] 원격 Noto Sans KR 900 Black ttf 다운로드 성공')
    return await res.arrayBuffer()
  } catch (e) {
    console.error('[Font Load Error] 원격 폰트 다운로드 실패:', e)
    return null
  }
}

// ──────────────────────────────────────────────
// 텔레그램 프리미엄 동적 배너 알림 전송 헬퍼
// ──────────────────────────────────────────────
async function sendProjectActivationAlert(title: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.warn('[Telegram Alert] TELEGRAM_BOT_TOKEN 이 설정되지 않았습니다.')
      return
    }

    // 1. 스마트 Chat ID 검색 (env -> admin_chat_id.txt)
    let chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim()
    if (!chatId) {
      const possiblePaths = [
        path.resolve(process.cwd(), '../telegram_bridge/admin_chat_id.txt'),
        path.resolve(process.cwd(), 'telegram_bridge/admin_chat_id.txt'),
        '/Users/muse/Desktop/project/HiveDesk/telegram_bridge/admin_chat_id.txt',
        '/Users/yoonmanro/Desktop/project/HiveDesk_Ops/telegram_bridge/admin_chat_id.txt'
      ]
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          chatId = fs.readFileSync(p, 'utf8').trim()
          console.log(`[Telegram Alert] admin_chat_id.txt 발견! chat_id: ${chatId} (경로: ${p})`)
          break
        }
      }
    }

    if (!chatId) {
      console.warn('[Telegram Alert] TELEGRAM_ADMIN_CHAT_ID 또는 admin_chat_id.txt 를 찾을 수 없습니다.')
      return
    }

    // 2. 한국어 폰트 로드
    const fontBuffer = await loadKoreanFont()
    const fonts: any[] = []
    if (fontBuffer) {
      fonts.push({
        name: 'KoreanFont',
        data: fontBuffer,
        style: 'normal',
        weight: 900,
      })
    } else {
      console.error('[Telegram Alert Failed] 레이아웃에 필요한 폰트를 로드하지 못했습니다.')
      return;
    }

    // 3. next/og (Satori) 1200x400 배너 생성 (이전의 기품있는 황금 뷰로 롤백)
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1200px',
            height: '400px',
            background: 'linear-gradient(135deg, #00B2C2 0%, #008AA1 50%, #006070 100%)',
            fontFamily: 'KoreanFont',
            position: 'relative',
            padding: '40px',
          }}
        >
          {/* 장식용 글로우 배경 원들 */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              left: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '200px',
              background: 'rgba(255, 255, 255, 0.18)',
              filter: 'blur(70px)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              right: '-50px',
              width: '450px',
              height: '450px',
              borderRadius: '225px',
              background: 'rgba(45, 212, 191, 0.15)',
              filter: 'blur(90px)',
              display: 'flex',
            }}
          />

          {/* 메인 아크릴 글래스 플레이트 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1100px',
              height: '320px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '24px',
              padding: '25px 40px',
            }}
          >
            {/* 상단 액티브 뱃지 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                borderRadius: '50px',
                padding: '10px 26px',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '7px',
                  background: '#ffffff',
                  marginRight: '12px',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '26px',
                  fontWeight: '900',
                  letterSpacing: '3px',
                }}
              >
                ACTIVE PROJECT
              </span>
            </div>

            {/* 프로젝트 이름 */}
            <div
              style={{
                fontSize: '86px',
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                letterSpacing: '-2.5px',
              }}
            >
              {title}
            </div>

            {/* 하단 데코 가이드 라인 및 카피 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginTop: '10px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.45))',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '26px',
                  margin: '0 25px',
                  fontWeight: '900',
                }}
              >
                작업 준비가 완료되었습니다.
              </span>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.45))',
                  display: 'flex',
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 400,
        fonts,
      }
    )

    // 4. ImageResponse를 ArrayBuffer 및 Buffer로 추출
    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. 텔레그램 multipart/form-data 전송
    const formData = new FormData()
    formData.append('chat_id', chatId)
    
    // Node.js 글로벌 Blob 사용
    const blob = new Blob([buffer], { type: 'image/png' })
    formData.append('photo', blob, 'project_activated.png')
    
    const caption = `☕️ *[비서실장 아이리스]*\n"*{Project Title}*" 프로젝트가 활성화되었습니다.\n\n이제 프로젝트 작업을 진행하시면 됩니다.`.replace('{Project Title}', title)
    formData.append('caption', caption)
    formData.append('parse_mode', 'Markdown')

    // 6. Telegram API 호출
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Telegram API error: ${response.status} - ${errText}`)
    }

    console.log(`[Telegram Alert] 프로젝트 활성화 알림 전송 성공! (chat_id: ${chatId})`)
  } catch (error: any) {
    console.error('[Telegram Alert Failed]', error)
  }
}

// ──────────────────────────────────────────────
// DELETE /api/projects
// ──────────────────────────────────────────────
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('org_id')
  const projectId = searchParams.get('project_id')
  if (!orgId || !projectId) {
    return NextResponse.json({ error: 'org_id, project_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  try {
    await supabase.from('tasks').delete().eq('project_id', projectId).eq('org_id', orgId)
    await supabase.from('exec_workspaces').delete().eq('project_id', projectId).eq('org_id', orgId)
    const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('org_id', orgId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '삭제 실패' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────
// Gemini 3.5 Flash 프로젝트 기획서 생성
// ──────────────────────────────────────────────
async function generateProjectBriefWithGemini(d: {
  name: string; description: string; goals?: string; stage?: string;
  target_audience?: string; revenue_model?: string; price?: string;
  category?: string; tech_stack?: string; website_url?: string;
  github_url?: string; challenges?: string;
  selected_intent?: string; cdo?: string; cto?: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[projects] GEMINI_API_KEY 없음 — 기본 브리핑으로 대체')
    return buildFallbackBrief(d)
  }

  const prompt = `당신은 HiveDesk.ai의 CPO 이안입니다.
아래 프로젝트 데이터를 기반으로 전체 임원진(CEO, CTO, CFO, CMO, CDO, CPO, COO, CHRO, CLO)이 이사회 회의 전에 읽을 종합 프로젝트 기획서를 작성하세요.

[프로젝트 데이터]
- 프로젝트명: ${d.name}
- 핵심 아이디어: ${d.description}
- 선택된 비즈니스 방향: ${d.selected_intent || '미정'}
- 카테고리: ${d.category || '미정'}
- 개발 단계: ${stageLabel(d.stage || 'idea')}
- 3개월 목표: ${d.goals || '미정'}
- 타겟 사용자: ${d.target_audience || '미정'}
- 기술 스택: ${d.tech_stack || '미정'}
- 주요 리스크: ${d.challenges || '미정'}
- CDO 디자인 방향: ${d.cdo || '미정'}
- CTO 기술 방향: ${d.cto || '미정'}
- 수익 모델: ${d.revenue_model || '미정'}${d.price ? ` (${d.price})` : ''}

아래 섹션으로 마크다운 기획서를 작성하세요:
1. ## 📋 프로젝트 개요 — 무엇을 만드는가, 왜 지금인가
2. ## 🎯 비즈니스 방향 — 선택된 전략과 그 근거
3. ## 👥 타겟 시장 분석 — 누가 쓰는가, 시장 규모와 니즈
4. ## 💰 수익 모델 — 어떻게 돈을 버는가
5. ## 💻 기술 전략 (CTO 뮤즈) — 아키텍처와 구현 방향
6. ## 🎨 디자인 전략 (CDO 하나) — UX/UI 방향과 사용자 경험
7. ## 📈 목표 및 KPI — 3개월 내 달성해야 할 수치
8. ## ⚠️ 리스크 및 대응 전략 — 예상 장애물과 해결책
9. ## 🚀 즉시 실행 우선순위 — 지금 당장 해야 할 일 Top 3

규칙:
- 각 섹션은 2~4문장의 실질적이고 구체적인 내용으로 작성
- 데이터가 없는 항목은 "현재 미확보 — 이사회에서 결정 필요"로 표시
- 가상의 수치나 없는 사실 절대 금지
- 임원들이 읽고 즉시 토론 가능한 수준으로 작성`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.6 },
        }),
      }
    )
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (text.length > 100) {
      console.log(`[projects] Gemini 기획서 생성 완료 (${text.length}자)`)
      return `# 📁 ${d.name} — 프로젝트 기획서\n\n> 이 기획서는 HiveDesk AI가 자동 생성했습니다. 전 임원진이 회의 전 숙지해야 합니다.\n\n---\n\n${text}`
    }
    throw new Error('응답 너무 짧음')
  } catch (e: any) {
    console.warn('[projects] Gemini 기획서 생성 실패, fallback 사용:', e.message)
    return buildFallbackBrief(d)
  }
}

// fallback: Gemini 실패 시 기본 템플릿
function buildFallbackBrief(d: any): string {
  const lines = [
    `# 📁 ${d.name} — 프로젝트 기획서`,
    ``,
    `> ⚠️ AI 기획서 생성 실패 — 기본 템플릿으로 저장됨. '기획서 재생성' 버튼을 눌러주세요.`,
    ``,
    `## 📋 프로젝트 개요`,
    `${d.description}`,
    ``,
    `## 🎯 비즈니스 방향`,
    `${d.selected_intent || '현재 미확보 — 이사회에서 결정 필요'}`,
    ``,
    `## 👥 타겟 시장`,
    `${d.target_audience || '현재 미확보 — 이사회에서 결정 필요'}`,
    ``,
    `## 📈 목표 및 KPI`,
    `${d.goals || '현재 미확보 — 이사회에서 결정 필요'}`,
    ``,
    `## 💻 기술 전략`,
    `${d.tech_stack || '현재 미확보'}`,
    ``,
    `## ⚠️ 리스크`,
    `${d.challenges || '현재 미확보'}`,
  ]
  return lines.join('\n')
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    idea: '아이디어 단계', development: '개발 중',
    beta: '베타 테스트', live: '운영 중', growth: '성장 단계',
  }
  return map[stage] || stage
}

function stageToStatus(stage?: string): string {
  const map: Record<string, string> = {
    idea: 'planning', development: 'active',
    beta: 'active', live: 'launched', growth: 'launched',
  }
  return (stage && map[stage]) || 'active'
}
