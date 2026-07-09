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
    <div className="w-full max-w-sm mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="새로운 팀 이름 입력"
          className="w-full bg-[#f5f3ef] border border-[#c5c6ce] rounded-xl px-4 py-3 text-[#1b1c1a] outline-none focus:border-[#775a19] transition-all"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
          required
        />
        <button
          type="submit"
          disabled={isPending || !teamName.trim()}
          className="w-full bg-[#041129] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#041129]/90 active:scale-95 transition-all disabled:opacity-60"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          {isPending ? "생성 중..." : "새로운 팀 만들기"}
        </button>
        {error && (
          <p className="text-[#ba1a1a] text-center mt-2" style={{ fontSize: "13px" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
