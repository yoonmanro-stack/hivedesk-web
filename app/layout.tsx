import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiveDesk.ai — AI 임원진 군단을 텔레그램에 고용하세요",
  description:
    "비개발자도 텔레그램 하나로 AI 임원진 수십 명을 지휘합니다. 회사를 자동화하는 가장 빠른 방법.",
  keywords: ["AI", "텔레그램", "자동화", "B2B SaaS", "HiveDesk"],
  openGraph: {
    title: "HiveDesk.ai",
    description: "당신만의 AI 임원진 군단을 텔레그램 데스크에 고용하세요",
    url: "https://hivedesk.ai",
    siteName: "HiveDesk.ai",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0D0D0D] text-[#F5F0E8]">
        {children}
      </body>
    </html>
  );
}
