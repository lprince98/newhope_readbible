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
      <div>
        <label className="field-label" htmlFor="password">
          새로운 비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상 입력"
          required
          className="field"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="confirmPassword">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호 다시 입력"
          required
          className="field"
        />
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary mt-1 w-full">
        {isPending ? "변경 중..." : "비밀번호 변경 완료"}
      </button>
    </form>
  );
}
