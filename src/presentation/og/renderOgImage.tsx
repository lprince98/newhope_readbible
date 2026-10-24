import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { FEATURES } from "@/lib/constants/features";

/**
 * 링크 공유(카카오톡·문자·SNS) 미리보기용 대표 이미지(1200x630)를 그립니다.
 * app/opengraph-image.tsx, app/twitter-image.tsx 에서 함께 사용합니다.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "새소망교회 성경 통독 — 팀과 함께 읽는 1,189장의 여정";

const BRAND = "#8d255c";
const BRAND_DEEP = "#6b1a45";
const TEAL = "#0e8b9c";
const TEAL_SOFT = "#e3f3f5";
const INK = "#2b2625";
const MUTED = "#6f6866";
const CANVAS = "#f8f6f3";

export async function renderOgImage() {
  const root = process.cwd();
  const [extraBold, semiBold, medium, symbol, wordmark] = await Promise.all([
    readFile(join(root, "assets/fonts/Pretendard-ExtraBold.otf")),
    readFile(join(root, "assets/fonts/Pretendard-SemiBold.otf")),
    readFile(join(root, "assets/fonts/Pretendard-Medium.otf")),
    readFile(join(root, "public/logo-symbol.png")),
    readFile(join(root, "public/logo-wordmark.png")),
  ]);
  const symbolSrc = `data:image/png;base64,${symbol.toString("base64")}`;
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;

  const season = FEATURES.seasonStartDate;
  const seasonText = season
    ? `${season.slice(0, 4)}년 ${Number(season.slice(5, 7))}월 ${Number(season.slice(8, 10))}일 시작 · 팀별 성경 통독`
    : "팀별 성경 통독";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CANVAS,
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        {/* 왼쪽: 교회 워드마크 + 제목 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0 60px 72px",
            width: 700,
          }}
        >
          {/* 원본 비율 1268 x 357 */}
          <img src={wordmarkSrc} width={213} height={60} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                background: TEAL_SOFT,
                color: TEAL,
                fontSize: 24,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 999,
                marginBottom: 28,
              }}
            >
              {seasonText}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 92,
                fontWeight: 800,
                color: INK,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              새소망 성경 통독
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 500,
                color: MUTED,
                marginTop: 22,
                letterSpacing: "-0.01em",
              }}
            >
              함께 읽고, 기록하고, 서로 응원하는 말씀의 여정
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 600, color: BRAND }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: TEAL, marginRight: 12 }} />
            매일의 말씀 기록 · 팀 랭킹 · 응원 채팅
          </div>
        </div>

        {/* 오른쪽: 자주색 패널 + 로고 원호 장식 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 460,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(160deg, ${BRAND} 0%, ${BRAND_DEEP} 100%)`,
            borderTopLeftRadius: 56,
            borderBottomLeftRadius: 56,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", display: "flex", width: 620, height: 620, borderRadius: 999, border: "2px solid rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", display: "flex", width: 480, height: 480, borderRadius: 999, border: "2px solid rgba(255,255,255,0.16)" }} />
          <div
            style={{
              position: "absolute",
              top: -200,
              left: -200,
              display: "flex",
              width: 480,
              height: 480,
              background: "radial-gradient(circle, rgba(14,139,156,0.45) 0%, rgba(14,139,156,0) 70%)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 300,
              height: 300,
              borderRadius: 999,
              background: "#ffffff",
              boxShadow: "0 24px 60px rgba(43,38,37,0.30)",
            }}
          >
            {/* 원본 비율 268 x 260 */}
            <img src={symbolSrc} width={220} height={213} alt="" />
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Pretendard", data: extraBold, weight: 800, style: "normal" },
        { name: "Pretendard", data: semiBold, weight: 600, style: "normal" },
        { name: "Pretendard", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
