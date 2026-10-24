"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute top-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/80 text-ink shadow-card backdrop-blur-sm transition-all hover:bg-card active:scale-95"
      aria-label="뒤로 가기"
    >
      <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
    </button>
  );
}
