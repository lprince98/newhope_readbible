"use client";

interface CircularProgressProps {
  percent: number;
  todayChapters: number;
  dailyGoal: number;
}

export function CircularProgress({ percent, todayChapters, dailyGoal }: CircularProgressProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ≈ 251.2
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* 배경 원 */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#efeeea"
            strokeWidth="8"
          />
          {/* 진도 원 */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#775a19"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "28px", fontWeight: 700, lineHeight: "36px" }}
          >
            {percent}%
          </span>
          <span
            className="text-[#45474d]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px", fontWeight: 400 }}
          >
            오늘의 목표
          </span>
        </div>
      </div>
      <p
        className="text-[#1b1c1a] mt-6 text-center"
        style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
      >
        오늘 {dailyGoal}장 중 {todayChapters}장을 읽으셨습니다.
        {percent < 100 && <><br />조금만 더 힘내세요!</>}
        {percent >= 100 && <><br />오늘 목표를 달성했습니다! 🎉</>}
      </p>
    </div>
  );
}
