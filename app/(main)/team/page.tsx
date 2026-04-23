import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { CreateTeamForm } from "@/src/presentation/components/team/CreateTeamForm";
import { JoinTeamList } from "@/src/presentation/components/team/JoinTeamList";

export const dynamic = "force-dynamic";



/** /team → 내 팀 상세 페이지로 리다이렉트 */
export default async function TeamRootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .single();

  if (profile?.team_id) {
    redirect(`/team/${profile.team_id}`);
  }

  // 모든 팀 목록 조회
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .order("created_at", { ascending: false });

  // 팀 미배정 상태
  return (
    <div className="flex flex-col items-center py-10 gap-10 px-6 max-w-screen-md mx-auto">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#efeeea] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[#775a19] text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        </div>
        <div>
          <h2 className="text-[#041129] mb-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "24px", fontWeight: 700 }}>
            소속된 팀이 없습니다
          </h2>
          <p className="text-[#45474d]"
            style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "26px" }}>
            아래 목록에서 팀을 선택하여 가입하거나,<br />
            직접 새로운 팀을 만들어 성경 통독을 시작해보세요!
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-12">
        {/* 기존 팀 목록 */}
        <JoinTeamList teams={teams ?? []} />

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e4e2de]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#faf9f6] px-4 text-[#75777e] font-bold">또는</span>
          </div>
        </div>

        {/* 새 팀 만들기 */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[#041129] font-bold text-lg px-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            새로운 팀 만들기
          </h3>
          <CreateTeamForm />
        </div>
      </div>
    </div>
  );
}


