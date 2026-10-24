"use client";

import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/src/presentation/actions/authActions";

export function PasswordChangeSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 6자 이상이어야 합니다." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }

    startTransition(async () => {
      const res = await updatePasswordAction(password);
      if (res.success) {
        setMessage({ type: "success", text: "비밀번호가 성공적으로 변경되었습니다." });
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsExpanded(false), 2000);
      } else {
        setMessage({ type: "error", text: res.error || "비밀번호 변경에 실패했습니다." });
      }
    });
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="card flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-sunken"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </span>
          <span className="text-[15px] font-semibold text-ink">비밀번호 변경</span>
        </span>
        <span className="material-symbols-outlined text-[20px] text-subtle">chevron_right</span>
      </button>
    );
  }

  return (
    <div className="card flex flex-col gap-4 p-5 shadow-lift animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-[16px] font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </span>
          비밀번호 변경
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-label="닫기"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-3">
        <input
          type="password"
          autoComplete="new-password"
          aria-label="새 비밀번호"
          placeholder="새 비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          required
        />
        <input
          type="password"
          autoComplete="new-password"
          aria-label="비밀번호 확인"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="field"
          required
        />

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium ${
              message.type === "success" ? "bg-teal-soft text-teal-deep" : "bg-danger-soft text-danger"
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[18px]">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn btn-primary mt-1 w-full">
          {isPending ? "변경 중..." : "새 비밀번호 저장"}
        </button>
      </form>
    </div>
  );
}
