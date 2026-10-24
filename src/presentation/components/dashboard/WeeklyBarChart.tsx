"use client";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const BAR_MAX_HEIGHT = 120; // px — 아래 h-[120px] / h-[160px]와 맞춰 주세요

interface WeeklyBarChartProps {
  weeklyChapters: number[];
  todayDayIndex: number; // 0=월 ~ 6=일
}

export function WeeklyBarChart({ weeklyChapters, todayDayIndex }: WeeklyBarChartProps) {
  const max = Math.max(...weeklyChapters, 1);

  return (
    <div className="flex h-[160px] items-end justify-between gap-2 border-b border-line pb-2">
      {DAYS.map((day, i) => {
        const count = weeklyChapters[i] ?? 0;
        const barHeight = Math.max(
          Math.round((count / max) * BAR_MAX_HEIGHT),
          count > 0 ? 8 : 4,
        );
        const isToday = i === todayDayIndex;

        return (
          <div key={day} className="group flex flex-1 flex-col items-center gap-1.5">
            {/* 고정 높이 영역 — 막대 정렬용 */}
            <div className="relative flex h-[120px] w-full items-end justify-center">
              {count > 0 && (
                <div
                  className={`absolute left-1/2 z-10 -translate-x-1/2 rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white transition-opacity ${
                    isToday ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{ bottom: `${barHeight + 6}px` }}
                >
                  {count}장
                </div>
              )}
              <div
                className={`w-full max-w-9 rounded-t-lg transition-all duration-700 ease-out ${
                  isToday
                    ? "bg-brand"
                    : count > 0
                      ? "bg-teal group-hover:bg-teal-deep"
                      : "bg-sunken group-hover:bg-silver"
                }`}
                style={{ height: `${barHeight}px` }}
              />
            </div>
            <span className={`text-[12px] ${isToday ? "font-bold text-brand" : "text-muted"}`}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
