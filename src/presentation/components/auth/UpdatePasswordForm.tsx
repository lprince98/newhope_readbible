"use client";

import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/src/presentation/actions/authActions";
import { useRouter } from "next/navigation";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    startTransition(async () => {
      const res = await updatePasswordAction(password);
      if (res.success) {
        alert("비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.");
        router.push("/login");
      } else {
        setError(res.error || "비밀번호 변경에 실패했습니다.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-[#1b1c1a] ml-1 text-sm font-medium" htmlFor="password">
          새로운 비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상 입력"
          required
          className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#775a19]/50 focus:border-[#775a19] transition-all"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[#1b1c1a] ml-1 text-sm font-medium" htmlFor="confirmPassword">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호 다시 입력"
          required
          className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#775a19]/50 focus:border-[#775a19] transition-all"
        />
      </div>

      {error && (
        <div className="bg-[#ffdad6] text-[#93000a] rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full min-h-[48px] bg-[#041129] text-white py-3 rounded-lg mt-2 hover:bg-[#041129]/90 active:scale-[0.98] transition-all flex justify-center items-center font-medium disabled:opacity-50"
      >
        {isPending ? "변경 중..." : "비밀번호 변경 완료"}
      </button>
    </form>
  );
}
