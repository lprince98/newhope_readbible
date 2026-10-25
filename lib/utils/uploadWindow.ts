/**
 * 성경 기록 입력 기간(시작~마감) 계산
 * 서버 액션(입력 차단)과 화면(공지·안내) 모두 이 결과를 기준으로 판단합니다.
 */

import { FEATURES } from "../constants/features";

export type UploadPhase = "before" | "open" | "closed";

export interface UploadWindow {
  /** 시작 전 / 입력 가능 / 마감 */
  phase: UploadPhase;
  /** 오늘(KST)이 입력 시작일인지 */
  isFirstDay: boolean;
  /** 오늘(KST)이 입력 마감일인지 */
  isLastDay: boolean;
  /** 시작까지 남은 날 수 (KST 날짜 기준, 시작 전일 때만 의미 있음) */
  daysUntilStart: number | null;
  /** 예: "11월 1일(일) 오후 6시" */
  startLabel: string;
  /** 예: "12월 31일(목) 오후 6시" */
  endLabel: string;
  /** 예: "오후 6시" */
  startTimeLabel: string;
  endTimeLabel: string;
}

const KST = "Asia/Seoul";

/** KST 기준 "YYYY-MM-DD" */
function kstDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: KST }).format(date);
}

/** 예: "11월 1일(일)" */
function kstDayLabel(date: Date): string {
  const md = new Intl.DateTimeFormat("ko-KR", { timeZone: KST, month: "long", day: "numeric" }).format(date);
  const wd = new Intl.DateTimeFormat("ko-KR", { timeZone: KST, weekday: "short" }).format(date);
  return `${md}(${wd})`;
}

/** 예: "오후 6시", "오후 6시 30분" */
function kstTimeLabel(date: Date): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).formatToParts(date);
  const period = parts.find((p) => p.type === "dayPeriod")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${period} ${Number(hour)}시${minute !== "00" ? ` ${Number(minute)}분` : ""}`.trim();
}

export function getUploadWindow(
  startAt: string | null,
  deadline: string | null,
  now: Date = new Date(),
): UploadWindow {
  const start = startAt ? new Date(startAt) : null;
  const end = deadline ? new Date(deadline) : null;

  const phase: UploadPhase =
    start && now < start ? "before" : end && now >= end ? "closed" : "open";

  const today = kstDate(now);
  const daysUntilStart = start
    ? Math.round((Date.parse(kstDate(start)) - Date.parse(today)) / 86_400_000)
    : null;

  return {
    phase,
    isFirstDay: !!start && kstDate(start) === today,
    isLastDay: !!end && kstDate(end) === today,
    daysUntilStart,
    startLabel: start ? `${kstDayLabel(start)} ${kstTimeLabel(start)}` : "",
    endLabel: end ? `${kstDayLabel(end)} ${kstTimeLabel(end)}` : "",
    startTimeLabel: start ? kstTimeLabel(start) : "",
    endTimeLabel: end ? kstTimeLabel(end) : "",
  };
}

/** 입력 기간이 아니면 사용자에게 보여줄 안내 문구, 입력 가능하면 null */
export function getUploadBlockMessage(window: UploadWindow): string | null {
  if (window.phase === "before") {
    return `성경 읽기 기록은 ${window.startLabel}부터 입력할 수 있습니다.`;
  }
  if (window.phase === "closed") {
    return `성경 읽기 기록 입력 기간이 마감되었습니다. (${window.endLabel} 마감)`;
  }
  return null;
}

/** 설정(FEATURES)의 입력 기간 기준 현재 상태 */
export function getCurrentUploadWindow(now: Date = new Date()): UploadWindow {
  return getUploadWindow(FEATURES.uploadStartAt, FEATURES.uploadDeadline, now);
}
