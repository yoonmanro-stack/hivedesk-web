import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()
    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: '프로젝트명과 아이디어 설명이 필요합니다.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY 없음' }, { status: 500 })
    }

    const prompt = `당신은 HiveDesk.ai의 CPO 이안입니다. 대표님의 아이디어를 분석해 비즈니스 방향 4가지를 JSON 배열로 제안하세요.

[프로젝트명]: ${name}
[아이디어]: ${description}

규칙:
1. 순수 JSON 배열만 출력. 설명 텍스트, 마크다운 코드블록 절대 금지.
2. 4가지 방향은 서로 다른 수익 모델과 타겟.
3. goals 수치는 초기 스타트업 현실 기준으로 보수적으로.
4. 아이디어와 직접 관련된 내용만 (일반 템플릿 금지).

[
  {
    "id": "영문_고유id",
    "title": "방향 제목 (20자 이내)",
    "desc": "핵심 가치와 차별점 1~2문장",
    "badge": "특성 한 단어",
    "category": "SaaS",
    "stage": "idea",
    "goals": "3개월 목표 (현실적 수치)",
    "userTarget": "구체적 타겟 사용자",
    "techStack": "기술 스택",
    "challenges": "최대 리스크",
    "cdo": "UI/UX 방향",
    "cto": "기술 구현 방향"
  }
]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[/api/projects/suggest] Gemini 오류:', errText.substring(0, 300))
      return NextResponse.json({ error: `Gemini API 오류 (${response.status})` }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // 강화된 JSON 추출: [ ... ] 배열 부분만 정확히 추출
    let suggestions: any[] = []
    try {
      // 1차: 마크다운 코드블록 제거 후 직접 파싱
      let cleaned = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim()

      // 2차: 첫 번째 [ 부터 마지막 ] 까지만 추출
      const startIdx = cleaned.indexOf('[')
      const endIdx = cleaned.lastIndexOf(']')
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1)
      }

      suggestions = JSON.parse(cleaned)

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('빈 배열 또는 파싱 결과 이상')
      }
    } catch (e: any) {
      console.error('[/api/projects/suggest] JSON.parse 에러:', e.message)
      console.error('[/api/projects/suggest] raw 길이:', raw.length)
      console.error('[/api/projects/suggest] raw 앞 300자:', raw.substring(0, 300))
      console.error('[/api/projects/suggest] raw 뒤 200자:', raw.substring(raw.length - 200))
      return NextResponse.json(
        { error: 'AI 응답 파싱 실패. 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestions })
  } catch (err: any) {
    console.error('[/api/projects/suggest] 오류:', err)
    return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 })
  }
}
