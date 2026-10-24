"use client";

import { useState, useTransition } from "react";
import { resetPasswordAction } from "@/src/presentation/actions/authActions";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await resetPasswordAction(email);
      if (res.success) {
        setMessage({ type: "success", text: "비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요!" });
      } else {
        setMessage({ type: "error", text: res.error || "이메일 발송에 실패했습니다." });
      }
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="email">
            가입한 이메일 주소
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="field"
          />
        </div>

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-xl px-4 py-3 text-[14px] ${
              message.type === "success" ? "bg-teal-soft text-teal-deep" : "bg-danger-soft text-danger"
            }`}
          >
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        <button type="submit" disabled={isPending} className="btn btn-primary mt-1 w-full">
          {isPending ? "발송 중..." : "재설정 링크 보내기"}
        </button>
      </form>

      <div className="border-t border-line pt-5 text-center">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-[14px] font-semibold text-brand transition-colors hover:text-brand-deep"
        >
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
