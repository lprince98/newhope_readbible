"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURES } from "@/lib/constants/features";

const NAV_ITEMS = [
  { href: "/home",      icon: "home",      label: "홈"   },
  { href: "/record",    icon: "menu_book", label: "기록"  },
  { href: "/dashboard", icon: "insights",  label: "현황"  },
  { href: "/ranking",   icon: "trophy",    label: "랭킹"  },
  { href: "/team",      icon: "groups",    label: "팀"   },
] as const;


export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed bottom-0 left-0 z-50 w-full border-t border-line/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-2">
        {NAV_ITEMS.filter(item => {
          if (item.href === "/team" && !FEATURES.enableTeamFeatures) return false;
          if (item.href === "/ranking" && !FEATURES.enableRanking) return false;
          return true;
        }).map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-16 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[11px] transition-colors active:scale-95 ${
                isActive ? "font-bold text-brand" : "font-medium text-subtle hover:text-ink-soft"
              }`}
            >
              <span
                className={`material-symbols-outlined flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-brand-soft" : ""
                }`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
