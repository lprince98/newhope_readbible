import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";
import type { DashboardDto } from "../dto/DashboardDto";

/** "YYYY-MM-DD" 문자열을 로컬 날짜로 파싱 (UTC 편차 방지) */
function parseDateString(dateStr: string | Date): string {
  if (dateStr instanceof Date) {
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, "0");
    const d = String(dateStr.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(dateStr).slice(0, 10);
}

export class GetDashboardUseCase {
  constructor(private repo: IReadingRecordRepository) {}

  async execute(
    userId: string, 
    teamName: string | null, 
    dailyGoal: number = 4
  ): Promise<DashboardDto> {
    const today = new Date();
    const todayStr = parseDateString(today);

    const todayRecords = await this.repo.findByUserIdAndDate(userId, today);
    const todayChapters = todayRecords.reduce((s, r) => s + r.chapterCount, 0);

    // 이번 주 시작일 (월요일) — 로컬 기준
    const dayOfWeek = today.getDay(); 
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyChapters = Array(7).fill(0);
    const allRecords = await this.repo.findByUserId(userId);

    for (const r of allRecords) {
      const readDateStr = parseDateString(r.readAt);
      const readDate = new Date(readDateStr + "T00:00:00");
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
      dailyGoal: dailyGoal,
      todayPercent: Math.min(100, Math.round((todayChapters / dailyGoal) * 100)),
      weeklyChapters,
      teamName,
      teamRank,
    };
  }
}
