import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";
import { UpdatePasswordForm } from "@/src/presentation/components/auth/UpdatePasswordForm";

export const metadata = {
  title: "비밀번호 변경",
};

export default function UpdatePasswordPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      {/* 로고 원호를 닮은 장식 링 */}
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />

      <main className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />

        <div className="card flex w-full flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft">
              <span
                className="material-symbols-outlined text-[28px] text-teal"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_open
              </span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">새 비밀번호 설정</h1>
            <p className="text-[14px] leading-relaxed text-muted">
              로그인에 사용할 새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <UpdatePasswordForm />
        </div>
      </main>
    </div>
  );
}
