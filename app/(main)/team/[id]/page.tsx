import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { TeamChat } from "@/src/presentation/components/team/TeamChat";
import { ActivityFeed } from "@/src/presentation/components/team/ActivityFeed";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";

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
    title: `${team?.name ?? "팀"} — 새소망 성경 통독`,
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
  const teamCounts = await repo.getTeamChapterCounts();
  const teamData = teamCounts.find((t) => t.teamId === teamId);
  const totalChapters = teamData?.totalChapters ?? 0;
  const TOTAL_BIBLE_CHAPTERS = 1189; // 성경 전체 1,189장
  
  // 4. 팀원별 개별 진행 현황 조회 (중요!)
  // RPC 함수인 'get_member_chapter_counts'를 호출하여 각 멤버의 읽은 장 수를 가져옵니다.
  let memberProgress = await repo.getMemberChapterCounts(teamId);

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
        totalChapters: 0 
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
    const { data: records } = await supabase
      .from("reading_records")
      .select("id, user_id, book_id, start_chapter, end_chapter, read_at, created_at")
      .in("user_id", memberIds)
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
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-10">
      {/* 팀 상단 정보 섹션 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}>
            {team.name}
          </h2>
          {/* 팀장 또는 팀 멤버인 경우에만 관리 버튼 노출 */}
          {isMyTeam && (
            <Link
              href="/team/manage"
              className="flex items-center gap-1 text-[#775a19] hover:text-[#041129] transition-colors mb-2"
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


      {/* 핵심 섹션: 팀원별 개인별 진행율 게이지 */}
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
            // 개인별 진척도 계산
            const memberPct = Math.min(100, Math.round((m.totalChapters / 1189) * 100));
            const isMe = m.userId === user.id;

            return (
              <div key={m.userId} className={`p-4 rounded-2xl border transition-all ${
                isMe ? "bg-[#fffbeb] border-[#fed488] shadow-sm" : "bg-white border-[#e4e2de]"
              }`}>
                {/* 팀원 이름 및 퍼센트 */}
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
                
                {/* 진행율 바 */}
                <div className="h-1.5 w-full bg-[#efeeea] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isMe ? "bg-[#775a19]" : "bg-[#1a263f]/60"
                    }`}
                    style={{ width: `${memberPct}%` }}
                  />
                </div>
                
                {/* 남은 분량 수치 */}
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


      {/* 최근 읽기 활동 피드 섹션 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
          최근 읽기
        </h3>
        <ActivityFeed activities={activities} />
      </section>

      {/* 팀원 응원 실시간 채팅 섹션 */}
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
