import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { getDailyVerse } from "@/src/shared/utils/dailyVerse";


export const metadata: Metadata = {
  title: "홈 — 새소망 성경 통독",
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

    const { data } = await supabase

      .from("reading_records")
      .select("start_chapter, end_chapter")
      .eq("user_id", user.id)
      .eq("read_at", todayStr);
    
    todayChapters = (data ?? []).reduce(
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

  return (
    <div className="max-w-screen-md mx-auto px-6 py-8 flex flex-col gap-6">
      {/* 환영 섹션 */}
      <section className="relative overflow-hidden rounded-xl bg-[#f5f3ef] shadow-[0_4px_12px_rgba(26,38,63,0.05)]">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80')" }}
        />
        <div className="relative p-6 z-10">
          <p className="text-[#45474d] mb-1" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
            {greeting}
          </p>
          <h2 className="text-[#041129]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}>
            {user ? "환영합니다!" : "로그인하고 시작하세요!"}
          </h2>
        </div>
      </section>

      {/* 팀 가입 안내 (팀이 없는 경우) */}
      {user && !teamId && (
        <section className="bg-[#fffbeb] rounded-xl p-6 border-2 border-[#fcd34d] shadow-sm flex flex-col gap-4 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#775a19] text-3xl">group_add</span>
            <div>
              <h3 className="text-[#775a19] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>아직 소속된 팀이 없네요!</h3>
              <p className="text-[#78350f] text-sm" style={{ fontFamily: "Noto Serif KR, serif" }}>함께 읽으면 더 끝까지 완주할 수 있습니다.</p>
            </div>
          </div>
          <Link 
            href="/team"
            className="bg-[#775a19] text-white py-3 rounded-lg font-bold text-center hover:bg-[#5d4614] transition-colors shadow-md"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            팀 만들기 또는 가입하기
          </Link>
        </section>
      )}

      {/* 오늘의 말씀 */}

      <section className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(26,38,63,0.05)] border border-[#e4e2de]">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#775a19]" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <span className="text-[#775a19]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
            오늘의 말씀
          </span>
        </div>
        <blockquote
          className="text-[#1b1c1a] mb-4 italic"
          style={{ fontFamily: "Noto Serif KR, serif", fontSize: "18px", lineHeight: "32px" }}
        >
          &ldquo;{dailyVerse.text}&rdquo;
        </blockquote>
        <p
          className="text-[#45474d] text-right"
          style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}
        >
          {dailyVerse.ref}
        </p>
      </section>


      {/* 오늘 목표 진도 */}
      {user && (
        <section className="bg-[#f5f3ef] rounded-xl p-6 shadow-[0_4px_12px_rgba(26,38,63,0.05)] flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-[#1b1c1a] mb-1" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
                오늘의 목표
              </h3>
              <p className="text-[#45474d]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                {dailyGoal}장 중 {todayChapters}장 읽음
              </p>

            </div>
            <span className="text-[#041129]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
              {percent}%
            </span>
          </div>
          <div className="w-full bg-[#e4e2de] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#775a19] h-full rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>
      )}

      {/* 빠른 액션 */}
      <section className="grid grid-cols-2 gap-4">
        <Link
          href="/record"
          className="bg-[#041129] text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(26,38,63,0.05)] hover:bg-[#1a263f] active:scale-95 transition-all duration-200 h-24"
        >
          <span className="material-symbols-outlined">edit_document</span>
          <span style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
            성경 기록하기
          </span>
        </Link>
        <Link
          href="/ranking"
          className="bg-white text-[#041129] border border-[#c5c6ce] rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(26,38,63,0.05)] hover:bg-[#f5f3ef] active:scale-95 transition-all duration-200 h-24"
        >
          <span className="material-symbols-outlined">leaderboard</span>
          <span style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
            팀 랭킹 확인
          </span>
        </Link>
      </section>
    </div>
  );
}
