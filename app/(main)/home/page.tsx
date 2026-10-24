import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { getDailyVerse } from "@/src/shared/utils/dailyVerse";
import { FEATURES } from "@/lib/constants/features";


export const metadata: Metadata = {
  title: "홈",
  description: "오늘의 성경 읽기 현황을 확인하세요.",
};

export const dynamic = "force-dynamic";


export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 오늘 읽은 장 수 조회
  let todayChapters = 0;
  // 사용자 프로필 및 팀 정보 조회 (하루 목표 포함)
  let teamId = null;
  let dailyGoal = 4;
  let fullReadCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id, daily_goal")
      .eq("id", user.id)
      .single();
    teamId = profile?.team_id;
    dailyGoal = profile?.daily_goal ?? 4;

    const kstParts = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Seoul",
    }).formatToParts(new Date());
    
    const y = kstParts.find(p => p.type === "year")?.value;
    const m = kstParts.find(p => p.type === "month")?.value;
    const d = kstParts.find(p => p.type === "day")?.value;
    const todayStr = `${y}-${m}-${d}`;

    let recordsQuery = supabase
      .from("reading_records")
      .select("start_chapter, end_chapter, read_at")
      .eq("user_id", user.id);
    if (FEATURES.seasonStartDate) recordsQuery = recordsQuery.gte("read_at", FEATURES.seasonStartDate);
    const { data: allRecords } = await recordsQuery;
    
    const totalChapters = (allRecords ?? []).reduce(
      (s: number, r: { start_chapter: number; end_chapter: number }) =>
        s + (r.end_chapter - r.start_chapter + 1),
      0,
    );
    fullReadCount = Math.floor(totalChapters / 1189);

    todayChapters = (allRecords ?? [])
      .filter(r => r.read_at === todayStr)
      .reduce(
        (s: number, r: { start_chapter: number; end_chapter: number }) =>
          s + (r.end_chapter - r.start_chapter + 1),
        0,
      );
  }
  const percent = Math.min(100, Math.round((todayChapters / dailyGoal) * 100));


  
  const kstHour = Number(new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(new Date()).replace("시", ""));

  const greeting =
    kstHour >= 0 && kstHour < 6 ? "평안한 밤 보내고 계신가요?" :
    kstHour >= 6 && kstHour < 12 ? "오늘도 말씀과 함께 활기찬 하루 되세요!" :
    kstHour >= 12 && kstHour < 18 ? "말씀으로 새 힘을 얻는 오후입니다." :
    "오늘 하루도 말씀 안에서 수고 많으셨습니다.";


  const dailyVerse = getDailyVerse();

  // 새 시즌 안내 (시즌 시작 전이면 D-day, 시작 후 7일간은 시작 안내)
  const seasonStart = FEATURES.seasonStartDate;
  const todayKst = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const seasonDday = seasonStart
    ? Math.round((Date.parse(seasonStart) - Date.parse(todayKst)) / 86_400_000)
    : null;
  const seasonLabel = seasonStart
    ? `${Number(seasonStart.slice(5, 7))}월 ${Number(seasonStart.slice(8, 10))}일`
    : "";

  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-5 px-4 py-6 md:px-6">
      {/* 환영 섹션 */}
      {user ? (
        <section className="relative overflow-hidden rounded-[1.5rem] bg-brand p-7 text-white shadow-brand">
          <span className="hope-arc -right-16 -bottom-28 h-72 w-72 text-white/15" />
          <span className="hope-arc -right-6 -bottom-16 h-48 w-48 text-white/10" />
          <span className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-teal/30 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium text-white/70">{greeting}</p>
              <h2 className="text-[26px] font-bold tracking-tight">환영합니다!</h2>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/20 backdrop-blur-sm">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-white/70">이번 시즌</span>
              <span className="text-[22px] font-extrabold">{fullReadCount}독</span>
            </div>
          </div>
        </section>
      ) : (
        <Link
          href="/login"
          className="group relative overflow-hidden rounded-[1.5rem] bg-brand p-7 text-white shadow-brand transition-transform active:scale-[0.99]"
        >
          <span className="hope-arc -right-16 -bottom-28 h-72 w-72 text-white/15" />
          <div className="relative flex flex-col gap-1.5">
            <p className="text-[13px] font-medium text-white/70">새소망 성경 통독</p>
            <h2 className="flex items-center gap-2 text-[26px] font-bold tracking-tight">
              로그인하고 시작하세요
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </h2>
          </div>
        </Link>
      )}

      {/* 새 시즌 안내 */}
      {seasonDday !== null && seasonDday > -7 && (
        <section className="flex items-center gap-4 rounded-[1.25rem] border border-teal/20 bg-teal-tint p-5">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal text-white">
            <span className="text-[10px] font-semibold leading-none opacity-80">D</span>
            <span className="text-[17px] font-extrabold leading-tight">
              {seasonDday > 0 ? `-${seasonDday}` : "Day"}
            </span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-teal-deep">
              {seasonDday > 0 ? `${seasonLabel}, 팀별 통독이 새롭게 시작됩니다` : "팀별 통독 새 시즌이 시작되었습니다"}
            </h3>
            <p className="mt-0.5 text-[13px] text-muted">
              {seasonLabel}부터 읽은 기록이 진도와 랭킹에 반영됩니다.
            </p>
          </div>
        </section>
      )}

      {/* 팀 가입 안내 (팀이 없는 경우) */}
      {FEATURES.enableTeamFeatures && user && !teamId && (
        <section className="card flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ink">아직 소속된 팀이 없네요</h3>
              <p className="text-[13px] text-muted">함께 읽으면 끝까지 완주할 수 있습니다.</p>
            </div>
          </div>
          <Link href="/team" className="btn btn-primary w-full">
            팀 만들기 또는 가입하기
          </Link>
        </section>
      )}

      {/* 오늘의 말씀 */}
      <section className="card relative overflow-hidden p-6">
        <span className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-brand to-teal" />
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-brand" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_stories
          </span>
          <span className="eyebrow text-brand">오늘의 말씀</span>
        </div>
        <blockquote className="verse text-[18px]">
          &ldquo;{dailyVerse.text}&rdquo;
        </blockquote>
        <p className="mt-3 text-right font-serif text-[14px] text-muted">
          {dailyVerse.ref}
        </p>
      </section>

      {/* 오늘 목표 진도 */}
      {user && (
        <section className="card flex flex-col gap-4 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-ink">오늘의 목표</h3>
              <p className="mt-0.5 text-[13px] text-muted">
                {dailyGoal}장 중 <span className="font-semibold text-teal-deep">{todayChapters}장</span> 읽음
              </p>
            </div>
            <span className="text-[28px] font-extrabold tracking-tight text-teal">
              {percent}<span className="text-[16px] font-bold">%</span>
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </section>
      )}

      {/* 빠른 액션 */}
      <section className={`grid ${FEATURES.enableRanking ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
        <Link
          href="/record"
          className="group flex h-32 flex-col justify-between rounded-[1.25rem] bg-ink p-5 text-white shadow-lift transition-colors hover:bg-ink-soft"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <span className="material-symbols-outlined text-[22px]">edit_note</span>
          </span>
          <span className="flex items-center justify-between text-[15px] font-semibold">
            성경 기록하기
            <span className="material-symbols-outlined text-[18px] opacity-60 transition-transform group-hover:translate-x-0.5">arrow_forward</span>
          </span>
        </Link>
        {FEATURES.enableRanking && (
          <Link
            href="/ranking"
            className="card group flex h-32 flex-col justify-between p-5 transition-colors hover:bg-sunken"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-soft text-teal-deep">
              <span className="material-symbols-outlined text-[22px]">trophy</span>
            </span>
            <span className="flex items-center justify-between text-[15px] font-semibold text-ink">
              {FEATURES.enableTeamFeatures ? "팀 랭킹 확인" : "통독 랭킹 확인"}
              <span className="material-symbols-outlined text-[18px] text-subtle transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </span>
          </Link>
        )}
      </section>
    </div>
  );
}
