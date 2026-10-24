import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BrandLogo } from "@/src/presentation/components/common/BrandLogo";

export const metadata: Metadata = {
  title: "환영합니다",
  description: "성경 통독에 사용할 이름을 알려주세요.",
};

export const dynamic = "force-dynamic";

/**
 * 카카오로 처음 가입한 사용자가 실명을 입력하는 화면.
 * 랭킹·팀 화면에 카카오 닉네임 대신 실명이 보이도록 한 번만 받습니다.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorMsg } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  async function saveName(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2 || name.length > 20) {
      redirect(`/welcome?error=${encodeURIComponent("이름은 2~20자로 입력해주세요.")}`);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);
    if (profileError) {
      redirect(`/welcome?error=${encodeURIComponent("이름을 저장하지 못했습니다. 다시 시도해주세요.")}`);
    }

    // 다음부터는 이 화면을 건너뛰도록 표시
    await supabase.auth.updateUser({ data: { name: name, name_confirmed: true } });
    redirect("/home");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-16">
      <span className="hope-arc -top-40 -right-32 h-96 w-96 text-brand/10" />
      <span className="hope-arc -top-24 -right-16 h-64 w-64 text-brand/10" />
      <span className="hope-arc -bottom-40 -left-32 h-96 w-96 text-teal/15" />

      <main className="relative z-10 flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo variant="wordmark" size={44} className="h-11 w-auto" />
        </div>

        <div className="card flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="page-title">환영합니다!</h1>
            <p className="text-[15px] leading-relaxed text-muted">
              랭킹과 팀 화면에 보일 <strong className="font-semibold text-ink">이름(실명)</strong>을 알려주세요.
            </p>
          </div>

          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
              <span>{decodeURIComponent(errorMsg)}</span>
            </div>
          )}

          <form action={saveName} className="flex flex-col gap-4">
            <div>
              <label className="field-label" htmlFor="name">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={profile?.name ?? ""}
                placeholder="예: 홍길동"
                minLength={2}
                maxLength={20}
                required
                className="field text-[17px]"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full text-[16px]">
              시작하기
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
