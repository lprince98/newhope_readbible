"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";

export function Header({ title = "새소망교회" }: { title?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Google Fonts + Material Symbols */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Serif+KR:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white border-b border-slate-100 shadow-[0_4px_12px_rgba(26,38,63,0.05)]">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="메뉴"
          className="text-[#1A263F] hover:bg-slate-50 active:scale-95 transition-transform duration-200 p-2 -ml-2 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-lg font-bold text-[#1A263F] uppercase tracking-widest"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {title}
        </h1>
        <Link
          href="/profile"
          aria-label="프로필"
          className="w-9 h-9 rounded-full bg-[#efeeea] overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-[#45474d] text-xl">person</span>
        </Link>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
