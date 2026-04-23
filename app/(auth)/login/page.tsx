import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BackButton } from "@/src/presentation/components/common/BackButton";

export const metadata: Metadata = {
  title: "로그인 — 새소망 성경 통독",
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
    <div className="min-h-dvh bg-[#f5f3ef] flex items-center justify-center relative overflow-hidden">
      {/* 뒤로 가기 버튼 */}
      <BackButton />

      {/* 배경 그라디언트 */}

      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <main className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(4,17,41,0.06)] border border-[#c5c6ce]/30 p-8 flex flex-col gap-8">
          {/* 헤더 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#fed488]/30 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#775a19] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                menu_book
              </span>
            </div>
            <h1
              className="text-[#1b1c1a] tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
            >
              로그인
            </h1>
            <p className="text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}>
              말씀으로 시작하는 하루
            </p>
          </div>

          {/* 오류 메시지 */}
          {errorMsg && (
            <div className="bg-[#ffdad6] text-[#93000a] rounded-lg px-4 py-3 flex items-start gap-2"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
              <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
              <span>{decodeURIComponent(errorMsg)}</span>
            </div>
          )}

          {/* 폼 */}
          <form action={login} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <label
                className="text-[#1b1c1a] ml-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                htmlFor="email"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#775a19]/50 focus:border-[#775a19] transition-all placeholder:text-[#75777e]/60"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-[#1b1c1a] ml-1"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                htmlFor="password"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#775a19]/50 focus:border-[#775a19] transition-all placeholder:text-[#75777e]/60"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
              />
            </div>

            <div className="flex items-center justify-between mt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#c5c6ce] text-[#041129] focus:ring-[#041129]/20 bg-[#efeeea] cursor-pointer"
                />
                <span
                  className="text-[#45474d] group-hover:text-[#1b1c1a] transition-colors"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
                >
                  로그인 상태 유지
                </span>
              </label>
              <a
                href="#"
                className="text-[#775a19] hover:text-[#041129] transition-colors"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-[#041129] text-white py-3 rounded-lg mt-2 hover:bg-[#041129]/90 hover:shadow-[0_2px_8px_rgba(4,17,41,0.15)] active:shadow-none active:scale-[0.98] transition-all flex justify-center items-center"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
            >
              로그인
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="text-center pt-2 border-t border-[#c5c6ce]/30">
            <Link
              href="/register"
              className="text-[#45474d] hover:text-[#041129] transition-colors"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
            >
              계정이 없으신가요?{" "}
              <span className="text-[#775a19] font-semibold ml-1">회원가입하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
