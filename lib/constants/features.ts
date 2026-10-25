/**
 * 애플리케이션 기능 활성화 제어 스위치
 */
export const FEATURES = {
  /** 팀(소그룹) 기능 활성화 여부 */
  enableTeamFeatures: true,
  /** 랭킹 기능 활성화 여부 */
  enableRanking: true,
  /**
   * 성경 기록 입력 시작 일시 (ISO, KST). 이 시각 전에는 기록 입력·수정·삭제가 막힙니다. null이면 제한 없음.
   * 시작일 당일에는 홈·기록 화면에 시작 공지가 표시됩니다.
   */
  uploadStartAt: "2026-11-01T18:00:00+09:00" as string | null,
  /**
   * 성경 기록 입력 마감 일시 (ISO, KST). 이 시각부터 기록 입력·수정·삭제가 막힙니다. null이면 무기한 허용.
   * 마감일 당일에는 홈·기록 화면에 마감 공지가 표시됩니다.
   */
  uploadDeadline: "2026-12-31T18:00:00+09:00" as string | null,
  /**
   * 현재 시즌 시작일 (KST, "YYYY-MM-DD"). 이 날짜 이후의 읽기 기록만 진도·랭킹·팀 현황에 집계됩니다.
   * null이면 전체 기간을 집계합니다.
   */
  seasonStartDate: "2026-11-01" as string | null,
} as const;
