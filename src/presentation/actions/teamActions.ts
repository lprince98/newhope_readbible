"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";


// ── 팀 이름 수정 ─────────────────────────────────────────────────────
export async function updateTeamName(teamId: string, name: string) {
  if (!name.trim()) return { error: "팀 이름을 입력해주세요." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 팀장 권한 확인
  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .single();
  
  if (team?.leader_id !== user.id) return { error: "팀장만 팀 이름을 수정할 수 있습니다." };

  const { error } = await supabase
    .from("teams")
    .update({ name: name.trim() })
    .eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath(`/team/${teamId}`);
  revalidatePath("/team/manage");
  revalidatePath("/ranking");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  return { success: true };
}


// ── 팀원 제거 ─────────────────────────────────────────────────────────
export async function removeMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (user.id === memberId) return { error: "자기 자신은 제거할 수 없습니다." };

  // 내가 팀장인지 확인
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", myProfile?.team_id)
    .single();

  if (team?.leader_id !== user.id) return { error: "팀장만 팀원을 제외할 수 있습니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ team_id: null })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/team/manage");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  return { success: true };
}


// ── 팀 생성 ───────────────────────────────────────────────────────────
export async function createTeam(name: string) {
  if (!name.trim()) return { error: "팀 이름을 입력해주세요." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 이미 팀에 속해 있는지 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (profile?.team_id) return { error: "이미 팀에 소속되어 있습니다." };

  // 1. 팀 생성 (생성자를 팀장으로 지정)
  const { data: newTeam, error: teamError } = await supabase
    .from("teams")
    .insert({
      name: name.trim(),
      leader_id: user.id
    })
    .select()
    .single();

  if (teamError) return { error: teamError.message };

  // 2. 내 프로필에 팀 ID 업데이트
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ team_id: newTeam.id })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/team");
  revalidatePath("/ranking");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  return { success: true, teamId: newTeam.id };
}


/** 팀 탈퇴 */
export async function leaveTeam() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 1. 현재 팀 정보 및 팀장 여부 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.team_id) return { error: "소속된 팀이 없습니다." };

  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", profile.team_id)
    .single();

  if (team?.leader_id === user.id) {
    return { error: "팀장은 팀을 탈퇴할 수 없습니다. 팀을 해체하거나 팀장을 위임한 후 탈퇴해 주세요." };
  }

  // 2. 팀 탈퇴 처리
  const { error } = await supabase
    .from("profiles")
    .update({ team_id: null })
    .eq("id", user.id);

  if (error) return { error: "팀 탈퇴 중 오류가 발생했습니다." };

  revalidatePath("/team");
  revalidatePath("/ranking");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  
  return { success: true };
}

/** 팀 가입 (기존 팀에 참여 / 팀 변경) */
export async function joinTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  // 팀장인 경우 팀 변경 불가 안내
  const { data: myTeams } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_id", user.id);
  
  if (myTeams && myTeams.length > 0) {
    return { error: "팀장은 팀을 옮길 수 없습니다. 팀 해체 또는 위임 후 시도해 주세요." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ team_id: teamId })
    .eq("id", user.id);

  if (error) return { error: "팀 가입 중 오류가 발생했습니다." };

  revalidatePath("/team");
  revalidatePath("/ranking");
  revalidatePath("/home");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect(`/team/${teamId}`);
}




/** 팀 삭제 (팀 해체) */
export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  // 팀장 권한 확인
  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .single();

  if (!team || team.leader_id !== user.id) {
    return { error: "팀을 삭제할 권한이 없습니다." };
  }

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) return { error: "팀 삭제 중 오류가 발생했습니다." };

  revalidatePath("/ranking");
  revalidatePath("/team");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  redirect("/home");
}


// ── 채팅 메시지 전송 ──────────────────────────────────────────────────

export async function sendMessage(teamId: string, content: string) {
  if (!content.trim()) return { error: "메시지를 입력해주세요." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("team_messages").insert({
    team_id: teamId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) return { error: error.message };
  return { success: true };
}

