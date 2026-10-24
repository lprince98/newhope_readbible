import Image from "next/image";

/**
 * 새소망교회 로고
 * - symbol: 십자가+잎사귀 심볼만 (헤더, 아이콘 자리)
 * - lockup: 심볼 + "새소망 성경 통독" 텍스트 (사이드바, 로그인 등)
 * - wordmark: 교회 공식 워드마크 이미지 (넓은 공간)
 */
export function BrandLogo({
  variant = "lockup",
  size = 36,
  className = "",
}: {
  variant?: "symbol" | "lockup" | "wordmark";
  size?: number;
  className?: string;
}) {
  if (variant === "wordmark") {
    // 원본 비율 1268 x 357
    return (
      <Image
        src="/logo-wordmark.png"
        alt="기독교대한감리회 새소망교회"
        width={Math.round(size * (1268 / 357))}
        height={size}
        className={className}
        priority
      />
    );
  }

  const symbol = (
    <Image
      src="/logo-symbol.png"
      alt={variant === "symbol" ? "새소망교회" : ""}
      width={size}
      height={Math.round(size * (260 / 268))}
      className="shrink-0"
      priority
    />
  );

  if (variant === "symbol") return <span className={className}>{symbol}</span>;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {symbol}
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-muted">새소망교회</span>
        <span className="mt-1 text-[16px] font-bold tracking-tight text-ink">성경 통독</span>
      </span>
    </span>
  );
}
