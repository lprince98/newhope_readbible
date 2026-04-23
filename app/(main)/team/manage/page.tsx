import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { TeamManageForm } from "@/src/presentation/components/team/TeamManageForm";

export const metadata: Metadata = {
  title: "팀 관리 — 새소망 성경 통독",
  description: "팀 이름 수정 및 팀원 초대·관리",
};

export const dynamic = "force-dynamic";


export default async function TeamManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 내 팀 조회
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("name, team_id")
    .eq("id", user.id)
    .single();

  if (!myProfile?.team_id) redirect("/team");

  const teamId = myProfile.team_id as string;

  // 팀 정보
  const { data: team } = await supabase
    .from("teams")
    .select("id, name, leader_id")
    .eq("id", teamId)
    .single();

  if (!team) redirect("/team");

  const isLeader = team.leader_id === user.id;

  // 팀원 목록
  const { data: membersRaw } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("team_id", teamId)
    .order("created_at");

  const members = (membersRaw ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    isMe: m.id === user.id,
  }));

  // 대기 중인 초대 목록
  const { data: invitationsRaw } = await supabase
    .from("team_invitations")
    .select("id, invited_email")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const invitations = invitationsRaw ?? [];

  return (
    <div className="max-w-md mx-auto px-6 pt-8 pb-12 flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/team/${teamId}`}
            className="flex items-center gap-1 text-[#45474d] hover:text-[#041129] transition-colors mb-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            팀으로 돌아가기
          </Link>
          <h2 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}>
            팀 관리
          </h2>
          <p className="text-[#45474d] mt-1"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
            {isLeader ? "새로운 멤버를 초대하고 팀을 관리하세요." : "팀 정보를 조회합니다."}
          </p>
        </div>
      </div>

      {/* 관리 폼 (클라이언트 컴포넌트) */}
      <TeamManageForm
        teamId={teamId}
        currentName={team.name}
        members={members}
        invitations={invitations}
        isLeader={isLeader}
      />
    </div>
  );
}

