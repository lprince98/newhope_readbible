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
        onClick={() => setIsExpanded(true)}
        className="w-full flex justify-between items-center px-6 py-4 bg-white rounded-2xl border border-[#e4e2de] shadow-sm hover:bg-[#fbf9f5] transition-all"
      >
        <span className="text-[#041129] font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>비밀번호 변경</span>
        <span className="material-symbols-outlined text-[#75777e]">lock</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e4e2de] shadow-md flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[#041129] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>비밀번호 변경</h3>
        <button onClick={() => setIsExpanded(false)} className="text-[#75777e] hover:text-[#041129]">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="새 비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#775a19]/50"
          required
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-[#efeeea] border border-[#c5c6ce] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#775a19]/50"
          required
        />

        {message && (
          <div className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span className="material-symbols-outlined text-sm">{message.type === "success" ? "check_circle" : "error"}</span>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#041129] text-white py-3 rounded-xl font-bold mt-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? "변경 중..." : "새 비밀번호 저장"}
        </button>
      </form>
    </div>
  );
}
