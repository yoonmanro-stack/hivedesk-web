# HiveDesk.ai — Web App

**"당신만의 AI 임원진 군단을 텔레그램 데스크에 고용하세요."**

텔레그램 메신저 하나로 AI 임원진을 통제하고, 앱을 배포하고, 매출을 만드는 **비동기식 신경망 기업(Autonomous Neural Firm)** 인프라의 웹 프론트엔드.

---

## 프로젝트 소개

HiveDesk 웹앱은 서비스의 공개 진입점입니다. 유저는 이 웹에서 Telegram 계정으로 로그인하고, 온보딩을 완료하면 자신의 AI 임원진 단톡방으로 연결됩니다.

### 주요 화면

| 경로 | 역할 |
|------|------|
| `/` | 랜딩 페이지. Telegram Login 위젯으로 바로 시작 |
| `/onboarding` | 5단계 온보딩 UI. 플랜 선택 → 업종 → 워크스페이스 설정 |
| `/dashboard` | 로그인 완료 후 메인 화면 |
| `/api/auth/telegram/callback` | Telegram OAuth 콜백. HMAC-SHA256 검증 후 Supabase 등록 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS 4, Glassmorphism 다크 테마 |
| 인증 | Telegram Login Widget + HMAC-SHA256 서버 검증 |
| DB / Backend | Supabase (PostgreSQL + RLS + Row-level Security) |
| 배포 | Vercel |
| 봇 연동 | Telegram Bot API (온보딩 웰컴 메시지 자동 발송) |

---

## 프로젝트 구조

```
web/
├── app/
│   ├── page.tsx                          # 랜딩 페이지
│   ├── layout.tsx                        # 전역 레이아웃
│   ├── globals.css                       # 전역 스타일
│   ├── dashboard/page.tsx                # 대시보드
│   ├── onboarding/page.tsx               # 온보딩 (5단계)
│   └── api/auth/telegram/callback/
│       └── route.ts                      # Telegram OAuth 콜백 API
├── components/
│   └── TelegramLoginButton.tsx           # Telegram Login 위젯 컴포넌트
├── lib/
│   └── supabase.ts                       # Supabase 클라이언트 (anon + service_role)
├── supabase/
│   └── schema.sql                        # DB 스키마 (users, workspaces, onboarding_events)
└── .env.local                            # 환경변수 (아래 가이드 참조)
```

---

## 설치 방법

### 사전 요구사항

- Node.js 20 이상
- Supabase 프로젝트 (Seoul 리전 권장)
- Telegram Bot (`@BotFather`에서 발급)

### 1. 의존성 설치

```bash
cd web
npm install
```

### 2. 환경변수 설정

아래 **환경변수 설정 가이드** 참조 후 `.env.local` 생성.

### 3. Supabase DB 마이그레이션

Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 전체 실행.

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 접속.

### 5. 빌드 검증

```bash
npm run build
```

---

## 환경변수 설정 가이드

`web/.env.local` 파일을 생성하고 아래 키를 채웁니다.

```env
# Supabase — 클라이언트 사이드 (공개 가능)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase — 서버 사이드 전용 (절대 클라이언트 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram Bot (OAuth 콜백 HMAC 검증용 + 온보딩 메시지 발송용)
TELEGRAM_BOT_TOKEN=your-bot-token

# 사이트 URL (Telegram Login Widget 도메인 등록에 사용)
NEXT_PUBLIC_SITE_URL=https://hivedesk.ai
```

### 각 키 발급 위치

| 키 | 발급 위치 |
|----|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 대시보드 → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 대시보드 → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 대시보드 → Project Settings → API → service_role (비공개) |
| `TELEGRAM_BOT_TOKEN` | Telegram `@BotFather` → `/mybots` → API Token |
| `NEXT_PUBLIC_SITE_URL` | 배포된 도메인 (로컬 개발 시 `http://localhost:3000`) |

### Telegram Login Widget 도메인 등록

Telegram Login Widget은 등록된 도메인에서만 동작합니다.

```
@BotFather → /mybots → 봇 선택 → Bot Settings → Domain → 도메인 입력
```

로컬 개발 시 `localhost`를 등록하면 위젯이 표시되지 않을 수 있습니다. 실 테스트는 Vercel Preview URL 또는 본 도메인에서 진행하세요.

---

## DB 스키마 개요

`supabase/schema.sql`에 정의된 3개 테이블:

| 테이블 | 역할 |
|--------|------|
| `users` | Telegram 유저 정보 + 온보딩 단계(`onboarding_step`) 관리 |
| `workspaces` | 유저별 워크스페이스 (플랜, 업종, AI 임원진 구성) |
| `onboarding_events` | 온보딩 각 단계 이벤트 로그 (분석용) |

모든 테이블에 RLS(Row-Level Security) 적용. 서버 사이드는 `service_role`, 클라이언트 사이드는 `anon` 키로만 접근.

---

## 인증 흐름

```
1. 유저가 랜딩 페이지에서 [Telegram으로 시작하기] 클릭
2. Telegram Login Widget이 OAuth 데이터를 콜백 URL로 전송
3. /api/auth/telegram/callback 에서 HMAC-SHA256으로 위변조 검증
4. 신규 유저 → Supabase users 테이블 등록 → /onboarding 리다이렉트
5. 기존 유저 → last_seen_at 업데이트 → /dashboard 리다이렉트
6. hd_uid 쿠키 발급 (httpOnly, 30일 유효)
```

---

## 배포 (Vercel)

1. Vercel 프로젝트 생성 후 이 레포 연결
2. Vercel 대시보드 → Environment Variables에 위 `.env.local` 키 전체 등록
3. `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 변경
4. `hivedesk.ai` 도메인 DNS를 Vercel으로 연결
