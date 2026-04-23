import { BIBLE_BOOKS } from "@/lib/constants/bible-books";
import { createClient } from "@/src/infrastructure/supabase/server";

export async function RecentRecords() {
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
      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#c5c6ce]">
        <p className="text-[#75777e] text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>
          최근 기록이 없습니다. 성경 읽기를 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[#041129] font-bold text-lg px-2" style={{ fontFamily: "Manrope, sans-serif" }}>
        최근 읽기 기록
      </h3>
      <div className="flex flex-col gap-3">
        {records.map((record) => {
          const book = BIBLE_BOOKS.find((b) => b.id === record.book_id);
          const chapters = record.start_chapter === record.end_chapter
            ? `${record.start_chapter}장`
            : `${record.start_chapter}~${record.end_chapter}장`;
          const count = record.end_chapter - record.start_chapter + 1;

          return (
            <div
              key={record.id}
              className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#e4e2de] flex justify-between items-center"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#041129] font-bold" style={{ fontFamily: "Noto Serif KR, serif" }}>
                    {book?.name ?? record.book_id}
                  </span>
                  <span className="text-[#775a19] text-sm font-medium" style={{ fontFamily: "Manrope, sans-serif" }}>
                    {chapters}
                  </span>
                </div>
                <p className="text-[#75777e] text-[11px]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {new Date(record.read_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#041129] font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                  +{count}장
                </span>
                {record.memo && (
                  <span className="text-[#75777e] text-[10px] max-w-[120px] truncate">
                    {record.memo}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
