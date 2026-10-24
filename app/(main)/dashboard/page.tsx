import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { GetDashboardUseCase } from "@/src/application/use-cases/GetDashboardUseCase";
import { CircularProgress } from "@/src/presentation/components/dashboard/CircularProgress";
import { WeeklyBarChart } from "@/src/presentation/components/dashboard/WeeklyBarChart";
import { UnreadChaptersList } from "@/src/presentation/components/dashboard/UnreadChaptersList";
import { PageHeader } from "@/src/presentation/components/common/PageHeader";
import { FEATURES } from "@/lib/constants/features";

export const metadata: Metadata = {
  title: "대시보드",
  description: "나의 성경 통독 진도 현황을 한눈에 확인하세요.",
};

/**
 * 페이지 렌더링 옵션:
 * 항상 최신 데이터를 보여주기 위해 캐시를 사용하지 않고(force-dynamic)
 * 갱신 주기를 0초(revalidate = 0)로 설정합니다.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. 비로그인 처리
  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            lock
          </span>
        </div>
        <p className="text-[15px] text-muted">
          로그인이 필요합니다.
        </p>
        <Link href="/login" className="btn btn-primary px-8">
          로그인하기
        </Link>
      </div>
    );
  }

  // 2. 사용자 프로필 및 팀 정보 조회 (팀 ID를 통해 팀 이름 조인)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      name,
      daily_goal,
      teams:team_id (
        name
      )
    `)
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(">>> [DASHBOARD ERROR] profile fetch:", profileError);
  }

  // 3. 팀 이름 및 개인 목표치 추출
  const teamData = profile?.teams as unknown as { name: string } | null;
  const teamName = teamData?.name ?? null;
  const userName = profile?.name ?? "성도";
  const dailyGoal = profile?.daily_goal ? Number(profile.daily_goal) : 4; // 기본 목표는 4장

  // 4. 대시보드 통계 계산 유스케이스 실행
  const repo = new SupabaseReadingRecordRepository(supabase);
  const useCase = new GetDashboardUseCase(repo);
  const dashboard = await useCase.execute(user.id, teamName, dailyGoal);


  // 5. 오늘 요일 인덱스 계산 (차트 표시용, 월=0 ~ 일=6)
  const today = new Date();
  const kstToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const todayDayIndex = kstToday.getDay() === 0 ? 6 : kstToday.getDay() - 1;

  // 시즌 집계 시작일 안내 문구 (예: "11월 1일")
  const seasonStart = FEATURES.seasonStartDate;
  const seasonLabel = seasonStart
    ? `${Number(seasonStart.slice(5, 7))}월 ${Number(seasonStart.slice(8, 10))}일`
    : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:px-6">
      {/* 페이지 상단: 제목 및 기록하기 버튼 */}
      <PageHeader
        eyebrow="나의 통독 현황"
        title="오늘의 대시보드"
        description={
          <span className="font-serif">
            &ldquo;주의 말씀은 내 발에 등이요 내 길에 빛이니이다&rdquo; — 시편 119:105
          </span>
        }
        action={
          <Link href="/record" className="btn btn-primary w-full md:w-auto">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
            기록 입력
          </Link>
        }
      />

      {seasonLabel && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted">
          <span className="material-symbols-outlined text-[16px] text-teal">info</span>
          {seasonLabel} 시즌부터 읽은 기록이 집계됩니다.
        </p>
      )}

      {/* 메인 대시보드 그리드 (Bento Grid 스타일) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">

        {/* 왼쪽 섹션: 오늘 나의 읽기 진도 (원형 프로그레스) */}
        <section className={`${FEATURES.enableTeamFeatures ? "md:col-span-5 lg:col-span-4" : "md:col-span-6 lg:col-span-5"} card relative overflow-hidden p-6`}>
          <span className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-teal-soft" />
          <h3 className="relative mb-6 text-[17px] font-bold text-ink">
            나의 진행 현황
          </h3>
          <CircularProgress
            percent={dashboard.todayPercent}
            todayChapters={dashboard.todayChapters}
            dailyGoal={dashboard.dailyGoal}
            totalFullReads={dashboard.totalFullReads}
            currentCycleChapters={dashboard.currentCycleChapters}
          />
        </section>

        {/* 중앙 섹션: 주간 요일별 막대 차트 */}
        <section className={`${FEATURES.enableTeamFeatures ? "md:col-span-7 lg:col-span-5" : "md:col-span-6 lg:col-span-7"} card flex flex-col p-6`}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-ink">
              주간 요약
            </h3>
            <span className="chip bg-teal-soft text-teal-deep">
              읽은 장 수
            </span>
          </div>
          <WeeklyBarChart
            weeklyChapters={dashboard.weeklyChapters}
            todayDayIndex={todayDayIndex}
          />
        </section>

        {/* 오른쪽 섹션: 팀 순위 및 요약 정보 */}
        {FEATURES.enableTeamFeatures && (
          <div className="flex flex-col gap-4 md:col-span-12 lg:col-span-3">
            {/* 팀 순위 카드 */}
            <section className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[1.25rem] bg-brand p-6 text-white shadow-brand">
              <span className="hope-arc -right-14 -bottom-24 h-60 w-60 text-white/15" />
              <span className="hope-arc -right-4 -bottom-12 h-36 w-36 text-white/10" />
              <span className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-teal/30 blur-3xl" />
              <div className="relative">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-white/90" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emoji_events
                  </span>
                  <h3 className="text-[13px] font-semibold tracking-[0.08em] text-white/80">
                    우리 팀 순위
                  </h3>
                </div>
                <p className="mb-4 text-[13px] text-white/70">
                  {teamName ?? "팀 미배정"}
                </p>
              </div>
              <div className="relative flex items-baseline gap-2">
                <span className="text-[44px] leading-none font-extrabold tracking-tight">
                  {dashboard.teamRank ? `${dashboard.teamRank}위` : "-"}
                </span>
              </div>
              <div className="relative mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                <div>
                  <p className="text-[11px] text-white/70">
                    {userName}
                  </p>
                  <p className="text-[14px] font-semibold">
                    오늘 {dashboard.todayChapters}장
                  </p>
                </div>
                <Link
                  href="/ranking"
                  className="-mr-2 flex min-h-11 items-center gap-0.5 rounded-xl px-2 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  전체 순위
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </section>

            {/* 간편 기록 바로가기 */}
            <Link
              href="/record"
              className="card group flex items-center justify-between p-4 transition-colors hover:bg-sunken"
            >
              <div>
                <p className="eyebrow mb-0.5">
                  오늘 읽기 기록
                </p>
                <h4 className="text-[15px] font-bold text-ink">
                  새 기록 추가
                </h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 미독/누락된 장 목록 섹션 */}
      <UnreadChaptersList
        unreadBooks={dashboard.unreadBooks}
        totalUnreadChaptersCount={dashboard.totalUnreadChaptersCount}
      />
    </div>
  );
}
