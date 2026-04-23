import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";

export const metadata: Metadata = {
  title: "회원가입 — 새소망 성경 통독",
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

  // ── 이메일 인증 대기 화면 ───────────────────────────────────────
  if (isConfirmPending) {
    return (
      <div className="min-h-dvh bg-[#f5f3ef] flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(4,17,41,0.06)] border border-[#e4e2de] p-10 max-w-md w-full flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fed488]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#775a19] text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>
          <div>
            <h1 className="text-[#041129] mb-2"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 700 }}>
              이메일을 확인해주세요
            </h1>
            <p className="text-[#45474d]"
              style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "26px" }}>
              <strong className="text-[#041129]">{confirmEmail}</strong>으로<br />
              인증 링크를 발송했습니다.<br />
              링크를 클릭하면 자동으로 로그인됩니다.
            </p>
          </div>
          <div className="w-full border-t border-[#e4e2de] pt-4">
            <p className="text-[#75777e] mb-3"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
              이메일이 오지 않으셨나요?
            </p>
            <Link href="/register"
              className="text-[#775a19] font-semibold hover:underline"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
              다시 시도하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 회원가입 폼 화면 ────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#f5f3ef] flex items-center justify-center py-10 px-4">
      {/* 상단 헤더 */}
      <header className="fixed top-0 left-0 right-0 h-16 w-full flex items-center justify-between px-6 bg-[#faf9f6] z-50">
        <Link href="/login" className="text-[#1A263F] hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <h1 className="font-semibold tracking-tight text-lg text-[#1A263F]"
          style={{ fontFamily: "Manrope, sans-serif" }}>
          새소망 성경
        </h1>
        <div className="w-10" />
      </header>

      <main className="w-full max-w-md pt-20 pb-10">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#eae8e4] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(4,12,41,0.05)]">
            <span className="material-symbols-outlined text-[#775a19] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              menu_book
            </span>
          </div>
          <h2 className="text-[#041129] mb-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}>
            회원가입
          </h2>
          <p className="text-[#45474d]"
            style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}>
            새소망 공동체의 일원이 되어보세요
          </p>
        </div>

        {/* 오류 메시지 */}
        {errorMsg && (
          <div className="mb-4 bg-[#ffdad6] text-[#93000a] rounded-lg px-4 py-3 flex items-start gap-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
            <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
            <span>{decodeURIComponent(errorMsg)}</span>
          </div>
        )}

        {/* 폼 카드 */}
        <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(4,11,41,0.03)] border border-[#e4e2de] p-6 md:p-8">
          <form action={register} className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-[#1b1c1a] mb-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                htmlFor="name">
                이름
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#75777e]">person</span>
                </div>
                <input id="name" name="name" type="text" placeholder="이름 입력" required
                  className="block w-full pl-10 pr-3 py-3 border border-[#c5c6ce] rounded-lg bg-white text-[#1b1c1a] focus:ring-[#775a19] focus:border-[#775a19] transition-colors outline-none"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                />
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-[#1b1c1a] mb-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                htmlFor="email">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#75777e]">mail</span>
                </div>
                <input id="email" name="email" type="email" placeholder="이메일 주소 입력" required
                  className="block w-full pl-10 pr-3 py-3 border border-[#c5c6ce] rounded-lg bg-white text-[#1b1c1a] focus:ring-[#775a19] focus:border-[#775a19] transition-colors outline-none"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-[#1b1c1a] mb-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                htmlFor="password">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#75777e]">lock</span>
                </div>
                <input id="password" name="password" type="password" placeholder="비밀번호 6자 이상"
                  required minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-[#c5c6ce] rounded-lg bg-white text-[#1b1c1a] focus:ring-[#775a19] focus:border-[#775a19] transition-colors outline-none"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                />
              </div>
            </div>

            {/* 제출 */}
            <div className="pt-2">
              <button type="submit"
                className="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-sm text-white bg-[#041129] hover:bg-[#041129]/90 active:scale-[0.98] transition-all"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
                가입하기
              </button>
            </div>
          </form>
        </div>


        {/* 로그인 링크 */}
        <div className="mt-8 text-center">
          <Link href="/login"
            className="text-[#775a19] hover:text-[#775a19]/80 transition-colors"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </main>
    </div>
  );
}
