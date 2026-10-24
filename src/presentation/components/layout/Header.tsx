"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { BrandLogo } from "../common/BrandLogo";

interface UserProfile {
  name: string;
  teamName: string;
}

export function Header({ profile }: { profile: UserProfile | null }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-line/80 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="메뉴"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-sunken active:scale-95"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <Link href="/home" aria-label="홈으로" className="transition-opacity hover:opacity-80">
            <BrandLogo variant="lockup" size={32} />
          </Link>

          <Link
            href="/profile"
            aria-label="프로필"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-[15px] font-bold text-brand transition hover:bg-brand hover:text-white active:scale-95"
          >
            {profile?.name?.charAt(0) ?? (
              <span className="material-symbols-outlined text-[20px]">person</span>
            )}
          </Link>
        </div>
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
      />
    </>
  );
}
