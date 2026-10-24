import { BackButton } from "@/src/presentation/components/common/BackButton";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";
import Link from "next/link";

export const metadata = {
  title: "비밀번호 도움말",
};

export default function PasswordHelpPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      <BackButton />

      {/* 로고 원호를 닮은 장식 링 */}
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />

      <main className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />

        <div className="card flex w-full flex-col gap-6 p-6 text-center sm:p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
              <span className="material-symbols-outlined text-[36px] text-brand">contact_support</span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">비밀번호를 잊으셨나요?</h1>
            <div className="text-[14px] leading-relaxed text-muted">
              현재 보안을 위한 이메일 발송 서비스가 일시 중단된 상태입니다.
              <br />
              <br />
              비밀번호 재설정이 필요하신 성도님께서는
              <br />
              <strong className="font-semibold text-brand">교회 사무실 또는 앱 관리자</strong>에게
              <br />
              성함과 이메일을 말씀해 주시면
              <br />
              즉시 임시 비밀번호로 초기화해 드립니다.
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <Link href="/login" className="btn btn-primary w-full">
              로그인 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
