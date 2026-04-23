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

  // 팀원 목록
  const { data: members } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("team_id", teamId)
    .order("created_at");

  // 최근 읽기 기록 (팀원 전체, 최신 20개)
  const memberIds = (members ?? []).map((m) => m.id);
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
      user_name: members?.find((m) => m.id === r.user_id)?.name ?? "알 수 없음",
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
    <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
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

        {/* 진행률 카드 */}
        <div className="bg-white rounded-xl p-4 shadow-[0_4px_24px_rgba(4,17,41,0.04)] mt-2 flex flex-col gap-2 border border-[#e4e2de]">
          <div className="flex justify-between items-end">
            <span className="text-[#1b1c1a]"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
              성경 통독 진행률
            </span>
            <span className="text-[#775a19]"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
              {progressPct}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#e4e2de] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#775a19] rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[#75777e] text-right"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px" }}>
            총 {totalChapters.toLocaleString()}장 / 1,189장
          </p>
        </div>
      </section>

      {/* 팀원 목록 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}>
          팀원 {members?.length ?? 0}명
        </h3>
        <div className="flex flex-wrap gap-2">
          {(members ?? []).map((m) => (
            <div key={m.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                m.id === user.id
                  ? "bg-[#fed488]/30 border-[#775a19]/30 text-[#775a19]"
                  : "bg-[#efeeea] border-[#c5c6ce] text-[#1b1c1a]"
              }`}
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "13px", fontWeight: 500 }}
            >
              <span className="w-5 h-5 rounded-full bg-[#1a263f] text-white flex items-center justify-center text-[10px] font-bold">
                {m.name.charAt(0)}
              </span>
              {m.name}
              {m.id === user.id && <span className="text-[10px] text-[#775a19]">나</span>}
            </div>
          ))}
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
