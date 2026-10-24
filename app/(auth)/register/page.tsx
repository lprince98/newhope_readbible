import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";
import { KakaoLoginButton } from "@/src/presentation/components/auth/KakaoLoginButton";

export const metadata: Metadata = {
  title: "회원가입",
  description: "카카오 계정으로 새소망 성경 통독에 가입하세요.",
};

/**
 * 회원가입 — 카카오 계정으로만 가입합니다.
 * (이메일이 없는 어르신도 쉽게 가입하도록 이메일 가입은 제공하지 않음)
 */
export default function RegisterPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />

      {/* 뒤로 가기 (로그인으로) */}
      <Link
        href="/login"
        aria-label="로그인으로 돌아가기"
        className="absolute top-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/80 text-ink shadow-card backdrop-blur-sm transition-colors hover:bg-card"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
      </Link>

      <main className="relative z-10 flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />
          <p className="verse text-[15px] text-muted">새소망 공동체의 일원이 되어보세요</p>
        </div>

        <div className="card flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="page-title">회원가입</h1>
            <p className="text-[15px] leading-relaxed text-muted">
              카카오 계정으로 바로 가입할 수 있어요.
              <br />
              이메일이나 비밀번호를 외우실 필요가 없습니다.
            </p>
          </div>

          <KakaoLoginButton label="카카오로 가입하기" />

          <ol className="flex flex-col gap-2 rounded-xl bg-sunken px-4 py-4 text-[14px] text-ink-soft">
            <li className="flex gap-2">
              <span className="font-bold text-brand">1</span>
              <span>노란 버튼을 누르고 카카오에서 <strong className="font-semibold">동의하고 계속하기</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand">2</span>
              <span>성함(실명)을 입력하면 가입 완료</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-brand">3</span>
              <span>&lsquo;팀&rsquo; 메뉴에서 팀을 만들거나 가입하기</span>
            </li>
          </ol>

          <div className="border-t border-line pt-5 text-center">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-ink"
            >
              이미 가입하셨나요?
              <span className="ml-1.5 font-semibold text-brand">로그인하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
