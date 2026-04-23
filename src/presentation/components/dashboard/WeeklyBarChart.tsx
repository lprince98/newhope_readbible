"use client";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const BAR_MAX_HEIGHT = 120; // px

interface WeeklyBarChartProps {
  weeklyChapters: number[];
  todayDayIndex: number; // 0=월 ~ 6=일
}

export function WeeklyBarChart({ weeklyChapters, todayDayIndex }: WeeklyBarChartProps) {
  const max = Math.max(...weeklyChapters, 1);

  return (
    <div
      className="flex items-end justify-between gap-2 pb-2 border-b border-[#c5c6ce]"
      style={{ height: `${BAR_MAX_HEIGHT + 40}px` }}
    >
      {DAYS.map((day, i) => {
        const count = weeklyChapters[i] ?? 0;
        const barHeight = Math.max(
          Math.round((count / max) * BAR_MAX_HEIGHT),
          count > 0 ? 8 : 4,
        );
        const isToday = i === todayDayIndex;

        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1.5 group">
            {/* 고정 높이 영역 — 막대 정렬용 */}
            <div
              className="relative flex items-end justify-center w-full"
              style={{ height: `${BAR_MAX_HEIGHT}px` }}
            >
              {count > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#15110a] text-white px-2 py-0.5 rounded text-[10px] transition-opacity whitespace-nowrap z-10">
                  {count}장
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                  isToday
                    ? "bg-[#775a19]"
                    : count > 0
                      ? "bg-[#1a263f]/40 group-hover:bg-[#775a19]"
                      : "bg-[#e4e2de] group-hover:bg-[#c5c6ce]"
                }`}
                style={{ height: `${barHeight}px` }}
              />
            </div>
            <span
              className={`text-[11px] ${isToday ? "font-bold text-[#041129]" : "text-[#45474d]"}`}
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
