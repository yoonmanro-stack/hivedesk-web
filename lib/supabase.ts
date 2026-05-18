import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// 클라이언트 사이드용 (publishable key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// 서버 사이드용 (secret key — 절대 클라이언트에 노출 금지)
export function createServiceClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY is not set')
  return createClient(supabaseUrl, secretKey)
}
