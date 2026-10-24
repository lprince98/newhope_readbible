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
    <section className="mt-4 border-t border-line pt-6">
      <div className="card flex flex-col gap-4 p-5">
        <div>
          <h3 className="flex items-center gap-1.5 text-[16px] font-bold text-ink">
            <span className="material-symbols-outlined text-[20px] text-muted">logout</span>
            나의 소속 관리
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            현재 소속된 팀에서 나가고 싶으신가요?
            <br />
            다른 팀으로 옮기려면 먼저 현재 팀에서 탈퇴한 후 새로운 팀에 가입해 주세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLeaveTeam}
          disabled={isPending}
          className="btn btn-danger w-full sm:w-auto sm:self-start"
        >
          {isPending ? "탈퇴 처리 중..." : "팀 탈퇴하기"}
        </button>

        <p className="text-[12px] text-subtle">
          ※ 팀장님은 팀을 해체하거나 팀장을 위임한 후에만 탈퇴가 가능합니다.
        </p>
      </div>
    </section>
  );
}
