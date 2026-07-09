/**
 * 애플리케이션 기능 활성화 제어 스위치
 */
export const FEATURES = {
  /** 팀(소그룹) 기능 활성화 여부 */
  enableTeamFeatures: false,
  /** 랭킹 기능 활성화 여부 */
  enableRanking: false,
  /** 성경 기록 업로드 마감 일시 (ISO 형식 예: "2026-07-01T00:00:00+09:00"). null이면 무기한 허용 */
  uploadDeadline: null as string | null,
} as const;
