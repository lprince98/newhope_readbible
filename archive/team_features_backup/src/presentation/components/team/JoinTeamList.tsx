"use client";

import { useTransition } from "react";
import { joinTeam } from "@/src/presentation/actions/teamActions";

interface Team {
  id: string;
  name: string;
  _count?: {
    profiles: number;
  };
}

export function JoinTeamList({ teams, isInTeam }: { teams: Team[], isInTeam?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleJoin = (teamId: string, teamName: string) => {
    const message = isInTeam 
      ? `소속 팀을 '${teamName}' 팀으로 변경하시겠습니까?\n기존 팀에서는 자동으로 탈퇴 처리됩니다.`
      : `'${teamName}' 팀에 가입하시겠습니까?`;

    if (!confirm(message)) return;

    startTransition(async () => {
      const res = await joinTeam(teamId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };


  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <h3 className="text-[#041129] font-bold text-lg px-2" style={{ fontFamily: "Manrope, sans-serif" }}>
        기존 팀 가입하기
      </h3>
      <div className="grid gap-3">
        {teams.length === 0 ? (
          <p className="text-center py-8 text-[#75777e] bg-white rounded-xl border border-dashed border-[#c5c6ce]">
            현재 가입 가능한 팀이 없습니다.
          </p>
        ) : (
          teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleJoin(team.id, team.name)}
              disabled={isPending}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e4e2de] hover:border-[#775a19] hover:bg-[#fffbeb] transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center text-[#775a19] group-hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-xl">group</span>
                </div>
                <span className="font-semibold text-[#041129]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {team.name}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#c5c6ce] group-hover:text-[#775a19] transition-colors">
                chevron_right
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
