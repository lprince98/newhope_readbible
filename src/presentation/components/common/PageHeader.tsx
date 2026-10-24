/**
 * 각 페이지 상단의 제목 영역
 * eyebrow(작은 라벨) · 제목 · 설명 · 오른쪽 액션을 일관된 형태로 보여줍니다.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="eyebrow flex items-center gap-1.5 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            {eyebrow}
          </span>
        )}
        <h2 className="page-title">{title}</h2>
        {description && <p className="text-[14px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </header>
  );
}
