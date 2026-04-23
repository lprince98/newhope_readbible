import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "새소망 성경 통독",
    template: "%s — 새소망 성경 통독",
  },
  description: "새소망교회 성경 통독 기록 앱 — 매일의 말씀 여정을 기록하세요.",
  openGraph: {
    title: "새소망 성경 통독",
    description: "매일의 성경 통독 여정을 기록하고 팀원들과 함께 응원하세요.",
    url: "https://newhope-readbible.vercel.app", // 배포 후 실제 주소로 변경 권장
    siteName: "새소망 성경 통독",
    images: [
      {
        url: "/nhc_readbible_og.png",
        width: 1200,
        height: 630,
        alt: "새소망 성경 통독 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "새소망 성경 통독",
    description: "매일의 성경 통독 여정을 기록하고 팀원들과 함께 응원하세요.",
    images: ["/nhc_readbible_og.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "새소망통독",
  },
};

export const viewport = {
  themeColor: "#041129",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Serif+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Manrope, sans-serif" }}>{children}</body>
    </html>
  );
}
