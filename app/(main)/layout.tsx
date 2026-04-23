import { Header } from "@/src/presentation/components/layout/Header";
import { BottomNav } from "@/src/presentation/components/layout/BottomNav";
import { createClient } from "@/src/infrastructure/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileData = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, team_id")
      .eq("id", user.id)
      .single();
    
    let teamName = "팀 미배정";
    if (profile?.team_id) {
      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", profile.team_id)
        .single();
      if (team) teamName = team.name;
    }

    profileData = {
      name: profile?.name ?? "사용자",
      teamName: teamName
    };
  }

  return (
    <div className="min-h-dvh bg-[#fbf9f5] text-[#1b1c1a]">
      <Header profile={profileData} />
      <main className="pt-16 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
