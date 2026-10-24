import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://newhope-readbible.vercel.app";
const SHARE_TITLE = "새소망 성경 통독";
const SHARE_DESCRIPTION =
  "새소망교회 팀별 성경 통독 — 매일 읽은 말씀을 기록하고, 팀과 함께 1,189장을 완주해요.";

// 공유 미리보기 이미지는 app/opengraph-image.tsx · app/twitter-image.tsx 에서 자동 생성됩니다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SHARE_TITLE,
    template: "%s — 새소망 성경 통독",
  },
  description: SHARE_DESCRIPTION,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: "/",
    siteName: "새소망교회 성경 통독",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "새소망통독",
  },
};

export const viewport = {
  themeColor: "#f8f6f3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      {/* 루트 레이아웃의 <head>라 모든 페이지에 적용됨 (pages/_document 대상 규칙의 오탐) */}
      {/* eslint-disable @next/next/no-page-custom-font */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
