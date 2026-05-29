import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { org_id, project_id, userMessage } = await req.json()

    if (!org_id || !project_id || !userMessage?.trim()) {
      return NextResponse.json({ error: '필수 매개변수가 누락되었습니다.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY 없음' }, { status: 500 })
    }

    const supabase = createServiceClient()

    // 1. 프로젝트 기획서 정보 조회
    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()

    if (pError || !project) {
      throw new Error(pError?.message || '프로젝트를 찾을 수 없습니다.')
    }

    // 2. 이사회 기존 회의 이력 조회 (최신 15개)
    const { data: threads, error: tError } = await supabase
      .from('conversation_threads')
      .select('*')
      .eq('exec_id', 'boardroom')
      .eq('project_id', project_id)
      .order('created_at', { ascending: true })
      .limit(15)

    const formattedHistory = (threads ?? [])
      .map((h: any) => `[${h.role === 'user' ? '대표님' : h.role}]: ${h.message}`)
      .join('\n')

    // 3. 프롬프트 구성
    const prompt = `당신은 하이브데스크(HiveDesk)의 전문 AI 임원진으로 구성된 이사회(Boardroom)입니다.
현재 신규 프로젝트가 CPO 이안실에서 통과되어 공식 회의에 회부되어 있으며, 대표님께서 이사회에 의견을 제시하셨습니다.

[프로젝트 정보]
- 타이틀: ${project.title}
- 설명: ${project.description}
- 프로젝트 목표: ${project.goal || '미지정'}
- 개발 단계: ${project.stage || 'idea'}
- 기술 스택: ${project.tech_stack || '미정'}
- 핵심 타켓 유저: ${project.target_audience || '미정'}
- 상세 기획서 (context_md):
"""
${project.context_md || '초안 없음'}
"""

[대표님의 피드백/질문]
"${userMessage}"

[이전 이사회 회의록]
${formattedHistory || '(이전 기록 없음)'}

[임원 프로필 정보]
- coo (엠마): 운영 총괄. 비즈니스 모델, 운영 효율성, 고객 관리, 비즈니스 타당성을 검증합니다.
- cto (뮤즈): 기술 총괄. 기술적 타당성, 아키텍처, 성능, 확장성, DB 설계 및 API 인프라를 검증합니다.
- cdo (하나): 디자인 총괄. UI/UX 디자인 DNA, 인터페이스 무결성, 폰트/컬러 테마, 대표 브랜드 정체성을 검증합니다.
- cpo (이안): 기획 총괄. 제품 로드맵, 핵심 기능 우선순위, 사용자 시나리오 및 기획서 완성도를 총괄합니다.

[역할 및 지침]
1. 대표님의 피드백/질문을 정밀하게 분석하여, 가장 관련도가 높고 답변을 주도해야 하는 임원을 1명 선택하세요 (coo, cto, cdo, cpo 중 선택).
2. 선택된 임원의 퍼스널리티와 전문 부서 뉘앙스를 100% 반영하여, 매우 날카롭고 고도화된 전문적 조언과 구체적인 피드백을 대표님께 개진하십시오.
3. 기획서의 비즈니스 현실성, 기술 아키텍처 구현, 또는 디자인 프리셋과 연결하여 추상적이지 않고 실제 액션이 가능한 실무 조언을 섞으십시오.
4. 반드시 아래의 순수 JSON 구조로만 정확하게 응답하세요. 마크다운 코드블록(\`\`\`json ...)이나 기타 텍스트는 절대 포함하지 마십시오.

출력 포맷:
{
  "role": "답변하는 임원의 ID (coo, cto, cdo, cpo 중 하나)",
  "message": "대표님께 드리는 전문적이고 예리한 이사회 피드백 메시지"
}`

    // 4. Gemini API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[/api/dashboard/boardroom/discuss] Gemini 오류:', errText.substring(0, 300))
      throw new Error(`Gemini API 오류 (${response.status})`)
    }

    const resData = await response.json()
    const raw = resData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    let role = 'coo'
    let message = ''

    try {
      let cleaned = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()

      const startIdx = cleaned.indexOf('{')
      const endIdx = cleaned.lastIndexOf('}')
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1)
      }

      const parsed = JSON.parse(cleaned)
      role = parsed.role || 'coo'
      message = parsed.message || ''
    } catch (e: any) {
      console.error('[/api/dashboard/boardroom/discuss] JSON.parse 에러:', e.message)
      console.error('[/api/dashboard/boardroom/discuss] raw:', raw)
      throw new Error('AI 응답 파싱 실패')
    }

    // 5. 생성된 임원 답변을 DB에 삽입
    const { error: insertError } = await supabase
      .from('conversation_threads')
      .insert({
        org_id,
        project_id,
        layer: 'user_exec',
        exec_id: 'boardroom',
        role, // 'coo', 'cto', 'cdo', 'cpo'
        message,
        created_at: new Date().toISOString()
      })

    if (insertError) throw insertError

    return NextResponse.json({ ok: true, role, message })
  } catch (err: any) {
    console.error('[/api/dashboard/boardroom/discuss] 서버 에러:', err)
    return NextResponse.json({ error: err.message || '서버 내부 오류' }, { status: 500 })
  }
}
