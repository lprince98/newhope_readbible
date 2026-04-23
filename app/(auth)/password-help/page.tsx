import { BackButton } from "@/src/presentation/components/common/BackButton";
import Link from "next/link";

export const metadata = {
  title: "비밀번호 도움말 — 새소망 성경 통독",
};

export default function PasswordHelpPage() {
  return (
    <div className="min-h-dvh bg-[#f5f3ef] flex items-center justify-center relative overflow-hidden">
      <BackButton />
      
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
      />

      <main className="w-full max-w-md px-6 relative z-10">
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(4,17,41,0.06)] border border-[#c5c6ce]/30 p-8 flex flex-col gap-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#fdf2f2] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ba1a1a] text-4xl">contact_support</span>
            </div>
            <h1 className="text-[#041129] font-bold text-2xl" style={{ fontFamily: "Manrope, sans-serif" }}>
              비밀번호를 잊으셨나요?
            </h1>
            <div className="text-[#45474d] text-sm leading-relaxed" style={{ fontFamily: "Noto Serif KR, serif" }}>
              현재 보안을 위한 이메일 발송 서비스가 일시 중단된 상태입니다. <br /><br />
              비밀번호 재설정이 필요하신 성도님께서는 <br />
              <strong className="text-[#041129]">교회 사무실 또는 앱 관리자</strong>에게 <br />
              성함과 이메일을 말씀해 주시면 <br />
              즉시 임시 비밀번호로 초기화해 드립니다.
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#f5f3ef]">
            <Link 
              href="/login" 
              className="w-full bg-[#041129] text-white py-3 rounded-lg font-medium hover:bg-black transition-all"
            >
              로그인 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
