"use client";

import React from 'react';
import { Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
  byokLabel?: string;
}

export default function PricingCard() {
  const tiers: PricingTier[] = [
    {
      name: "Starter (체험 플랜)",
      price: "Free",
      period: "",
      description: "AI 1인 기업 자동화의 혁신을 가볍게 맛보고 싶은 초심자용 플랜",
      features: [
        "1인 비서 (Iris) 기본 연동",
        "Gemini 2.5 Flash 모델 가동",
        "월 최대 10회 자율 비서 지시(Tasks)",
        "자율 활성 프로젝트 1개 제한",
        "실시간 CCTV 로그 실시간 모니터링 (30분 이력 보존)"
      ],
      ctaText: "무료로 시작하기",
      ctaHref: "/onboarding",
      isPopular: false
    },
    {
      name: "Pro (BYOK 플랜)",
      price: "$49",
      period: "/ mo",
      badge: "대표님 추천",
      byokLabel: "⚡ 본인 API 키 직접 등록 (비용 마크업 0%)",
      description: "9인 AI 전문 임원실을 전면 가동하여 24시간 무중단 자율 경영을 구축하는 표준 플랜",
      features: [
        "9인 AI C-Level 전문 임원실 완전 소집 (CEO, CTO, CPO, CDO 등)",
        "본인 Claude/Gemini API Key 직접 등록 (BYOK)",
        "플랫폼 마크업 수수료 0원 (자기가 쓰는 만큼 원가 그대로)",
        "Night Shift (야간 크론 자율 자동화 운영) 무제한",
        "자율 활성 프로젝트 무제한 생성",
        "프로젝트 격리 가상 Git Sandbox 프로비저닝",
        "실시간 이사회 Boardroom 단톡방 & CCTV 라이브피드 완전 연동",
        "배포 승인 [🚀 배포 승인 (Merge)] 원클릭 CI/CD 가동"
      ],
      ctaText: "🐝 9인 임원실 자율 가동하기",
      ctaHref: "/onboarding",
      isPopular: true
    },
    {
      name: "Enterprise (독점 플랜)",
      price: "Custom",
      period: "",
      description: "대규모 트래픽 및 완벽한 법적 데이터/인프라 격리가 필수적인 강소 기업용 독점 사양",
      features: [
        "독점 전용 AWS / Vercel 클라우드 인프라",
        "Supabase 멀티테넌트 독립 전용 데이터베이스 구축",
        "전담 임원진 무제한 처리 모델 격리 미세 조정",
        "하이브데스크 엔지니어링 24/7 전용 핫라인 헬프데스크",
        "법적 컴플라이언스(CLO) 및 SLA 보장(99.9% Uptime)"
      ],
      ctaText: "엔터프라이즈 문의하기",
      ctaHref: "https://t.me/hivedesk_bot",
      isPopular: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 py-8">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
            tier.isPopular
              ? 'glass border-2 border-amber-400/80 bg-amber-500/[0.04] shadow-[0_0_30px_rgba(245,158,11,0.12)] scale-100 md:scale-105'
              : 'glass border border-[#F5F0E8]/10 hover:border-amber-500/30'
          }`}
        >
          {/* Popular badge */}
          {tier.isPopular && tier.badge && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-400 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{tier.badge}</span>
            </div>
          )}

          {/* Card Header */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-lg font-bold tracking-tight ${tier.isPopular ? 'text-amber-400' : 'text-[#F5F0E8]'}`}>
                {tier.name}
              </h3>
            </div>
            
            <p className="text-xs font-semibold text-[#F5F0E8]/50 leading-relaxed mb-6">
              {tier.description}
            </p>

            <div className="flex items-baseline gap-1 mb-6 border-b border-[#F5F0E8]/10 pb-6">
              <span className="text-4xl font-extrabold text-[#F5F0E8] font-mono tracking-tight">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm font-semibold text-[#F5F0E8]/40">
                  {tier.period}
                </span>
              )}
            </div>

            {/* BYOK Tag */}
            {tier.byokLabel && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-6">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-300">
                  {tier.byokLabel}
                </span>
              </div>
            )}

            {/* Feature List */}
            <ul className="space-y-4 mb-8">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  {tier.isPopular ? (
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-semibold text-[#F5F0E8]/85 leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div>
            {tier.isPopular ? (
              <Link
                href={tier.ctaHref}
                className="cta-pulse flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm py-4 px-6 rounded-xl w-full transition-transform duration-200 hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                <span>{tier.ctaText}</span>
              </Link>
            ) : (
              <Link
                href={tier.ctaHref}
                className="flex items-center justify-center bg-[#F5F0E8]/5 hover:bg-[#F5F0E8]/10 border border-[#F5F0E8]/15 text-[#F5F0E8] font-bold text-sm py-4 px-6 rounded-xl w-full transition-colors duration-200"
              >
                <span>{tier.ctaText}</span>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
