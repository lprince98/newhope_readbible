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
}
