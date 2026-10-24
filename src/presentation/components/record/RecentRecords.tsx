import { BIBLE_BOOKS } from "@/lib/constants/bible-books";
import { createClient } from "@/src/infrastructure/supabase/server";
import { RecordItemAction } from "./RecordItemAction";

export async function RecentRecords({ isClosed = false }: { isClosed?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: records, error } = await supabase
    .from("reading_records")
    .select("*")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !records || records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[1.25rem] border border-dashed border-silver bg-card px-4 py-10 text-center">
        <span className="material-symbols-outlined text-[28px] text-silver">menu_book</span>
        <p className="text-[14px] text-muted">
          최근 기록이 없습니다. 성경 읽기를 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="px-1 text-[17px] font-bold text-ink">
        최근 읽기 기록
      </h3>
      <ul className="card divide-y divide-line overflow-hidden">
        {records.map((record) => {
          const book = BIBLE_BOOKS.find((b) => b.id === record.book_id);
          const chapters = record.start_chapter === record.end_chapter
            ? `${record.start_chapter}장`
            : `${record.start_chapter}~${record.end_chapter}장`;
          const count = record.end_chapter - record.start_chapter + 1;

          return (
            <li
              key={record.id}
              className="flex items-center justify-between gap-3 py-3 pr-2 pl-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[15px] font-bold text-ink">
                    {book?.name ?? record.book_id}
                  </span>
                  <span className="text-[14px] font-medium text-brand">
                    {chapters}
                  </span>
                </div>
                <p className="truncate text-[12px] text-subtle">
                  {(() => {
                    const [, m, d] = record.read_at.split("-");
                    return `${parseInt(m)}월 ${parseInt(d)}일`;
                  })()}
                  {record.memo && (
                    <span className="ml-1.5 text-muted">· {record.memo}</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="chip bg-teal-soft text-teal-deep">
                  +{count}장
                </span>
                {/* 수정/삭제 버튼 */}
                {!isClosed && <RecordItemAction recordId={record.id} />}
              </div>
            </li>

          );
        })}
      </ul>
    </section>
  );
}
