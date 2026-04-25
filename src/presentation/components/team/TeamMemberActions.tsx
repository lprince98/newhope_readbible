"use client";

import { useTransition } from "react";
import { leaveTeam } from "@/src/presentation/actions/teamActions";
import { useRouter } from "next/navigation";

export function TeamMemberActions() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLeaveTeam = () => {
    if (!confirm("정말로 현재 팀에서 탈퇴하시겠습니까?\n탈퇴 후에도 본인의 읽기 기록은 유지되지만, 팀 통계에서는 제외됩니다.")) {
      return;
    }

    startTransition(async () => {
      const res = await leaveTeam();
      if (res.success) {
        alert("팀에서 탈퇴되었습니다. 새로운 팀에 가입하거나 팀을 생성하실 수 있습니다.");
        router.push("/team");
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#e4e2de]">
      <div className="bg-[#fdf2f2] rounded-2xl p-6 border border-[#ffdad6]">
        <h3 className="text-[#ba1a1a] font-bold mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          나의 소속 관리
        </h3>
        <p className="text-[#75777e] text-sm mb-6 leading-relaxed">
          현재 소속된 팀에서 나가고 싶으신가요? <br />
          다른 팀으로 옮기려면 먼저 현재 팀에서 탈퇴한 후 새로운 팀에 가입해 주세요.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLeaveTeam}
            disabled={isPending}
            className="px-6 py-3 bg-[#ba1a1a] text-white rounded-xl font-bold hover:bg-[#93000a] transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {isPending ? "탈퇴 처리 중..." : "팀 탈퇴하기"}
          </button>
          
          <button
            onClick={() => router.push("/team?switch=true")}
            className="px-6 py-3 bg-white text-[#45474d] border border-[#c5c6ce] rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
            다른 팀 둘러보기
          </button>

        </div>
        
        <p className="mt-4 text-[11px] text-[#75777e]">
          ※ 팀장님은 팀을 해체하거나 팀장을 위임한 후에만 탈퇴가 가능합니다.
        </p>
      </div>
    </div>
  );
}
