/** 대시보드 응답 DTO */
export interface DashboardDto {
  /** 오늘 읽은 장 수 */
  todayChapters: number;
  /** 오늘 목표 장 수 */
  dailyGoal: number;
  /** 오늘 달성률 (0~100) */
  todayPercent: number;
  /** 이번 주 요일별 읽은 장 수 (월~일) */
  weeklyChapters: number[];
  /** 내 팀 이름 */
  teamName: string | null;
  /** 내 팀 순위 */
  teamRank: number | null;
  /** 누적 통독 횟수 */
  totalFullReads: number;
  /** 현재 독 진행 장수 (총장수 % 1189) */
  currentCycleChapters: number;
}
