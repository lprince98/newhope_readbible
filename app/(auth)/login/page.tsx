import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BackButton } from "@/src/presentation/components/common/BackButton";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";
import { KakaoLoginButton } from "@/src/presentation/components/auth/KakaoLoginButton";

export const metadata: Metadata = {
  title: "로그인",
  description: "새소망교회 성경 통독 앱에 로그인하세요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error;

  async function login(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    if (error) {
      const msgMap: Record<string, string> = {
        "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
        "Email not confirmed": "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.",
        "Too many requests": "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.",
      };
      const msg = msgMap[error.message] ?? error.message;
      redirect(`/login?error=${encodeURIComponent(msg)}`);
    }
    redirect("/home");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      <BackButton />

      {/* 로고 원호를 닮은 장식 링 */}
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />

      <main className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* 브랜드 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />
          <p className="verse text-[15px] text-muted">말씀으로 시작하는 하루</p>
        </div>

        <div className="card flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="page-title">로그인</h1>
            <p className="text-[15px] text-muted">카카오 계정으로 간편하게 로그인하세요.</p>
          </div>

          {/* 오류 메시지 */}
          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
              <span>{decodeURIComponent(errorMsg)}</span>
            </div>
          )}

          {/* 카카오 로그인 (가입도 같은 버튼으로 진행) */}
          <KakaoLoginButton label="카카오로 로그인" />

          {/* 이메일 로그인 — 관리자 등 기존 이메일 계정용으로 접어 둠 */}
          <details className="group rounded-xl border border-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[14px] font-medium text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
              이메일로 로그인
              <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="border-t border-line px-4 pt-4 pb-5">
            <form action={login} className="flex w-full flex-col gap-4">
              <div>
                <label className="field-label" htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  required
                  className="field"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="password">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="field"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-brand" />
                  로그인 상태 유지
                </label>
                <Link
                  href="/password-help"
                  className="flex min-h-11 items-center text-[13px] font-medium text-brand transition-colors hover:text-brand-deep"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

              <button type="submit" className="btn btn-primary mt-1 w-full">
                로그인
              </button>
            </form>
            </div>
          </details>

          {/* 회원가입 링크 */}
          <div className="border-t border-line pt-5 text-center">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-ink"
            >
              계정이 없으신가요?
              <span className="ml-1.5 font-semibold text-brand">회원가입하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
