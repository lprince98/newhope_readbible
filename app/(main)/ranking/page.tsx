import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { GetRankingUseCase } from "@/src/application/use-cases/GetRankingUseCase";
import { GetIndividualRankingUseCase } from "@/src/application/use-cases/GetIndividualRankingUseCase";

export const metadata: Metadata = {
  title: "통독 랭킹 — 새소망 성경 통독",
  description: "새소망교회 팀별 및 개인별 성경 통독 랭킹을 확인하세요.",
};

export const dynamic = "force-dynamic";

const RANK_COLORS = [
  "text-[#775a19]",  // 1위
  "text-[#45474d]",  // 2위
  "text-[#45474d]",  // 3위+
];

export default async function RankingPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const params = await props.searchParams;
  const currentTab = params?.tab === "individual" ? "individual" : "team";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("name, teams(name)").eq("id", user.id).single()
    : { data: null };

  const teamName = (profile?.teams as unknown as { name: string } | null)?.name ?? null;

  const repo = new SupabaseReadingRecordRepository(supabase);
  
  // 팀 랭킹 데이터
  const teamUseCase = new GetRankingUseCase(repo);
  const teamRanking = await teamUseCase.execute(teamName);

  // 개인 랭킹 데이터
  const individualUseCase = new GetIndividualRankingUseCase(repo);
  const individualRanking = await individualUseCase.execute(user?.id ?? null);

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

  const topTeamChapters = teamRanking[0]?.totalChapters ?? 1;
  const myTeamItem = teamRanking.find((r) => r.isMyTeam);
  
  const topIndividualChapters = individualRanking[0]?.totalChapters ?? 1;
  const myIndividualItem = individualRanking.find((r) => r.isMe);

  return (
    <div className="pt-8 pb-10 px-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
        >
          통독 랭킹
        </h2>
        <p className="text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "24px" }}>
          말씀을 향한 공동체의 헌신을 기뻐합니다.
        </p>
      </div>

      {/* 탭 버튼 */}
      <div className="flex bg-[#efeeea] p-1 rounded-lg">
        <Link 
          href="/ranking?tab=team" 
          className={`flex-1 text-center py-2.5 rounded-md text-[15px] font-semibold transition-all duration-200 ${
            currentTab === "team" ? "bg-white text-[#1b1c1a] shadow-[0_2px_8px_rgba(4,17,41,0.08)]" : "text-[#75777e] hover:text-[#45474d]"
          }`}
        >
          팀 랭킹
        </Link>
        <Link 
          href="/ranking?tab=individual" 
          className={`flex-1 text-center py-2.5 rounded-md text-[15px] font-semibold transition-all duration-200 ${
            currentTab === "individual" ? "bg-white text-[#1b1c1a] shadow-[0_2px_8px_rgba(4,17,41,0.08)]" : "text-[#75777e] hover:text-[#45474d]"
          }`}
        >
          개인 Top 10
        </Link>
      </div>

      {/* 내 기여도 카드 */}
      {user && (
        <section className="bg-[#efeeea] rounded-xl p-4 shadow-[0_4px_12px_rgba(4,17,41,0.05)] relative overflow-hidden border border-[#c5c6ce]/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e9c176]/20 rounded-full blur-2xl pointer-events-none" />
          <h3
            className="text-[#1b1c1a] mb-4 relative z-10"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
          >
            나의 현황
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
            
            {/* 현재 선택된 탭에 따라 내 랭킹 정보 변경 */}
            {currentTab === "team" && myTeamItem ? (
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
            ) : currentTab === "individual" && myIndividualItem ? (
              <div className="text-right">
                <p
                  className="text-[#041129]"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
                >
                  {myIndividualItem.rank}위
                </p>
                <p className="text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                  전체 순위
                </p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* 랭킹 리스트 */}
      <section className="flex flex-col gap-3">
        {currentTab === "team" ? (
          /* 팀 랭킹 */
          teamRanking.length === 0 ? (
            <div className="text-center py-12 text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
              아직 기록된 팀이 없습니다.
            </div>
          ) : (
            teamRanking.map((item) => {
              const pct = Math.round((item.totalChapters / topTeamChapters) * 100);
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
          )
        ) : (
          /* 개인 랭킹 */
          individualRanking.length === 0 ? (
            <div className="text-center py-12 text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
              아직 기록된 개인이 없습니다.
            </div>
          ) : (
            individualRanking.map((item) => {
              const pct = Math.round((item.totalChapters / topIndividualChapters) * 100);
              const colorClass = RANK_COLORS[Math.min(item.rank - 1, 2)];

              return (
                <div
                  key={item.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg shadow-sm relative overflow-hidden ${
                    item.isMe
                      ? "bg-[#e2eaf5] border border-[#2a5b9e]/30"
                      : "bg-[#f5f3ef] border border-[#c5c6ce]/10"
                  }`}
                >
                  {item.isMe && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2a5b9e]" />
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
                  {/* 개인 정보 + 바 */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${item.isMe ? "font-bold text-[#1b1c1a]" : "text-[#1b1c1a]"}`}
                          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: item.isMe ? 700 : 500 }}
                        >
                          {item.userName}
                        </span>
                        {item.teamName && (
                          <span
                            className="text-[#75777e]"
                            style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px" }}
                          >
                            {item.teamName}
                          </span>
                        )}
                        {item.isMe && (
                          <span
                            className="bg-[#2a5b9e] text-white px-2 py-0.5 rounded-full leading-tight"
                            style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px" }}
                          >
                            나
                          </span>
                        )}
                      </div>
                      <span
                        className={item.isMe ? "text-[#2a5b9e] font-medium" : "text-[#45474d]"}
                        style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
                      >
                        {item.totalChapters} 장
                      </span>
                    </div>
                    <div className="w-full bg-[#dbdad6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.isMe ? "bg-[#2a5b9e]" : "bg-[#1a263f]/60"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </section>
    </div>
  );
}
