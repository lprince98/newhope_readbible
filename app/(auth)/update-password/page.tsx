import { UpdatePasswordForm } from "@/src/presentation/components/auth/UpdatePasswordForm";

export const metadata = {
  title: "비밀번호 변경 — 새소망 성경 통독",
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-dvh bg-[#f5f3ef] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <main className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(4,17,41,0.06)] border border-[#c5c6ce]/30 p-8 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#fed488]/30 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#775a19] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock_open
              </span>
            </div>
            <h1 className="text-[#1b1c1a] tracking-tight font-bold text-2xl" style={{ fontFamily: "Manrope, sans-serif" }}>
              새 비밀번호 설정
            </h1>
            <p className="text-[#45474d] text-sm" style={{ fontFamily: "Noto Serif KR, serif" }}>
              로그인에 사용할 새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <UpdatePasswordForm />
        </div>
      </main>
    </div>
  );
}
