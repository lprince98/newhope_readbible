import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { GetRankingUseCase } from "@/src/application/use-cases/GetRankingUseCase";
import { GetIndividualRankingUseCase } from "@/src/application/use-cases/GetIndividualRankingUseCase";
import { FEATURES } from "@/lib/constants/features";
import { PageHeader } from "@/src/presentation/components/common/PageHeader";

export const metadata: Metadata = {
  title: "통독 랭킹",
  description: "새소망교회 팀별 및 개인별 성경 통독 랭킹을 확인하세요.",
};

export const dynamic = "force-dynamic";

/** 순위 메달 칩: 1위 금, 2위 은, 3위 동(차분한 톤), 4위 이하는 숫자만 */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft text-[16px] font-extrabold text-gold ring-1 ring-gold/30">
        {rank}
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-silver/30 text-[16px] font-extrabold text-ink-soft ring-1 ring-silver">
        {rank}
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sunken text-[16px] font-extrabold text-muted ring-1 ring-muted/30">
        {rank}
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center text-[16px] font-bold text-subtle">
      {rank}
    </span>
  );
}

/** 순위별 행 스타일 (나/우리 팀 > 상위 3위 > 일반) */
function rowClass(rank: number, highlighted: boolean) {
  if (highlighted) return "border-brand/40 bg-brand-soft shadow-card";
  if (rank === 1) return "border-gold/30 bg-card shadow-card";
  if (rank <= 3) return "border-line bg-card shadow-card";
  return "border-line bg-card";
}

