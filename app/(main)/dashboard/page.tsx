import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { GetDashboardUseCase } from "@/src/application/use-cases/GetDashboardUseCase";
import { CircularProgress } from "@/src/presentation/components/dashboard/CircularProgress";
import { WeeklyBarChart } from "@/src/presentation/components/dashboard/WeeklyBarChart";

export const metadata: Metadata = {
  title: "대시보드 — 새소망 성경 통독",
  description: "나의 성경 통독 진도 현황을 한눈에 확인하세요.",
};

export const dynamic = "force-dynamic";


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[#775a19] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          lock
        </span>
        <p className="text-[#45474d]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
          로그인이 필요합니다.
        </p>
        <Link href="/login" className="bg-[#041129] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#1a263f] transition-colors">
          로그인하기
        </Link>
      </div>
    );
  }

  // 사용자 프로필 및 목표 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, daily_goal, teams(name)")
    .eq("id", user.id)
    .single();

  const teamName = (profile?.teams as unknown as { name: string } | null)?.name ?? null;
  const userName = profile?.name ?? "성도";
  const dailyGoal = profile?.daily_goal ?? 4;

  const repo = new SupabaseReadingRecordRepository(supabase);
  const useCase = new GetDashboardUseCase(repo);
  const dashboard = await useCase.execute(user.id, teamName, dailyGoal);


  // 오늘 요일 인덱스 (월=0 ~ 일=6)
  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2
            className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
          >
            오늘의 대시보드
          </h2>
          <p className="text-[#45474d] mt-2" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}>
            &ldquo;주의 말씀은 내 발에 등이요 내 길에 빛이니이다&rdquo; — 시편 119:105
          </p>
        </div>
        <Link
          href="/record"
          className="bg-[#041129] text-white px-6 py-3 rounded-full shadow-[0_4px_12px_rgba(26,38,63,0.05)] hover:bg-[#525e7a] active:scale-95 transition-all flex items-center gap-2"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
        >
          <span className="material-symbols-outlined text-[20px]">edit_document</span>
          기록 입력
        </Link>
      </div>

      {/* Bento 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 원형 진도 */}
        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(26,38,63,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fed488]/20 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
          <h3
            className="text-[#041129] mb-6"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
          >
            나의 진행 현황
          </h3>
          <CircularProgress
            percent={dashboard.todayPercent}
            todayChapters={dashboard.todayChapters}
            dailyGoal={dashboard.dailyGoal}
          />
        </div>

        {/* 주간 바 차트 */}
        <div className="md:col-span-7 lg:col-span-5 bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(26,38,63,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3
              className="text-[#041129]"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
            >
              주간 요약
            </h3>
            <span
              className="text-[#775a19] bg-[#ffdea5] px-3 py-1 rounded-full"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
            >
              읽은 장 수
            </span>
          </div>
          <WeeklyBarChart
            weeklyChapters={dashboard.weeklyChapters}
            todayDayIndex={todayDayIndex}
          />
        </div>

        {/* 팀 순위 카드 */}
        <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#041129] text-white rounded-xl p-6 shadow-[0_4px_12px_rgba(26,38,63,0.05)] flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#775a19]/20 rounded-full blur-xl" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#e9c176]">emoji_events</span>
                <h3
                  className="text-[#bac6e7] uppercase tracking-wider"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                >
                  우리 팀 순위
                </h3>
              </div>
              <p className="text-[#e4e2de] opacity-80 mb-4" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                {teamName ?? "팀 미배정"}
              </p>
            </div>
            <div className="flex items-baseline gap-2 z-10">
              <span
                className="text-[#ffdea5]"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "48px", fontWeight: 900 }}
              >
                {dashboard.teamRank ? `${dashboard.teamRank}위` : "-"}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 z-10 flex justify-between items-center">
              <div>
                <p className="text-[#e4e2de] opacity-80 uppercase tracking-widest" style={{ fontSize: "10px" }}>
                  {userName}
                </p>
                <p
                  className="font-bold text-white"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                >
                  오늘 {dashboard.todayChapters}장
                </p>
              </div>
              <Link
                href="/ranking"
                className="text-right text-[#e9c176] hover:text-[#ffdea5] transition-colors"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
              >
                전체 순위 →
              </Link>
            </div>
          </div>

          {/* 기록 바로가기 */}
          <Link
            href="/record"
            className="bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(26,38,63,0.05)] border-l-4 border-[#775a19] flex items-center justify-between cursor-pointer hover:bg-[#f5f3ef] transition-colors"
          >
            <div>
              <p
                className="text-[#45474d] uppercase tracking-widest mb-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px" }}
              >
                오늘 읽기 기록
              </p>
              <h4
                className="font-bold text-[#041129]"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 700 }}
              >
                + 새 기록 추가
              </h4>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#fed488] flex items-center justify-center text-[#785a1a]">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
