import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const AVAILABLE_MODELS = [
  { id: 'claude-opus-4.6', name: 'Claude Opus 4.6', tier: 'opus', desc: '최고 성능 · 복잡한 추론', cost: '$$$$' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', tier: 'sonnet', desc: '균형형 · 코딩 특화', cost: '$$$' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', tier: 'haiku', desc: '초고속 · 대량 처리', cost: '$' },
  { id: 'gemma-4', name: 'Gemma 4', tier: 'gemma', desc: '로컬 · 무료', cost: '무료' },
]

const DEFAULT_MODELS: Record<string, string> = {
  A: 'claude-opus-4.6',
  B: 'claude-sonnet-4.6',
  C: 'claude-haiku-4.5',
}

const SETTINGS_DIR = path.join(process.cwd(), '.grade-models')

async function getSettingsPath(orgId: string) {
  await fs.mkdir(SETTINGS_DIR, { recursive: true })
  return path.join(SETTINGS_DIR, `${orgId}.json`)
}

async function loadSettings(orgId: string): Promise<Record<string, string>> {
  try {
    const filePath = await getSettingsPath(orgId)
    const data = await fs.readFile(filePath, 'utf8')
    return { ...DEFAULT_MODELS, ...JSON.parse(data) }
  } catch {
    return { ...DEFAULT_MODELS }
  }
}

async function saveSettings(orgId: string, settings: Record<string, string>) {
  const filePath = await getSettingsPath(orgId)
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2))
}

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('org_id')
  const settings = orgId ? await loadSettings(orgId) : { ...DEFAULT_MODELS }
  return NextResponse.json({ models: AVAILABLE_MODELS, settings })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { org_id, settings } = body

  if (!org_id || !settings) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const cleaned: Record<string, string> = {
    A: settings.A || DEFAULT_MODELS.A,
    B: settings.B || DEFAULT_MODELS.B,
    C: settings.C || DEFAULT_MODELS.C,
  }

  await saveSettings(org_id, cleaned)
  return NextResponse.json({ ok: true, settings: cleaned })
}
