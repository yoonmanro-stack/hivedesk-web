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

    const prompt = `당신은 HiveDesk.ai의 CPO 이안입니다. 대표님의 한 줄 아이디어를 면밀히 파싱하고, 그 이면에 숨겨진 '기술적/구현적 숨은 의도'와 '사용자의 디자인적 심리'를 날카롭게 추정하여, 비즈니스 분류(B2C/B2B/DaaS/SaaS)가 다른 4가지 맞춤형 프로젝트 방향을 제안하세요.

[프로젝트명]: ${name}
[아이디어]: ${description}

프롬프트 고도화 설계 지침:
1. [숨은 의도 추정]: 대표님이 제시한 가볍고 얕은 아이디어 뒤에 숨은 "진짜 해결하고 싶어 하는 기술적 페인포인트", "구현 시 맞닥뜨릴 성능/보안적 니즈", "사용자가 실제로 체감하고 싶어 할 핵심 편의성(숨은 욕구)"을 4가지 서로 다른 관점에서 예리하게 추정하십시오.
2. [텍스트 내 융합]: 추정한 숨은 의도를 카드의 각 필드(특히 desc, cdo, cto)에 구체적이고 전문적인 어조로 버무려 작성하세요. "단순히 ~하는 것"을 넘어, "대표님의 진짜 의도인 [추정 의도]를 완벽하게 충족하기 위해 ~한다"는 뉘앙스가 녹아나야 합니다.
3. [임원진 코멘트 강화]:
   - CDO 하나(cdo): 사용자가 말하지 않은 '디자인적 숨은 욕구(예: 조작 피로도 제로, 미학적 쾌감, 은밀한 데이터 인지 등)'를 추적하여 최적의 UI 컴포넌트 구조로 제시.
   - CTO 뮤즈(cto): 대표님이 우려할 만한 '기술적 병목(예: 대용량 동기화 렉, 키 보안, 실시간 패싱 속도 등)'을 해결할 구체적이고 깊이 있는 시스템 아키텍처 방안 제시.
4. [goals 수치화]: 3개월 목표는 허황되지 않고 스타트업이 즉시 검증 가능한 현실적이고 구체적인 수치로 제시.
5. [출력 형식]: 순수 JSON 배열만 출력. 마크다운 코드블록(\`\`\`json ...) 절대 금지, 설명 텍스트 절대 금지.

JSON 스키마 규격:
[
  {
    "id": "영문_고유id (예: social_gamified, enterprise_pro 등)",
    "title": "방향 제목 (20자 이내, 직관적이고 멋지게)",
    "desc": "대표님의 진짜 숨은 의도인 [추정 의도]를 날카롭게 캐치하여 이에 대한 차별화된 해결책을 제시하는 1~2문장의 가치 제안",
    "badge": "비즈니스 분류 (B2C, B2B, DaaS, SaaS 중 하나)",
    "category": "SaaS",
    "stage": "idea",
    "goals": "3개월 목표 (수치적 지표 포함)",
    "userTarget": "숨겨진 타겟 사용자군 및 그들의 핵심 페인포인트",
    "techStack": "구체적인 핵심 기술 스택",
    "challenges": "숨은 의도 구현 시 마주할 최대 아키텍처 리스크",
    "cdo": "CDO 하나: 대표님의 디자인적 숨은 니즈인 [추정 니즈]를 해결할 구체적인 마이크로 UI 인터랙션 및 스타일 레이아웃 처방",
    "cto": "CTO 뮤즈: 대표님이 말하지 않은 기술적 염려인 [추정 우려]를 극복할 핵심 엔지니어링 파이프라인 및 백엔드 솔루션"
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
