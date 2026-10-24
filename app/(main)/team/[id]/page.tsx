import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { TeamChat } from "@/src/presentation/components/team/TeamChat";
import { ActivityFeed } from "@/src/presentation/components/team/ActivityFeed";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { FEATURES } from "@/lib/constants/features";

/**
 * 팀 이름을 기반으로 동적 메타데이터를 생성합니다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase.from("teams").select("name").eq("id", id).single();
  return {
    title: team?.name ?? "팀",
    description: `${team?.name} 팀의 최근 읽기 현황과 응원 채팅`,
  };
}

// 실시간 데이터 반영을 위해 동적 렌더링 강제
export const dynamic = "force-dynamic";


export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: teamId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. 팀 기본 정보 조회
  const { data: team } = await supabase
    .from("teams")
    .select("id, name, leader_id")
    .eq("id", teamId)
    .single();
  if (!team) notFound();

  // 2. 내 프로필 정보 조회 (내가 이 팀 소속인지 확인용)
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("name, team_id")
    .eq("id", user.id)
    .single();
  const isMyTeam = myProfile?.team_id === teamId;

  // 3. 팀 전체 진행 통계 계산 (저장소 활용)
  const repo = new SupabaseReadingRecordRepository(supabase);
  const teamCounts = await repo.getTeamChapterCounts(FEATURES.seasonStartDate);
  const teamData = teamCounts.find((t) => t.teamId === teamId);
  const totalChapters = teamData?.totalChapters ?? 0;
  
  // 4. 팀원별 개별 진행 현황 조회 (중요!)
  // RPC 함수인 'get_member_chapter_counts'를 호출하여 각 멤버의 읽은 장 수를 가져옵니다.
  let memberProgress = await repo.getMemberChapterCounts(teamId, FEATURES.seasonStartDate);

  // [백업 로직] RPC 함수가 아직 설치되지 않았거나 오류가 난 경우를 대비해 
  // 프로필 테이블에서 직접 팀원 목록이라도 가져오도록 설계했습니다.
  if (memberProgress.length === 0) {
    const { data: fallbackMembers } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("team_id", teamId)
      .order("created_at");
    
    if (fallbackMembers) {
      memberProgress = fallbackMembers.map(m => ({
        userId: m.id,
        userName: m.name,
        totalChapters: 0,
        fullReadCount: 0,
        currentChapters: 0
      }));
    }
  }

  // 5. 최근 읽기 기록 조회 (팀원 전체 통합 피드)
  const memberIds = memberProgress.map((m) => m.userId);
  let activities: {
    id: string;
    user_name: string;
    book_id: string;
    start_chapter: number;
    end_chapter: number;
    read_at: string;
    created_at: string;
  }[] = [];

  if (memberIds.length > 0) {
    // 팀원들의 기록을 최신순으로 20개 가져옴
    let recordsQuery = supabase
      .from("reading_records")
      .select("id, user_id, book_id, start_chapter, end_chapter, read_at, created_at")
      .in("user_id", memberIds);
    if (FEATURES.seasonStartDate) recordsQuery = recordsQuery.gte("read_at", FEATURES.seasonStartDate);
    const { data: records } = await recordsQuery
      .order("created_at", { ascending: false })
      .limit(20);

    // 기록에 해당하는 사용자 이름을 매칭
    activities = (records ?? []).map((r) => ({
      id: r.id,
      user_name: memberProgress.find((m) => m.userId === r.user_id)?.userName ?? "알 수 없음",
      book_id: r.book_id,
      start_chapter: r.start_chapter,
      end_chapter: r.end_chapter,
      read_at: r.read_at,
      created_at: r.created_at,
    }));
  }

  // 6. 응원 채팅 메시지 초기 로드 (최신 50개)
  const { data: rawMessages } = await supabase
    .from("team_messages")
    .select("id, content, created_at, user_id, profiles(name)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true })
    .limit(50);

  const initialMessages = (rawMessages ?? []).map((m) => ({
    id: m.id,
    content: m.content,
    created_at: m.created_at,
    user_id: m.user_id,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }));

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-8 px-4 py-6 md:px-6">
      {/* 팀 상단 정보 섹션 (히어로) */}
      <section className="relative overflow-hidden rounded-[1.5rem] bg-brand p-6 text-white shadow-brand">
        <span className="hope-arc -right-16 -bottom-28 h-72 w-72 text-white/15" />
        <span className="hope-arc -right-6 -bottom-16 h-48 w-48 text-white/10" />
        <span className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-teal/30 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70">
                {isMyTeam ? "우리 팀" : "팀"}
              </span>
              <h2 className="break-words text-[26px] font-bold leading-tight tracking-tight">{team.name}</h2>
              <p className="text-[13px] text-white/70">말씀 안에서 함께 성장합니다.</p>
            </div>
            {/* 팀 멤버인 경우에만 관리 버튼 노출 */}
            {isMyTeam && (
              <Link
                href="/team/manage"
                className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-white/10 px-3 text-[13px] font-semibold ring-1 ring-white/20 transition-colors hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                팀 관리
              </Link>
            )}
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[12px] font-medium text-white/70">
                {FEATURES.seasonStartDate ? "이번 시즌 팀 누적" : "팀 누적"}
              </span>
              <p className="text-[32px] font-extrabold leading-none tracking-tight">
                {totalChapters.toLocaleString()}
                <span className="ml-1 text-[16px] font-bold text-white/80">장</span>
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/20">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-white/70">팀원</span>
              <span className="text-[20px] font-extrabold">{memberProgress.length}명</span>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 섹션: 팀원별 개인별 진행율 게이지 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <h3 className="text-[18px] font-bold text-ink">팀원별 현황</h3>
          <span className="text-[13px] text-muted">{memberProgress.length}명 활동 중</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {memberProgress.map((m) => {
            // 개인별 진척도 계산 (현재 독 진행 장수 기준)
            const memberPct = Math.min(100, Math.round((m.currentChapters / 1189) * 100));
            const isMe = m.userId === user.id;

            return (
              <div
                key={m.userId}
                className={`rounded-[1.25rem] border p-4 ${
                  isMe ? "border-brand/40 bg-brand-soft shadow-card" : "card"
                }`}
              >
                {/* 팀원 이름 및 퍼센트 */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                        isMe ? "bg-brand text-white" : "bg-sunken text-ink-soft"
                      }`}
                    >
                      {m.userName.charAt(0)}
                    </div>
                    <span className={`truncate text-[15px] font-bold ${isMe ? "text-brand-ink" : "text-ink"}`}>
                      {m.userName} {isMe && <span className="font-semibold text-brand">(나)</span>}
                    </span>
                    {m.fullReadCount >= 0 && (
                      <span className="chip shrink-0 bg-teal-soft px-2 py-0.5 text-[11px] text-teal-deep">
                        {m.fullReadCount}독
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[18px] font-extrabold text-teal">{memberPct}%</span>
                </div>

                {/* 진행율 바 */}
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${memberPct}%` }} />
                </div>

                {/* 남은 분량 수치 */}
                <div className="mt-2 flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-muted">완독까지 {1189 - m.currentChapters}장 남음</span>
                  <span className="font-medium text-ink-soft">
                    {m.currentChapters} / 1,189장
                    <span className="ml-1 font-normal text-subtle">(총 {m.totalChapters}장)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 최근 읽기 활동 피드 섹션 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[18px] font-bold text-ink">최근 읽기</h3>
        <ActivityFeed activities={activities} />
      </section>

      {/* 팀원 응원 실시간 채팅 섹션 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[18px] font-bold text-ink">응원하기</h3>
        {isMyTeam ? (
          <TeamChat
            teamId={teamId}
            myUserId={user.id}
            myName={myProfile?.name ?? "나"}
            initialMessages={initialMessages as Parameters<typeof TeamChat>[0]["initialMessages"]}
          />
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-sunken p-5 text-center text-[14px] text-muted">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            이 팀의 멤버만 채팅에 참여할 수 있습니다.
          </div>
        )}
      </section>
    </div>
  );
}