export default async function RankingPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const params = await props.searchParams;
  const currentTab = FEATURES.enableTeamFeatures
    ? (params?.tab === "individual" ? "individual" : "team")
    : "individual";

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
    myChapters = (data ?? []).reduce(
      (s: number, r: { start_chapter: number; end_chapter: number }) =>
        s + (r.end_chapter - r.start_chapter + 1),
      0,
    );
  }

  const topTeamChapters = teamRanking[0]?.totalChapters || 1;
  const myTeamItem = teamRanking.find((r) => r.isMyTeam);
  
  const myIndividualItem = individualRanking.find((r) => r.isMe);


  // 시즌 집계 안내 문구 (시즌 시작일이 없으면 표시하지 않음)
  const seasonStart = FEATURES.seasonStartDate;
  const seasonNote = seasonStart
    ? `${seasonStart.slice(0, 4)}년 ${Number(seasonStart.slice(5, 7))}월 ${Number(seasonStart.slice(8, 10))}일 시즌부터 집계`
    : null;

  const tabClass = (active: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded-xl text-[15px] font-semibold transition-all duration-200 ${
      active ? "bg-card text-ink shadow-card" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 md:px-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-3">
        <PageHeader
          eyebrow="랭킹"
          title="통독 랭킹"
          description="말씀을 향한 공동체의 헌신을 기뻐합니다."
        />
        {seasonNote && (
          <span className="chip self-start bg-teal-soft text-teal-deep">
            <span className="material-symbols-outlined text-[16px]">event</span>
            {seasonNote}
          </span>
        )}
      </div>

      {/* 탭 버튼 */}
      {FEATURES.enableTeamFeatures && (
        <nav className="flex gap-1 rounded-2xl bg-sunken p-1" aria-label="랭킹 종류">
          <Link
            href="/ranking?tab=team"
            className={tabClass(currentTab === "team")}
            aria-current={currentTab === "team" ? "page" : undefined}
          >
            팀 랭킹
          </Link>
          <Link
            href="/ranking?tab=individual"
            className={tabClass(currentTab === "individual")}
            aria-current={currentTab === "individual" ? "page" : undefined}
          >
            개인 Top 10
          </Link>
        </nav>
      )}

      {/* 내 기여도 카드 */}
      {user && (
        <section className="relative overflow-hidden rounded-[1.25rem] bg-brand p-5 text-white shadow-brand">
          <span className="hope-arc -right-14 -bottom-24 h-56 w-56 text-white/15" />
          <span className="hope-arc -right-4 -bottom-14 h-36 w-36 text-white/10" />
          <h3 className="relative mb-4 text-[13px] font-semibold tracking-[0.08em] text-white/70">
            나의 현황
          </h3>
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <span className="text-[24px] font-extrabold leading-none">{myChapters}</span>
              <span className="mt-0.5 text-[10px] font-semibold text-white/70">장</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">오늘 읽은 장 수</p>
              {FEATURES.enableTeamFeatures && teamName && (
                <p className="mt-0.5 truncate text-[13px] text-white/70">
                  <span className="font-semibold text-white">{teamName}</span>에 기여 중
                </p>
              )}
            </div>

            {/* 현재 선택된 탭에 따라 내 랭킹 정보 변경 */}
            {FEATURES.enableTeamFeatures && currentTab === "team" && myTeamItem ? (
              <div className="shrink-0 text-right">
                <p className="text-[24px] font-extrabold leading-tight">{myTeamItem.rank}위</p>
                <p className="text-[12px] text-white/70">팀 순위</p>
              </div>
            ) : currentTab === "individual" && myIndividualItem ? (
              <div className="shrink-0 text-right">
                <p className="text-[24px] font-extrabold leading-tight">{myIndividualItem.rank}위</p>
                <p className="text-[12px] text-white/70">전체 순위</p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* 랭킹 리스트 */}
      <section className="flex flex-col gap-2.5">
        {FEATURES.enableTeamFeatures && currentTab === "team" ? (
          /* 팀 랭킹 */
          teamRanking.length === 0 ? (
            <div className="card py-12 text-center text-[14px] text-muted">
              아직 기록된 팀이 없습니다.
            </div>
          ) : (
            teamRanking.map((item) => {
              const pct = Math.round((item.totalChapters / topTeamChapters) * 100);

              return (
                <div
                  key={item.teamId}
                  className={`flex items-center gap-3 rounded-[1.25rem] border p-4 ${rowClass(item.rank, item.isMyTeam)}`}
                >
                  {/* 순위 */}
                  <div className="shrink-0">
                    <RankBadge rank={item.rank} />
                  </div>
                  {/* 팀 정보 + 바 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className={`truncate text-[15px] ${item.isMyTeam ? "font-bold text-brand-ink" : "font-semibold text-ink"}`}>
                          {item.teamName}
                        </span>
                        {item.isMyTeam && (
                          <span className="chip shrink-0 bg-brand px-2 py-0.5 text-[11px] text-white">우리 팀</span>
                        )}
                      </div>
                      <span className={`shrink-0 text-[13px] ${item.isMyTeam ? "font-bold text-brand" : "font-medium text-muted"}`}>
                        {item.totalChapters}장
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* 개인 랭킹 */
          individualRanking.length === 0 ? (
            <div className="card py-12 text-center text-[14px] text-muted">
              아직 기록된 개인이 없습니다.
            </div>
          ) : (
            individualRanking.map((item) => {
              return (
                <div
                  key={item.userId}
                  className={`flex items-center gap-3 rounded-[1.25rem] border p-4 ${rowClass(item.rank, item.isMe)}`}
                >
                  {/* 순위 */}
                  <div className="shrink-0">
                    <RankBadge rank={item.rank} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className={`truncate text-[15px] ${item.isMe ? "font-bold text-brand-ink" : "font-semibold text-ink"}`}>
                          {item.userName}
                        </span>
                        {FEATURES.enableTeamFeatures && item.teamName && (
                          <span className="truncate text-[12px] text-subtle">{item.teamName}</span>
                        )}
                        {item.fullReadCount >= 0 && (
                          <span className="chip shrink-0 bg-teal-soft px-2 py-0.5 text-[11px] text-teal-deep">
                            {item.fullReadCount}독
                          </span>
                        )}
                        {item.isMe && (
                          <span className="chip shrink-0 bg-brand px-2 py-0.5 text-[11px] text-white">나</span>
                        )}
                      </div>
                      <span className={`shrink-0 text-[13px] ${item.isMe ? "font-bold text-brand" : "font-medium text-muted"}`}>
                        {item.currentChapters}
                        <span className="font-normal text-subtle"> / 1189장</span>
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.round((item.currentChapters / 1189) * 100)}%` }}
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
