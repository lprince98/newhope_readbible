import type { Metadata } from "next";
import { RecordForm } from "@/src/presentation/components/record/RecordForm";
import { RecentRecords } from "@/src/presentation/components/record/RecentRecords";
import { getDailyVerse } from "@/src/shared/utils/dailyVerse";


export const metadata: Metadata = {
  title: "읽기 기록 — 새소망 성경 통독",
  description: "오늘 읽은 성경 분량을 기록하세요.",
};

export default function RecordPage() {
  const dailyVerse = getDailyVerse();

  return (

    <div className="pt-8 pb-10 px-6 md:px-8 max-w-4xl mx-auto flex flex-col gap-10">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
        >
          성경 읽기 기록
        </h2>
        <p className="text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "24px" }}>
          매일의 성경 통독 여정을 기록하세요.
        </p>
      </div>

      {/* 기록 폼 */}
      <RecordForm />

      {/* 최근 기록 목록 */}
      <RecentRecords />


      {/* 동기부여 말씀 */}
      <div className="bg-[#eae8e4] rounded-2xl p-8 relative overflow-hidden shadow-sm border border-[#e4e2de]">
        <div className="absolute top-4 left-4 text-[#c5c6ce] opacity-20">
          <span className="material-symbols-outlined" style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}>
            format_quote
          </span>
        </div>
        <div className="relative z-10 text-center flex flex-col gap-3">
          <p
            className="text-[#45474d] italic max-w-lg mx-auto"
            style={{ fontFamily: "Noto Serif KR, serif", fontSize: "18px", lineHeight: "32px" }}
          >
            &ldquo;{dailyVerse.text}&rdquo;
          </p>
          <span
            className="text-[#775a19] font-semibold uppercase tracking-widest block"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
          >
            {dailyVerse.ref}
          </span>
        </div>
      </div>
    </div>
  );
}

