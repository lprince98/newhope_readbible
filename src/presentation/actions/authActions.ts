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

  console.log(">>> [SERVER] 회원 탈퇴 액션 시작");
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error(">>> [SERVER] 사용자 조회 오류:", userError);
    return { error: `인증 오류: ${userError.message}` };
  }

  if (!user) {
    console.warn(">>> [SERVER] 사용자 세션 없음");
    return { error: "로그인이 필요합니다." };
  }

  console.log(">>> [SERVER] 탈퇴 시도 유저 ID:", user.id);

  // RPC 함수(delete_user) 호출
  const { data: result, error: rpcError } = await supabase.rpc("delete_user");

  if (rpcError) {
    console.error(">>> [SERVER] RPC 탈퇴 오류 상세:", rpcError);
    return { error: `탈퇴 실패: ${rpcError.message} (${rpcError.code})` };
  }

  console.log(">>> [SERVER] RPC 결과:", result);

  // 세션 정리 및 로그아웃
  console.log(">>> [SERVER] 로그아웃 시도...");
  await supabase.auth.signOut();
  
  console.log(">>> [SERVER] 리다이렉트 실행");
  redirect("/login");
}



