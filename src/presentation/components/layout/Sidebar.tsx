"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FEATURES } from "@/lib/constants/features";
import { BrandLogo } from "../common/BrandLogo";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: { name: string; teamName: string } | null;
}

export function Sidebar({ isOpen, onClose, profile }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);


  const MENU_ITEMS = [
    { href: "/home",      icon: "home",         label: "홈" },
    { href: "/dashboard", icon: "insights",     label: "나의 통독 현황" },
    { href: "/record",    icon: "menu_book",    label: "성경 읽기 기록" },
    ...(FEATURES.enableRanking ? [{ href: "/ranking",   icon: "trophy",  label: FEATURES.enableTeamFeatures ? "팀 · 개인 랭킹" : "통독 랭킹" }] : []),
    ...(FEATURES.enableTeamFeatures ? [{ href: "/team",      icon: "groups",       label: "우리 팀" }] : []),
    { href: "/profile",   icon: "person",       label: "마이 프로필" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[70] flex w-[300px] max-w-[85vw] flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <BrandLogo variant="lockup" size={34} />
          <button
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sunken hover:text-ink"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Profile */}
        <div className="relative mx-4 overflow-hidden rounded-2xl bg-brand p-5 text-white">
          <span className="hope-arc -right-10 -bottom-16 h-40 w-40 text-white/15" />
          <span className="hope-arc -right-4 -bottom-10 h-28 w-28 text-white/10" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
              {profile?.name?.charAt(0) ?? "성"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold">{profile?.name ?? "사용자"} 성도님</p>
              {FEATURES.enableTeamFeatures && (
                <p className="mt-0.5 truncate text-[13px] text-white/70">{profile?.teamName ?? "팀 미배정"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-4 flex-1 overflow-y-auto px-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`mb-0.5 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition-colors ${
                  isActive
                    ? "bg-brand-soft font-bold text-brand"
                    : "font-medium text-ink-soft hover:bg-sunken"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-line px-5 py-4">
          <BrandLogo variant="wordmark" size={28} className="opacity-70" />
          <p className="mt-2 text-[11px] text-subtle">© 2026 새소망교회 성경 통독</p>
        </div>
      </aside>
    </>
  );
}
