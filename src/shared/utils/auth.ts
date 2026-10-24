import type { User } from "@supabase/supabase-js";

/** 카카오 등 소셜 계정으로 가입했는지 여부 (이메일·비밀번호 가입이 아님) */
export function isSocialUser(user: User): boolean {
  return (user.app_metadata?.provider ?? "email") !== "email";
}

/**
 * 소셜 가입 후 아직 실명을 확인하지 않은 사용자인지 여부.
 * 카카오 닉네임은 실명이 아닌 경우가 많아, 처음 한 번 /welcome 에서 이름을 받습니다.
 */
export function needsNameSetup(user: User): boolean {
  return isSocialUser(user) && !user.user_metadata?.name_confirmed;
}
