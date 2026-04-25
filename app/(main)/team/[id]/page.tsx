import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { TeamChat } from "@/src/presentation/components/team/TeamChat";
import { ActivityFeed } from "@/src/presentation/components/team/ActivityFeed";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase.from("teams").select("name").eq("id", id).single();
  return {
    title: `${team?.name ?? "팀"} — 새소망 성경 통독`,
    description: `${team?.name} 팀의 최근 읽기 현황과 응원 채팅`,
  };
}

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

  // 팀 정보
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .single();
  if (!team) notFound();

  // 내 프로필
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("name, team_id")
    .eq("id", user.id)
    .single();
  const isMyTeam = myProfile?.team_id === teamId;

  // 팀 전체 장 수 집계
  const repo = new SupabaseReadingRecordRepository(supabase);
  const teamCounts = await repo.getTeamChapterCounts();
  const teamData = teamCounts.find((t) => t.teamId === teamId);
  const totalChapters = teamData?.totalChapters ?? 0;
  const TOTAL_BIBLE_CHAPTERS = 1189;
  const progressPct = Math.min(100, Math.round((totalChapters / TOTAL_BIBLE_CHAPTERS) * 100));

  // 팀원별 진행율 조회
  let memberProgress = await repo.getMemberChapterCounts(teamId);

  // [백업] RPC가 작동하지 않거나 결과가 없는 경우, 프로필 테이블에서 직접 팀원 목록 조회
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
        totalChapters: 0 // 진행율은 0으로 표시되더라도 이름은 나옴
      }));
    }
  }

  // 최근 읽기 기록 (팀원 전체, 최신 20개)
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
    const { data: records } = await supabase
      .from("reading_records")
      .select("id, user_id, book_id, start_chapter, end_chapter, read_at, created_at")
      .in("user_id", memberIds)
      .order("created_at", { ascending: false })
      .limit(20);

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

  // 채팅 메시지 초기 로드 (최신 50개)
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
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-10">
      {/* 팀 헤더 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}>
            {team.name}
          </h2>
          {isMyTeam && (
            <Link
              href="/team/manage"
              className="flex items-center gap-1 text-[#775a19] hover:text-[#041129] transition-colors"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px", fontWeight: 500 }}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              팀 관리
            </Link>
          )}
        </div>
        <p className="text-[#45474d]"
          style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}>
          말씀 안에서 함께 성장합니다.
        </p>
      </section>


      {/* 팀원별 진행율 (개인별 게이지로 변경) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "20px", fontWeight: 600 }}>
            팀원별 현황
          </h3>
          <span className="text-[#75777e] text-xs" style={{ fontFamily: "Manrope, sans-serif" }}>
            {memberProgress.length}명 활동 중
          </span>
        </div>
        
        <div className="flex flex-col gap-4">
          {memberProgress.map((m) => {
            const memberPct = Math.min(100, Math.round((m.totalChapters / 1189) * 100));
            const isMe = m.userId === user.id;

            return (
              <div key={m.userId} className={`p-4 rounded-2xl border transition-all ${
                isMe ? "bg-[#fffbeb] border-[#fed488] shadow-sm" : "bg-white border-[#e4e2de]"
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isMe ? "bg-[#775a19] text-white" : "bg-[#efeeea] text-[#75777e]"
                    }`}>
                      {m.userName.charAt(0)}
                    </div>
                    <span className={`font-bold ${isMe ? "text-[#775a19]" : "text-[#041129]"}`}
                      style={{ fontFamily: "Manrope, sans-serif", fontSize: "15px" }}>
                      {m.userName} {isMe && "(나)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#775a19] font-bold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {memberPct}%
                    </span>
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-[#efeeea] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isMe ? "bg-[#775a19]" : "bg-[#1a263f]/60"
                    }`}
                    style={{ width: `${memberPct}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] text-[#75777e]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    완독까지 {1189 - m.totalChapters}장 남음
                  </span>
                  <span className="text-[11px] font-medium text-[#45474d]" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {m.totalChapters} / 1,189장
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* 최근 읽기 활동 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
          최근 읽기
        </h3>
        <ActivityFeed activities={activities} />
      </section>

      {/* 응원 채팅 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
          응원하기
        </h3>
        {isMyTeam ? (
          <TeamChat
            teamId={teamId}
            myUserId={user.id}
            myName={myProfile?.name ?? "나"}
            initialMessages={initialMessages as Parameters<typeof TeamChat>[0]["initialMessages"]}
          />
        ) : (
          <div className="bg-[#efeeea] rounded-xl p-4 text-center text-[#45474d]"
            style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}>
            이 팀의 멤버만 채팅에 참여할 수 있습니다.
          </div>
        )}
      </section>
    </div>
  );
}
