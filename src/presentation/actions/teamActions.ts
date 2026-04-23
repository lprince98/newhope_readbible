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
  return { success: true };
}

// ── 팀원 초대 (이메일) ────────────────────────────────────────────────
export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "이메일을 입력해주세요." };

  // 내 팀 및 팀장 권한 조회
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();
  
  if (!myProfile?.team_id) return { error: "팀에 소속되어 있지 않습니다." };
  const teamId = myProfile.team_id as string;

  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", teamId)
    .single();
  
  if (team?.leader_id !== user.id) return { error: "팀장만 새로운 팀원을 초대할 수 있습니다." };

  // 이미 가입된 사용자라면 바로 팀 배정
  // (참고: admin 기능은 서비스 롤에서만 가능하므로, 실제 운영 시에는 profiles 조회를 통해 처리 권장)
  const { data: existingProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id); // 실제로는 이메일로 검색해야 하나 profiles RLS로 인해 타인 검색 제한됨

  // 미가입자 초대 저장 (DB RLS가 중복 체크함)
  const { error } = await supabase.from("team_invitations").insert({
    team_id: teamId,
    invited_email: email,
    invited_by: user.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "이미 초대된 이메일입니다." };
    return { error: error.message };
  }

  revalidatePath("/team/manage");
  return { success: true, message: "초대장을 저장했습니다. 해당 이메일로 가입하면 자동으로 팀에 합류합니다." };
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
  return { success: true };
}

// ── 초대 취소 ─────────────────────────────────────────────────────────
export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // 내가 초대했거나 팀장인 경우에만 삭제 가능 (RLS가 처리)
  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) return { error: error.message };

  revalidatePath("/team/manage");
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
  return { success: true, teamId: newTeam.id };
}

/** 팀 가입 (기존 팀에 참여) */
export async function joinTeam(teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ team_id: teamId })
    .eq("id", user.id);

  if (error) return { error: "팀 가입 중 오류가 발생했습니다." };

  revalidatePath("/team");
  revalidatePath("/home");
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

