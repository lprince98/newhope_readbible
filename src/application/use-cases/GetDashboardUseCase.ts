import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";
import type { DashboardDto } from "../dto/DashboardDto";

const DAILY_GOAL = 4; // 하루 목표 장 수

/** "YYYY-MM-DD" 문자열을 로컬 날짜로 파싱 (UTC 편차 방지) */
function parseDateString(dateStr: string | Date): string {
  if (dateStr instanceof Date) {
    // read_at이 Date 객체로 오는 경우 로컬 날짜 문자열로 변환
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, "0");
    const d = String(dateStr.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // "2026-04-22T..." 형식이면 앞 10자리만
  return String(dateStr).slice(0, 10);
}

export class GetDashboardUseCase {
  constructor(private repo: IReadingRecordRepository) {}

  async execute(userId: string, teamName: string | null): Promise<DashboardDto> {
    const today = new Date();
    const todayStr = parseDateString(today);

    const todayRecords = await this.repo.findByUserIdAndDate(userId, today);
    const todayChapters = todayRecords.reduce((s, r) => s + r.chapterCount, 0);

    // 이번 주 시작일 (월요일) — 로컬 기준
    const dayOfWeek = today.getDay(); // 0=일, 1=월 ... 6=토
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일까지 offset
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyChapters = Array(7).fill(0);
    const allRecords = await this.repo.findByUserId(userId);

    for (const r of allRecords) {
      const readDateStr = parseDateString(r.readAt);
      // weekStart부터 며칠 차이인지 계산 (날짜 문자열로 비교)
      const readDate = new Date(readDateStr + "T00:00:00"); // 로컬 자정
      const diff = Math.floor(
        (readDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff >= 0 && diff < 7) {
        weeklyChapters[diff] += r.chapterCount;
      }
    }

    // 팀 랭킹
    const teamCounts = await this.repo.getTeamChapterCounts();
    const teamRank = teamName
      ? teamCounts.findIndex((t) => t.teamName === teamName) + 1 || null
      : null;

    return {
      todayChapters,
      dailyGoal: DAILY_GOAL,
      todayPercent: Math.min(100, Math.round((todayChapters / DAILY_GOAL) * 100)),
      weeklyChapters,
      teamName,
      teamRank,
    };
  }
}
