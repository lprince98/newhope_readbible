import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { FEATURES } from "@/lib/constants/features";
import { needsNameSetup } from "@/src/shared/utils/auth";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  // 로그인 없이 볼 수 있는 경로: 로그인·가입, 카카오 콜백, 공유 미리보기 이미지·앱 매니페스트
  // (그 외 모든 화면은 로그인이 필요하며, 비로그인 사용자는 로그인 화면으로 이동)
  const isPublic =
    isAuthPage ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname === "/manifest.webmanifest";

  // 리다이렉트할 때도 Supabase가 방금 갱신한 로그인 쿠키를 함께 넘겨야 합니다.
  // (빠뜨리면 토큰 갱신이 리다이렉트 응답과 겹칠 때 새 토큰이 버려져 로그아웃됩니다)
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  // 팀 기능 비활성화 시 /team 경로 우회 원천 차단
  if (!FEATURES.enableTeamFeatures && pathname.startsWith("/team")) {
    return redirectTo("/home");
  }

  // 랭킹 기능 비활성화 시 /ranking 경로 우회 원천 차단
  if (!FEATURES.enableRanking && pathname.startsWith("/ranking")) {
    return redirectTo("/home");
  }

  // 비로그인 → 로그인 화면으로 (처음 앱을 연 사람 포함)
  if (!user && !isPublic) {
    return redirectTo("/login");
  }

  // 카카오로 처음 가입해 아직 실명을 입력하지 않았다면 실명 입력 화면으로
  if (user && needsNameSetup(user) && !pathname.startsWith("/welcome") && !pathname.startsWith("/auth")) {
    return redirectTo("/welcome");
  }

  // 로그인 상태 → 인증 페이지 접근 시 홈으로
  if (user && isAuthPage) {
    return redirectTo("/home");
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
