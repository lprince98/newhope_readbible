import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";
import type { DashboardDto } from "../dto/DashboardDto";
import { GetUnreadChaptersUseCase } from "./GetUnreadChaptersUseCase";

function parseDateString(dateStr: string | Date): string {
  if (dateStr instanceof Date) {
    // 날짜 객체를 "YYYY-MM-DD" 형식의 UTC 문자열로 변환 (서버 타임존 영향 방지)
    const y = dateStr.getUTCFullYear();
    const m = String(dateStr.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dateStr.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // 문자열인 경우 앞 10자리(날짜 부분)만 추출
  return String(dateStr).slice(0, 10);
}

/**
 * 대시보드에 필요한 모든 통계 데이터를 집계하는 유스케이스 클래스
 */
export class GetDashboardUseCase {
  constructor(private repo: IReadingRecordRepository) {}

  /**
   * 사용자 ID와 팀 정보를 바탕으로 오늘/주간 통계 및 팀 순위를 계산하여 반환합니다.
   * @param userId 사용자 고유 ID
   * @param teamName 사용자가 소속된 팀 이름 (없을 경우 null)
   * @param dailyGoal 사용자가 설정한 개인 하루 목표 장 수 (기본값 4)
   */
  async execute(
    userId: string, 
    teamName: string | null, 
    dailyGoal: number = 4
  ): Promise<DashboardDto> {
    const today = new Date();
    const kstToday = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));

    // 1. 오늘의 읽기 기록 조회 및 합계 계산
    const todayRecords = await this.repo.findByUserIdAndDate(userId, today);
    const todayChapters = todayRecords.reduce((s, r) => s + r.chapterCount, 0);

    // 2. 주간 통계를 위한 이번 주 시작일(월요일) 계산
    const dayOfWeek = kstToday.getDay(); // 0:일, 1:월, ..., 6:토
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일로 가기 위한 오프셋
    const weekStart = new Date(kstToday);
    weekStart.setDate(kstToday.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    // 3. 주간 요일별 읽은 장 수 집계 (월~일, 7개 요소)
    const weeklyChapters = Array(7).fill(0);
    const allRecords = await this.repo.findByUserId(userId);

    for (const r of allRecords) {
      const readDateStr = parseDateString(r.readAt);
      const readDate = new Date(readDateStr + "T00:00:00");
      // 월요일(weekStart)로부터 며칠이 지났는지 계산
      const diff = Math.floor(
        (readDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      // 이번 주(0~6일 사이)에 해당하는 기록만 집계
      if (diff >= 0 && diff < 7) {
        weeklyChapters[diff] += r.chapterCount;
      }
    }

    // 4. 팀 랭킹 정보 조회 (전체 팀 중 현재 팀의 순위)
    const teamCounts = await this.repo.getTeamChapterCounts();
    const teamRank = teamName
      ? teamCounts.findIndex((t) => t.teamName === teamName) + 1 || null
      : null;

    // 5. 전체 누적 통독 횟수 계산 (1독 = 1189장)
    const totalChapters = allRecords.reduce((s, r) => s + r.chapterCount, 0);
    const totalFullReads = Math.floor(totalChapters / 1189);
    // 현재 독 회차의 진행 장수 (리셋 후 장수)
    const currentCycleChapters = totalChapters % 1189;

    // 5.5 미독/누락 장 목록 계산
    const unreadUseCase = new GetUnreadChaptersUseCase();
    const unreadBooks = unreadUseCase.execute(allRecords);
    const totalUnreadChaptersCount = unreadBooks.reduce((sum, b) => sum + b.totalUnreadCount, 0);

    // 6. 최종 대시보드 데이터 조립
    return {
      todayChapters,
      dailyGoal: dailyGoal,
      // 달성률 계산 (최대 100%)
      todayPercent: Math.min(100, Math.round((todayChapters / dailyGoal) * 100)),
      weeklyChapters,
      teamName,
      teamRank,
      totalFullReads,
      currentCycleChapters,
      unreadBooks,
      totalUnreadChaptersCount,
    };
  }
}
