"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/home",      icon: "home",        label: "홈"   },
  { href: "/record",    icon: "menu_book",   label: "기록"  },
  { href: "/dashboard", icon: "dashboard",   label: "현황"  },
  { href: "/ranking",   icon: "leaderboard", label: "랭킹"  },
  { href: "/team",      icon: "groups",      label: "팀"   },
] as const;


export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_12px_rgba(26,38,63,0.05)] rounded-t-2xl pb-safe">
      <div className="flex justify-around items-center px-4 py-3">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-16 transition-colors active:scale-90 duration-150 ${
                isActive
                  ? "text-[#B8860B]"
                  : "text-slate-400 hover:text-[#1A263F]"
              }`}
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px", fontWeight: 500 }}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
              <span>{label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-[#B8860B] rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
