import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { ProfileActions } from "@/src/presentation/components/profile/ProfileActions";
import { PageHeader } from "@/src/presentation/components/common/PageHeader";
import { isSocialUser } from "@/src/shared/utils/auth";


export const metadata: Metadata = {
  title: "프로필",
  description: "사용자 정보를 확인하고 로그아웃합니다.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // 쿠키를 호출하여 동적 렌더링 강제
  await cookies();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1단계: 프로필 정보 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, team_id")
    .eq("id", user.id)
    .single();

  // 2단계: 팀 정보가 있다면 팀 테이블에서 직접 이름 조회 (가장 확실함)
  let teamName = "팀 미배정";
  if (profile?.team_id) {
    const { data: teamData } = await supabase
      .from("teams")
      .select("name")
      .eq("id", profile.team_id)
      .single();

    if (teamData) {
      teamName = teamData.name;
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6 md:px-6">
      <PageHeader eyebrow="내 정보" title="프로필" />

      {/* 아바타 & 기본 정보 */}
      <section className="relative overflow-hidden rounded-[1.5rem] bg-brand p-6 text-white shadow-brand">
        <span className="hope-arc -right-16 -bottom-28 h-72 w-72 text-white/15" />
        <span className="hope-arc -right-6 -bottom-16 h-48 w-48 text-white/10" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 backdrop-blur-sm">
            <span className="text-[28px] font-bold">{profile?.name?.charAt(0) ?? user.email?.charAt(0)}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="truncate text-[20px] font-bold tracking-tight">{profile?.name}</h3>
            <p className="truncate text-[14px] text-white/75">{isSocialUser(user) ? "카카오 계정으로 로그인" : user.email}</p>
          </div>
        </div>
      </section>

      {/* 정보 카드 */}
      <section className="card flex flex-col px-5 py-2">
        <div className="flex min-h-14 items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[14px] text-muted">
            <span className="material-symbols-outlined text-[20px] text-subtle">groups</span>
            소속 팀
          </span>
          <span className="text-[15px] font-semibold text-ink">{teamName}</span>
        </div>
        <div className="h-px bg-line" />
        <div className="flex min-h-14 items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[14px] text-muted">
            <span className="material-symbols-outlined text-[20px] text-subtle">calendar_month</span>
            가입일
          </span>
          <span className="text-[15px] font-semibold text-ink">
            {new Date(user.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
          </span>
        </div>
      </section>

      {/* 비밀번호 변경 (이메일 서비스 중단 대비 대안) */}

      {/* 액션 버튼 (클라이언트 컴포넌트) */}
      <ProfileActions />
    </div>
  );
}
