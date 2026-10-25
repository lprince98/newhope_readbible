import type { Metadata } from "next";
import { RecordForm } from "@/src/presentation/components/record/RecordForm";
import { RecentRecords } from "@/src/presentation/components/record/RecentRecords";
import { getDailyVerse } from "@/src/shared/utils/dailyVerse";
import { PageHeader } from "@/src/presentation/components/common/PageHeader";


export const metadata: Metadata = {
  title: "읽기 기록",
  description: "오늘 읽은 성경 분량을 기록하세요.",
};

export const dynamic = "force-dynamic";


import { createClient } from "@/src/infrastructure/supabase/server";
import { DailyGoalEditor } from "@/src/presentation/components/record/DailyGoalEditor";
import { getCurrentUploadWindow } from "@/lib/utils/uploadWindow";
import { UploadNotice } from "@/src/presentation/components/common/UploadNotice";

export default async function RecordPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: editId } = await searchParams;
  const dailyVerse = getDailyVerse();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dailyGoal = 4;
  let editRecord = null;
  // 입력 기간: 시작 전·마감 후에는 입력 폼 대신 안내를 보여주고 수정·삭제도 막음
  const uploadWindow = getCurrentUploadWindow();
  const isClosed = uploadWindow.phase !== "open";

  if (user) {
    // 목표 정보 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_goal")
      .eq("id", user.id)
      .single();
    dailyGoal = profile?.daily_goal ?? 4;

    // 수정할 기록이 있다면 조회
    if (editId) {
      const { data } = await supabase
        .from("reading_records")
        .select("*")
        .eq("id", editId)
        .eq("user_id", user.id)
        .single();
      editRecord = data;
    }
  }


  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-6 px-4 py-6 md:px-6">
      {/* 페이지 헤더 */}
      <PageHeader
        eyebrow="읽기 기록"
        title={editRecord ? "읽기 기록 수정" : "성경 읽기 기록"}
        description="매일의 성경 통독 여정을 기록하세요."
      />

      {/* 시작일·마감일 당일 공지 */}
      <UploadNotice window={uploadWindow} />

      {uploadWindow.phase === "before" ? (
        <section className="flex flex-col items-center gap-4 rounded-[1.25rem] border border-teal/25 bg-teal-tint p-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-teal shadow-card">
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_upcoming
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold text-ink">아직 기록 입력 기간이 아닙니다</h3>
            <p className="text-[14px] leading-relaxed text-muted">
              성경 읽기 기록은 <strong className="font-semibold text-teal-deep">{uploadWindow.startLabel}</strong>부터
              <br />
              <strong className="font-semibold text-ink">{uploadWindow.endLabel}</strong>까지 입력할 수 있습니다.
            </p>
          </div>
        </section>
      ) : isClosed ? (
        <section className="flex flex-col items-center gap-4 rounded-[1.25rem] border border-gold/30 bg-gold-soft p-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold shadow-card">
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_busy
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold text-ink">
              성경 읽기 기록 업로드 종료 안내
            </h3>
            <p className="text-[14px] leading-relaxed text-muted">
              성경 읽기 기록 업로드 및 편집 기간이 마감되었습니다. ({uploadWindow.endLabel} 마감)<br />
              그동안 말씀 통독 여정에 함께해 주신 모든 성도님들께 진심으로 감사드립니다.<br />
              늘 말씀 안에서 주님의 은혜와 평강이 넘쳐나시기를 기도합니다.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* 목표 설정 */}
          <DailyGoalEditor initialGoal={dailyGoal} />

          {/* 기록 폼 */}
          <RecordForm key={editRecord?.id ?? "new"} editRecord={editRecord} />
        </>
      )}

      {/* 최근 기록 목록 */}
      <RecentRecords isClosed={isClosed} />


      {/* 동기부여 말씀 */}
      <section className="card relative overflow-hidden p-6">
        <span className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-brand to-teal" />
        <span
          className="material-symbols-outlined absolute top-3 right-4 text-[56px] text-brand/10"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          format_quote
        </span>
        <div className="relative flex flex-col gap-3">
          <span className="eyebrow text-brand">오늘의 말씀</span>
          <blockquote className="verse text-[17px]">
            &ldquo;{dailyVerse.text}&rdquo;
          </blockquote>
          <p className="text-right font-serif text-[14px] text-muted">
            {dailyVerse.ref}
          </p>
        </div>
      </section>
    </div>
  );
}
