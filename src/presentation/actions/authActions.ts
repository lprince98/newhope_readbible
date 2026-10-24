"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/src/infrastructure/supabase/server";

/** 로그아웃 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** 회원 탈퇴 */
export async function withdrawAction() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error(">>> [SERVER] 사용자 조회 오류:", userError);
    return { error: `인증 오류: ${userError.message}` };
  }

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // RPC 함수(delete_user) 호출
  const { error: rpcError } = await supabase.rpc("delete_user");

  if (rpcError) {
    console.error(">>> [SERVER] RPC 탈퇴 오류 상세:", rpcError);
    return { error: `탈퇴 실패: ${rpcError.message} (${rpcError.code})` };
  }

  // 세션 정리 및 로그아웃
  await supabase.auth.signOut();
  redirect("/login");
}
