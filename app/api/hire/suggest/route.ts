import { NextRequest, NextResponse } from 'next/server'

const SKILL_CATEGORIES = [
  'K-Local', 'AI Agent', 'Web Development', 'DevOps', 'Data Engineering', 'Mobile',
  'Security', 'AI/ML', 'Automation', 'Backend',
  'Marketing & Growth', 'Business Strategy', 'Sales & BD', 'Finance & Accounting',
  'Testing', 'Database', 'AgentOps', 'MCP Integration', 'AI Security', 'Game Dev', 'Music / Audio',
  'UI/UX & Design Vibe', 'Meta Persona', 'Tech Writing', 'Web3 & Blockchain', 'Productivity & PKM',
  'HR & Recruiting', 'Legal & Compliance', 'Customer Success', 'Content & Copywriting', 'E-commerce & Retail',
  'Education & Training', 'Supply Chain & Trade', 'Healthcare Docs'
]

// POST: 역할 기반 최적 카테고리 추천
export async function POST(req: NextRequest) {
  try {
    const { role, requirements } = await req.json()

    if (!role) {
      return NextResponse.json({ category: '', reason: '역할을 입력해주세요.' }, { status: 400 })
    }

    const prompt = `You are a hiring category classifier. Given the job role description, recommend the single BEST matching category from this exact list:

${SKILL_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Job Role: "${role}"
${requirements ? `Additional Requirements: "${requirements}"` : ''}

Respond in this EXACT JSON format only, no other text:
{"category": "exact category name from list", "reason_ko": "한국어로 된 선택 이유 (1줄)"}
`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      }
    )

    const data = await res.json()
    console.log('[suggest] Gemini response:', JSON.stringify(data).substring(0, 500))
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // 카테고리 유효성 검증
      if (SKILL_CATEGORIES.includes(parsed.category)) {
        return NextResponse.json({
          category: parsed.category,
          reason: parsed.reason_ko || '추천됨',
        })
      }
    }

    return NextResponse.json({ category: '', reason: data.error?.message || '추천 실패. 직접 선택해주세요.' })
  } catch (err: any) {
    return NextResponse.json({ category: '', reason: err.message }, { status: 500 })
  }
}
