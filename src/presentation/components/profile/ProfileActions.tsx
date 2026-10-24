"use client";

import { useTransition } from "react";
import { signOutAction, withdrawAction } from "@/src/presentation/actions/authActions";

export function ProfileActions() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const handleWithdraw = () => {
    if (!confirm("정말로 회원을 탈퇴하시겠습니까?\n모든 데이터가 영구히 삭제되며 복구할 수 없습니다.")) {
      return;
    }

    startTransition(async () => {
      const res = await withdrawAction();
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <section className="mt-2 flex w-full flex-col items-center gap-3 pb-10">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="btn btn-secondary w-full"
      >
        <span className="material-symbols-outlined text-[20px] text-muted">logout</span>
        {isPending ? "처리 중..." : "로그아웃"}
      </button>

      <button
        type="button"
        onClick={handleWithdraw}
        disabled={isPending}
        className="min-h-11 cursor-pointer px-3 text-[13px] text-subtle underline underline-offset-2 transition-colors hover:text-danger disabled:opacity-50"
      >
        {isPending ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
      </button>
    </section>
  );
}
