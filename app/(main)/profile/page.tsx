import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { ProfileActions } from "@/src/presentation/components/profile/ProfileActions";
import { PasswordChangeSection } from "@/src/presentation/components/profile/PasswordChangeSection";


export const metadata: Metadata = {
  title: "프로필 — 새소망 성경 통독",
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

  // 디버깅용 로그 (서버 콘솔에서 확인 가능)
  console.log(`>>> [PROFILE DEBUG] User: ${user.id}, TeamID: ${profile?.team_id}, TeamName: ${teamName}`);



  return (
    <div className="max-w-md mx-auto px-6 py-12 flex flex-col gap-10">
      {/* 아바타 & 기본 정보 */}
      <section className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-[#041129] text-white flex items-center justify-center shadow-lg border-4 border-white">
          <span className="text-4xl font-bold">{profile?.name?.charAt(0) ?? user.email?.charAt(0)}</span>
        </div>
        <div className="text-center">
          <h2 className="text-[#041129] font-bold text-2xl" style={{ fontFamily: "Manrope, sans-serif" }}>
            {profile?.name}
          </h2>
          <p className="text-[#75777e] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
            {user.email}
          </p>
        </div>
      </section>

      {/* 정보 카드 */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(4,17,41,0.04)] border border-[#e4e2de] flex flex-col gap-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-[#75777e] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>소속 팀</span>
          <span className="text-[#041129] font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>{teamName}</span>
        </div>
        <div className="h-px bg-[#f5f3ef]" />
        <div className="flex justify-between items-center py-2">
          <span className="text-[#75777e] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>가입일</span>
          <span className="text-[#041129] font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>
            {new Date(user.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </section>

      {/* 비밀번호 변경 (이메일 서비스 중단 대비 대안) */}
      <PasswordChangeSection />

      {/* 액션 버튼 (클라이언트 컴포넌트) */}
      <ProfileActions />



    </div>
  );
}
