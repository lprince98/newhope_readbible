"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/src/presentation/actions/teamActions";

export function CreateTeamForm() {
  const [teamName, setTeamName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;

    startTransition(async () => {
      const res = await createTeam(teamName);
      if (res.error) {
        setError(res.error);
      } else if (res.teamId) {
        router.push(`/team/${res.teamId}`);
      }
    });
  }

  return (
    <div className="card w-full p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="new-team-name" className="field-label mb-0">
          팀 이름
        </label>
        <input
          id="new-team-name"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="새로운 팀 이름 입력"
          className="field"
          required
        />
        <button
          type="submit"
          disabled={isPending || !teamName.trim()}
          className="btn btn-primary w-full"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          {isPending ? "생성 중..." : "새로운 팀 만들기"}
        </button>
        {error && (
          <p className="flex items-center justify-center gap-1.5 rounded-xl bg-danger-soft px-3 py-2.5 text-center text-[13px] font-medium text-danger">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
