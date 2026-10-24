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
    <section className="flex w-full flex-col gap-3">
      <h3 className="text-[17px] font-bold text-ink">기존 팀 가입하기</h3>
      <div className="grid gap-2.5">
        {teams.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-silver bg-card py-8 text-center text-[14px] text-muted">
            현재 가입 가능한 팀이 없습니다.
          </p>
        ) : (
          teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => handleJoin(team.id, team.name)}
              disabled={isPending}
              className="card group flex min-h-16 items-center justify-between gap-3 p-4 text-left transition-colors hover:border-brand/40 hover:bg-brand-tint active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <span className="material-symbols-outlined text-[22px]">group</span>
                </div>
                <span className="truncate text-[15px] font-semibold text-ink">{team.name}</span>
              </div>
              <span className="material-symbols-outlined shrink-0 text-silver transition-colors group-hover:text-brand">
                chevron_right
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
