"use client";

interface CircularProgressProps {
  percent: number;
  todayChapters: number;
  dailyGoal: number;
  totalFullReads?: number;
  currentCycleChapters?: number;
}

export function CircularProgress({ percent, todayChapters, dailyGoal, totalFullReads, currentCycleChapters }: CircularProgressProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ≈ 251.2
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="circular-progress-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-teal-deep)" />
              <stop offset="100%" stopColor="var(--color-teal)" />
            </linearGradient>
          </defs>
          {/* 배경 원 */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="var(--color-sunken)"
            strokeWidth="8"
          />
          {/* 진도 원 */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="url(#circular-progress-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] leading-tight font-extrabold tracking-tight text-teal">
            {percent}<span className="text-[18px] font-bold">%</span>
          </span>
          <span className="text-[12px] text-muted">
            오늘의 목표
          </span>
        </div>
      </div>
      <p className="mt-6 text-center text-[14px] leading-relaxed font-medium text-ink-soft">
        오늘 {dailyGoal}장 중 <span className="font-semibold text-teal-deep">{todayChapters}장</span>을 읽으셨습니다.
        {percent < 100 && <><br /><span className="text-muted">조금만 더 힘내세요!</span></>}
        {percent >= 100 && <><br /><span className="font-semibold text-teal-deep">오늘 목표를 달성했습니다! 🎉</span></>}
      </p>

      {totalFullReads !== undefined && totalFullReads >= 0 && (
        <div className="chip mt-4 bg-brand-soft px-3.5 py-1.5 text-brand">
          <span className="material-symbols-outlined text-[16px]">auto_stories</span>
          {totalFullReads}독 완료
          {currentCycleChapters !== undefined && (
            <span className="font-normal text-brand/80">
              · {currentCycleChapters} / 1189장
            </span>
          )}
        </div>
      )}
    </div>
  );
}
