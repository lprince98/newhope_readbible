"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/src/infrastructure/supabase/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; teamName: string | null } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchProfile();
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("name, teams(name)")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfile({
          name: data.name,
          teamName: (data.teams as any)?.name ?? "팀 미배정",
        });
      }
    }
  }

  const MENU_ITEMS = [
    { href: "/home",      icon: "home",         label: "홈" },
    { href: "/dashboard", icon: "bar_chart",    label: "나의 현황 (대시보드)" },
    { href: "/record",    icon: "menu_book",    label: "성경 읽기 기록" },
    { href: "/ranking",   icon: "leaderboard",  label: "팀 랭킹" },
    { href: "/team",      icon: "groups",       label: "나의 팀 상세" },
    { href: "/profile",   icon: "person",       label: "마이 프로필" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 bg-[#041129] text-white">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#fed488] text-[#785a1a] flex items-center justify-center text-xl font-bold">
              {profile?.name?.charAt(0) ?? "성"}
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
            {profile?.name ?? "사용자"} 성도님
          </h2>
          <p className="text-sm text-white/60" style={{ fontFamily: "Manrope, sans-serif" }}>
            {profile?.teamName ?? "소속 팀 정보를 불러오는 중..."}
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Main Menu
          </div>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
                  isActive
                    ? "bg-[#f5f3ef] text-[#775a19] font-bold"
                    : "text-[#45474d] hover:bg-slate-50"
                }`}
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}
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
        <div className="p-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center" style={{ fontFamily: "Manrope, sans-serif" }}>
            © 2026 새소망교회 성경 통독<br />v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
