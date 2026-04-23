import type { Metadata } from "next";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { GetRankingUseCase } from "@/src/application/use-cases/GetRankingUseCase";

export const metadata: Metadata = {
  title: "팀 랭킹 — 새소망 성경 통독",
  description: "새소망교회 팀별 성경 통독 랭킹을 확인하세요.",
};

const RANK_COLORS = [
  "text-[#775a19]",  // 1위
  "text-[#45474d]",  // 2위
  "text-[#45474d]",  // 3위+
];

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("name, teams(name)").eq("id", user.id).single()
    : { data: null };

  const teamName = (profile?.teams as unknown as { name: string } | null)?.name ?? null;

  const repo = new SupabaseReadingRecordRepository(supabase);
  const useCase = new GetRankingUseCase(repo);
  const ranking = await useCase.execute(teamName);

  // 내 기여도 (오늘 읽은 장 수)
  let myChapters = 0;
  if (user) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const { data } = await supabase
      .from("reading_records")
      .select("start_chapter, end_chapter")
      .eq("user_id", user.id)
      .eq("read_at", todayStr);
    myChapters = (data ?? []).reduce(
      (s: number, r: { start_chapter: number; end_chapter: number }) =>
        s + (r.end_chapter - r.start_chapter + 1),
      0,
    );
  }

  const topChapters = ranking[0]?.totalChapters ?? 1;
  const myTeamItem = ranking.find((r) => r.isMyTeam);

  return (
    <div className="pt-8 pb-10 px-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
        >
          팀 랭킹
        </h2>
        <p className="text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "24px" }}>
          말씀을 향한 공동체의 헌신을 기뻐합니다.
        </p>
      </div>

      {/* 내 기여도 카드 */}
      {user && (
        <section className="bg-[#efeeea] rounded-xl p-4 shadow-[0_4px_12px_rgba(4,17,41,0.05)] relative overflow-hidden border border-[#c5c6ce]/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e9c176]/20 rounded-full blur-2xl pointer-events-none" />
          <h3
            className="text-[#1b1c1a] mb-4 relative z-10"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
          >
            나의 기여도
          </h3>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#fed488] flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
              <span
                className="text-[#785a1a]"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
              >
                {myChapters}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[#45474d]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
                오늘 읽은 장 수
              </p>
              {teamName && (
                <p className="text-[#75777e] mt-1" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                  <span className="font-medium text-[#041129]">{teamName}</span>에 기여 중
                </p>
              )}
            </div>
            {myTeamItem && (
              <div className="text-right">
                <p
                  className="text-[#041129]"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
                >
                  {myTeamItem.rank}위
                </p>
                <p className="text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                  팀 순위
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 랭킹 리스트 */}
      <section className="flex flex-col gap-3">
        {ranking.length === 0 ? (
          <div className="text-center py-12 text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
            아직 기록된 팀이 없습니다.
          </div>
        ) : (
          ranking.map((item) => {
            const pct = Math.round((item.totalChapters / topChapters) * 100);
            const colorClass = RANK_COLORS[Math.min(item.rank - 1, 2)];

            return (
              <div
                key={item.teamId}
                className={`flex items-center gap-4 p-4 rounded-lg shadow-sm relative overflow-hidden ${
                  item.isMyTeam
                    ? "bg-[#fed488]/20 border border-[#775a19]/30"
                    : "bg-[#f5f3ef] border border-[#c5c6ce]/10"
                }`}
              >
                {item.isMyTeam && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#775a19]" />
                )}
                {/* 순위 */}
                <div className="w-8 flex justify-center flex-shrink-0">
                  <span
                    className={colorClass}
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
                  >
                    {item.rank}
                  </span>
                </div>
                {/* 팀 정보 + 바 */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${item.isMyTeam ? "font-bold text-[#1b1c1a]" : "text-[#1b1c1a]"}`}
                        style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: item.isMyTeam ? 700 : 500 }}
                      >
                        {item.teamName}
                      </span>
                      {item.isMyTeam && (
                        <span
                          className="bg-[#775a19] text-white px-2 py-0.5 rounded-full leading-tight"
                          style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px" }}
                        >
                          우리 팀
                        </span>
                      )}
                    </div>
                    <span
                      className={item.isMyTeam ? "text-[#775a19] font-medium" : "text-[#45474d]"}
                      style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
                    >
                      {item.totalChapters} 장
                    </span>
                  </div>
                  <div className="w-full bg-[#dbdad6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.isMyTeam ? "bg-[#775a19]" : "bg-[#1a263f]/60"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
