"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm border border-[#c5c6ce]/30 rounded-full flex items-center justify-center text-[#041129] shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
      aria-label="뒤로 가기"
    >
      <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
    </button>
  );
}
