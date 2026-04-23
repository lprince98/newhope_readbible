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
    <div className="flex flex-col gap-6 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[#1b1c1a] ml-1 text-sm font-medium" htmlFor="email">
            가입한 이메일 주소
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#775a19]/50 focus:border-[#775a19] transition-all"
          />
        </div>

        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
            message.type === "success" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#ffdad6] text-[#93000a]"
          }`}>
            <span className="material-symbols-outlined text-[18px] mt-0.5">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[48px] bg-[#041129] text-white py-3 rounded-lg mt-2 hover:bg-[#041129]/90 active:scale-[0.98] transition-all flex justify-center items-center font-medium disabled:opacity-50"
        >
          {isPending ? "발송 중..." : "재설정 링크 보내기"}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-[#c5c6ce]/30">
        <Link href="/login" className="text-[#775a19] hover:text-[#041129] transition-colors text-sm font-medium">
          로그인 화면으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
