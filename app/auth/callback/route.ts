import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/infrastructure/supabase/server";
import { needsNameSetup } from "@/src/shared/utils/auth";

/**
 * 카카오 등 소셜 로그인 후 돌아오는 주소.
 * 인증 코드를 세션으로 교환하고, 처음 가입한 사용자는 실명 입력 화면으로 보냅니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const next = needsNameSetup(data.user) ? "/welcome" : "/home";
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error(">>> [AUTH CALLBACK] 세션 교환 실패:", error);
  }

  // 사용자가 동의를 취소했거나 코드가 잘못된 경우
  const message = searchParams.get("error_description") ?? "카카오 로그인에 실패했습니다. 다시 시도해주세요.";
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
}
