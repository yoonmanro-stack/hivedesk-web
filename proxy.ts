import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // hivedesk-app.hivedesk.ai 도메인으로 루트(/) 경로 진입 시 /dashboard로 리다이렉트
  if (hostname.includes('hivedesk-app.hivedesk.ai') && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
