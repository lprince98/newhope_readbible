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
    <section className="flex flex-col gap-6 items-center w-full">
      <button
        onClick={handleSignOut}
        disabled={isPending}
        className="w-full bg-[#fdf2f2] text-[#ba1a1a] h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#ffe5e5] transition-colors border border-[#ffdad6] disabled:opacity-50"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <span className="material-symbols-outlined">logout</span>
        {isPending ? "처리 중..." : "로그아웃"}
      </button>

      <button
        onClick={handleWithdraw}
        disabled={isPending}
        className="text-[#75777e] text-xs underline hover:text-[#ba1a1a] transition-colors cursor-pointer p-2 disabled:opacity-50 mb-10"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {isPending ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
      </button>
    </section>
  );
}
