import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/src/presentation/components/common/BackButton";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";
import { KakaoLoginButton } from "@/src/presentation/components/auth/KakaoLoginButton";

export const metadata: Metadata = {
  title: "로그인",
  description: "새소망교회 성경 통독 앱에 로그인하세요.",
};

/**
 * 로그인 — 카카오 계정으로만 로그인합니다.
 * (가입과 로그인이 같은 버튼이며, 처음이면 자동으로 가입 후 실명 입력 화면으로 이동)
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorMsg } = await searchParams;

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

          {/* 오류 메시지 (카카오 로그인 취소·실패 등) */}
          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
              <span>{decodeURIComponent(errorMsg)}</span>
            </div>
          )}

          <KakaoLoginButton label="카카오로 로그인" />

          {/* 회원가입 링크 */}
          <div className="border-t border-line pt-5 text-center">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-ink"
            >
              처음이신가요?
              <span className="ml-1.5 font-semibold text-brand">회원가입 안내</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
