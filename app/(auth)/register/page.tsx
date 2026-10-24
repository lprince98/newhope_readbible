import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";

export const metadata: Metadata = {
  title: "회원가입",
  description: "새소망 공동체의 일원이 되어보세요.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirm?: string; email?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error;
  const isConfirmPending = params.confirm === "1";
  const confirmEmail = params.email;

  async function register(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const email    = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name     = formData.get("name") as string;

    // name을 메타데이터로 전달 → handle_new_user 트리거가 profiles 자동 생성
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      const msgMap: Record<string, string> = {
        "email rate limit exceeded":
          "이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        "User already registered":
          "이미 가입된 이메일입니다. 로그인을 시도해보세요.",
        "Password should be at least 6 characters":
          "비밀번호는 6자 이상이어야 합니다.",
        "Unable to validate email address: invalid format":
          "이메일 형식이 올바르지 않습니다.",
      };
      const msg = msgMap[error.message] ?? error.message;
      redirect(`/register?error=${encodeURIComponent(msg)}`);
    }

    // 이메일 인증 대기 중인 경우 (session = null)
    if (!data.session) {
      redirect(`/register?confirm=1&email=${encodeURIComponent(email)}`);
    }

    redirect("/home");
  }

  // 로고 원호를 닮은 장식 링 (공통 배경)
  const arcs = (
    <>
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />
    </>
  );

  // ── 이메일 인증 대기 화면 ───────────────────────────────────────
  if (isConfirmPending) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
        {arcs}
        <main className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
          <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />

          <div className="card flex w-full flex-col items-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-soft">
              <span
                className="material-symbols-outlined text-[36px] text-teal"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_read
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[22px] font-bold tracking-tight text-ink">이메일을 확인해주세요</h1>
              <p className="text-[15px] leading-relaxed text-muted">
                <strong className="font-semibold text-ink">{confirmEmail}</strong>으로
                <br />
                인증 링크를 발송했습니다.
                <br />
                링크를 클릭하면 자동으로 로그인됩니다.
              </p>
            </div>
            <div className="w-full border-t border-line pt-5">
              <p className="mb-1 text-[13px] text-subtle">이메일이 오지 않으셨나요?</p>
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center text-[14px] font-semibold text-brand transition-colors hover:text-brand-deep"
              >
                다시 시도하기
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── 회원가입 폼 화면 ────────────────────────────────────────────
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      {arcs}

      {/* 뒤로 가기 (로그인으로) */}
      <Link
        href="/login"
        aria-label="로그인으로 돌아가기"
        className="absolute top-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/80 text-ink shadow-card backdrop-blur-sm transition-colors hover:bg-card"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
      </Link>

      <main className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* 브랜드 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />
          <p className="verse text-[15px] text-muted">새소망 공동체의 일원이 되어보세요</p>
        </div>

        <div className="card flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="page-title">회원가입</h1>
            <p className="text-[14px] text-muted">함께 말씀을 읽어가요.</p>
          </div>

          {/* 오류 메시지 */}
          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
              <span>{decodeURIComponent(errorMsg)}</span>
            </div>
          )}

          <form action={register} className="flex flex-col gap-4">
            {/* 이름 */}
            <div>
              <label className="field-label" htmlFor="name">
                이름
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-subtle">
                  person
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="이름 입력"
                  required
                  className="field pl-11"
                />
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="field-label" htmlFor="email">
                이메일
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-subtle">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="이메일 주소 입력"
                  required
                  className="field pl-11"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="field-label" htmlFor="password">
                비밀번호
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-subtle">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 6자 이상"
                  required
                  minLength={6}
                  className="field pl-11"
                />
              </div>
            </div>

            {/* 제출 */}
            <button type="submit" className="btn btn-primary mt-2 w-full">
              가입하기
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="border-t border-line pt-5 text-center">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-ink"
            >
              이미 계정이 있으신가요?
              <span className="ml-1.5 font-semibold text-brand">로그인하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
