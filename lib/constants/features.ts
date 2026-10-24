/**
 * 애플리케이션 기능 활성화 제어 스위치
 */
export const FEATURES = {
  /** 팀(소그룹) 기능 활성화 여부 */
  enableTeamFeatures: true,
  /** 랭킹 기능 활성화 여부 */
  enableRanking: true,
  /** 성경 기록 업로드 마감 일시 (ISO 형식 예: "2026-07-01T00:00:00+09:00"). null이면 무기한 허용 */
  uploadDeadline: null as string | null,
  /**
   * 현재 시즌 시작일 (KST, "YYYY-MM-DD"). 이 날짜 이후의 읽기 기록만 진도·랭킹·팀 현황에 집계됩니다.
   * null이면 전체 기간을 집계합니다.
   */
  seasonStartDate: "2026-11-01" as string | null,
} as const;
