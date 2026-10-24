"use client";

import { useState } from "react";
import { createClient } from "@/src/infrastructure/supabase/client";

/**
 * 카카오 계정으로 로그인/가입하는 버튼
 * 카카오 인증 후 /auth/callback 으로 돌아와 세션을 만들고, 처음 가입이면 실명 입력(/welcome)으로 이동합니다.
 */
export function KakaoLoginButton({ label = "카카오로 시작하기" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("카카오 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setPending(false);
    }
    // 성공하면 카카오 로그인 페이지로 이동하므로 pending 상태를 유지합니다.
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="btn w-full bg-kakao text-[16px] text-kakao-label hover:bg-kakao-hover"
      >
        {/* 카카오 말풍선 심볼 */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#000000"
            d="M12 3C6.48 3 2 6.53 2 10.88c0 2.8 1.86 5.26 4.66 6.65-.2.74-.74 2.7-.85 3.12-.13.52.19.51.4.37.17-.11 2.62-1.78 3.68-2.5.69.1 1.39.15 2.11.15 5.52 0 10-3.53 10-7.79C22 6.53 17.52 3 12 3Z"
          />
        </svg>
        {pending ? "카카오로 이동 중..." : label}
      </button>
      {error && (
        <p role="alert" className="text-center text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
