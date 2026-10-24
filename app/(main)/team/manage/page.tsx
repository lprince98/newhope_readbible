import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { TeamManageForm } from "@/src/presentation/components/team/TeamManageForm";
import { TeamMemberActions } from "@/src/presentation/components/team/TeamMemberActions";
import { PageHeader } from "@/src/presentation/components/common/PageHeader";


export const metadata: Metadata = {
  title: "팀 관리",
  description: "팀 이름 수정 및 팀원 관리",
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

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-6 px-4 pt-6 pb-12 md:px-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/team/${teamId}`}
          className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-xl px-2 text-[13px] font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          팀으로 돌아가기
        </Link>
        <PageHeader
          eyebrow={team.name}
          title="팀 관리"
          description={isLeader ? "팀 정보를 수정하고 팀원을 관리하세요." : "팀 정보를 조회합니다."}
        />
      </div>

      {/* 관리 폼 (클라이언트 컴포넌트) */}
      <TeamManageForm
        teamId={teamId}
        currentName={team.name}
        members={members}
        isLeader={isLeader}
      />

      {/* 나의 소속 관리 (탈퇴 및 이동) */}
      <TeamMemberActions />
    </div>
  );
}
