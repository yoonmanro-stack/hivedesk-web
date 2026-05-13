import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ─── 프로덕션 서버 설정 ─────────────────────────────────────
  // dev 환경 전용 CORS 허용 목록 (prod에서는 무의미하지만 유지)
  allowedDevOrigins: ['100.100.27.10', '172.30.1.17'],

  // ─── workspace root 경고 제거 ────────────────────────────────
  // HiveDesk 루트에 package-lock.json이 두 곳(HiveDesk/, HiveDesk/web/)
  // 있어서 Next.js가 workspace root 추론 경고를 발생시킴 → 명시적으로 지정
  // outputFileTracingRoot: path.join(__dirname, '../../'), // Vercel 배포 에러 방지로 주석 처리
};

export default nextConfig;
