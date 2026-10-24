import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { CreateTeamForm } from "@/src/presentation/components/team/CreateTeamForm";
import { JoinTeamList } from "@/src/presentation/components/team/JoinTeamList";

export const dynamic = "force-dynamic";



/** /team → 내 팀 상세 페이지로 리다이렉트 (switch=true 파라미터가 없으면) */
export default async function TeamRootPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ switch?: string }> 
}) {
  const { switch: isSwitching } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (profile?.team_id && !isSwitching) {
    redirect(`/team/${profile.team_id}`);
  }


  // 모든 팀 목록 조회
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .order("created_at", { ascending: false });

  // 팀 미배정 상태
  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-8 px-4 py-6 md:px-6">
      <section className="relative overflow-hidden rounded-[1.5rem] bg-brand p-7 text-white shadow-brand">
        <span className="hope-arc -right-16 -bottom-28 h-72 w-72 text-white/15" />
        <span className="hope-arc -right-6 -bottom-16 h-48 w-48 text-white/10" />
        <span className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-teal/30 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[24px] font-bold tracking-tight">
              {isSwitching && profile?.team_id ? "다른 팀으로 옮기기" : "소속된 팀이 없습니다"}
            </h2>
            <p className="text-[14px] leading-relaxed text-white/80">
              아래 목록에서 팀을 선택하여 가입하거나,
              <br />
              직접 새로운 팀을 만들어 성경 통독을 시작해보세요!
            </p>
          </div>
        </div>
      </section>

      <div className="flex w-full flex-col gap-8">
        {/* 기존 팀 목록 */}
        <JoinTeamList teams={teams ?? []} isInTeam={!!profile?.team_id} />

        {/* 구분선 */}
        <div className="flex items-center gap-4" role="separator">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[12px] font-semibold text-subtle">또는</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* 새 팀 만들기 */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[17px] font-bold text-ink">새로운 팀 만들기</h3>
          <CreateTeamForm />
        </section>
      </div>
    </div>
  );
}
