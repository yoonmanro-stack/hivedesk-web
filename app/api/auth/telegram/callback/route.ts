export const dynamic = 'force-dynamic'

import { createHmac, createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Telegram Login Widget 데이터 검증 (HMAC-SHA256)
function verifyTelegramAuth(data: Record<string, string>): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const { hash, ...rest } = data

  // 1. secret_key = SHA256(bot_token)
  const secretKey = createHash('sha256').update(botToken).digest()

  // 2. data_check_string = key=value 를 \n으로 정렬 결합
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n')

  // 3. HMAC-SHA256(data_check_string, secret_key)
  const expectedHash = createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  // 4. 타임스탬프 유효성 (10분 이내)
  const authDate = parseInt(rest.auth_date, 10)
  const now = Math.floor(Date.now() / 1000)
  if (now - authDate > 600) return false

  return expectedHash === hash
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Telegram이 보내는 파라미터 수집
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  // 필수 파라미터 확인
  if (!params.id || !params.hash || !params.auth_date) {
    return NextResponse.redirect(new URL('/?error=missing_params', request.url))
  }

  // HMAC 검증
  if (!verifyTelegramAuth(params)) {
    return NextResponse.redirect(new URL('/?error=invalid_auth', request.url))
  }

  // Supabase service_role로 유저 등록/조회
  const db = createServiceClient()
  const telegramId = parseInt(params.id, 10)

  const { data: existingUser } = await db
    .from('users')
    .select('id, onboarding_step')
    .eq('telegram_id', telegramId)
    .single()

  if (existingUser) {
    // 기존 유저 → 마지막 접속 시간 업데이트 후 대시보드로
    await db
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('telegram_id', telegramId)

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('hd_uid', existingUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/',
    })
    return response
  }

  // 신규 유저 → users 테이블 등록
  const { data: newUser, error } = await db
    .from('users')
    .insert({
      telegram_id: telegramId,
      first_name: params.first_name ?? 'User',
      username: params.username ?? null,
      photo_url: params.photo_url ?? null,
      onboarding_step: 1,
    })
    .select('id')
    .single()

  if (error || !newUser) {
    console.error('[Telegram Auth] DB insert error:', error)
    return NextResponse.redirect(new URL('/?error=db_error', request.url))
  }

  // 온보딩 이벤트 기록
  await db.from('onboarding_events').insert({
    user_id: newUser.id,
    step: 1,
    event: 'started',
    meta: { source: 'telegram_widget' },
  })

  // 쿠키 세팅 후 온보딩으로
  const response = NextResponse.redirect(new URL('/onboarding', request.url))
  response.cookies.set('hd_uid', newUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
