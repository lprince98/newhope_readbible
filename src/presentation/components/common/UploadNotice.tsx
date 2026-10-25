import Link from "next/link";
import type { UploadWindow } from "@/lib/utils/uploadWindow";

/**
 * 성경 기록 입력 기간 공지
 * - 시작일 당일: 시작 안내 (시작 전 / 시작 후)
 * - 마감일 당일: 마감 안내 (마감 전 / 마감 후)
 * - showCountdown: 시작 전 날짜에는 D-day 카드 표시 (홈 화면용)
 * 그 외 날짜에는 아무것도 표시하지 않습니다.
 */
export function UploadNotice({
  window,
  showCountdown = false,
  showRecordLink = false,
}: {
  window: UploadWindow;
  showCountdown?: boolean;
  showRecordLink?: boolean;
}) {
  const { phase, isFirstDay, isLastDay, daysUntilStart, startLabel, endLabel, startTimeLabel, endTimeLabel } = window;

  // ── 마감일 ─────────────────────────────────────────────
  if (isLastDay && phase === "open") {
    return (
      <Notice
        tone="urgent"
        icon="alarm"
        badge="마감일"
        title={`오늘 ${endTimeLabel}에 기록 입력이 마감됩니다`}
        description="아직 입력하지 않은 기록이 있다면 마감 전에 꼭 입력해 주세요."
        link={showRecordLink ? { href: "/record", label: "지금 기록하기" } : undefined}
      />
    );
  }
  if (isLastDay && phase === "closed") {
    return (
      <Notice
        tone="calm"
        icon="volunteer_activism"
        badge="마감"
        title="성경 읽기 기록 입력이 마감되었습니다"
        description="두 달 동안 말씀 통독 여정에 함께해 주셔서 감사합니다."
      />
    );
  }

  // ── 시작일 ─────────────────────────────────────────────
  if (isFirstDay && phase === "before") {
    return (
      <Notice
        tone="start"
        icon="schedule"
        badge="시작일"
        title={`오늘 ${startTimeLabel}부터 기록 입력이 시작됩니다`}
        description={`${endLabel}까지 매일 읽은 말씀을 기록할 수 있어요.`}
      />
    );
  }
  if (isFirstDay && phase === "open") {
    return (
      <Notice
        tone="start"
        icon="celebration"
        badge="시작"
        title="성경 읽기 기록 입력이 시작되었습니다!"
        description={`${endLabel}까지 입력할 수 있어요. 팀과 함께 끝까지 완주해요.`}
        link={showRecordLink ? { href: "/record", label: "첫 기록 남기기" } : undefined}
      />
    );
  }

  // ── 시작 전 카운트다운 (홈) ───────────────────────────────
  if (showCountdown && phase === "before" && daysUntilStart !== null && daysUntilStart > 0) {
    return (
      <section className="flex items-center gap-4 rounded-[1.25rem] border border-teal/20 bg-teal-tint p-5">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal text-white">
          <span className="text-[10px] leading-none font-semibold opacity-80">D</span>
          <span className="text-[17px] leading-tight font-extrabold">-{daysUntilStart}</span>
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-teal-deep">{startLabel}, 팀별 통독이 시작됩니다</h3>
          <p className="mt-0.5 text-[13px] text-muted">그 전에 회원가입과 팀 가입을 마쳐 주세요.</p>
        </div>
      </section>
    );
  }

  return null;
}

const TONES = {
  start: { box: "border-teal/25 bg-teal-tint", icon: "bg-teal text-white", badge: "bg-teal text-white", title: "text-teal-deep" },
  urgent: { box: "border-brand/25 bg-brand-tint", icon: "bg-brand text-white", badge: "bg-brand text-white", title: "text-brand-deep" },
  calm: { box: "border-line bg-card", icon: "bg-sunken text-brand", badge: "bg-sunken text-muted", title: "text-ink" },
} as const;

function Notice({
  tone,
  icon,
  badge,
  title,
  description,
  link,
}: {
  tone: keyof typeof TONES;
  icon: string;
  badge: string;
  title: string;
  description: string;
  link?: { href: string; label: string };
}) {
  const t = TONES[tone];
  return (
    <section role="status" className={`flex flex-col gap-4 rounded-[1.25rem] border p-5 ${t.box}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.icon}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`chip self-start ${t.badge}`}>{badge}</span>
          <h3 className={`text-[16px] leading-snug font-bold ${t.title}`}>{title}</h3>
          <p className="text-[14px] leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      {link && (
        <Link href={link.href} className={`btn w-full ${tone === "urgent" ? "btn-primary" : "btn-teal"}`}>
          {link.label}
        </Link>
      )}
    </section>
  );
}
