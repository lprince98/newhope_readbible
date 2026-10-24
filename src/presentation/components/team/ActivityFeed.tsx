import { BIBLE_BOOKS } from "@/lib/constants/bible-books";

interface ActivityItem {
  id: string;
  user_name: string;
  book_id: string;
  start_chapter: number;
  end_chapter: number;
  read_at: string;
  created_at: string;
}

interface Props {
  activities: ActivityItem[];
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric", timeZone: "Asia/Seoul" });
}

export function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center text-[14px] text-muted">
        <span className="material-symbols-outlined text-[28px] text-silver">menu_book</span>
        아직 읽기 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {activities.map((item) => {
        const book = BIBLE_BOOKS.find((b) => b.id === item.book_id);
        const chapterCount = item.end_chapter - item.start_chapter + 1;
        const chapterText = item.start_chapter === item.end_chapter
          ? `${item.start_chapter}장`
          : `${item.start_chapter}~${item.end_chapter}장`;
        const initials = item.user_name.charAt(0);

        return (
          <div key={item.id} className="card flex items-start gap-3 px-4 py-3.5">
            {/* 아바타 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[15px] font-bold text-teal-deep">
              {initials}
            </div>
            {/* 내용 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-ink">{item.user_name}</p>
                <span className="flex shrink-0 items-center gap-0.5 text-[12px] text-subtle">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {timeAgo(item.created_at)}
                </span>
              </div>
              <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">
                <strong className="font-semibold text-ink">{book?.name ?? item.book_id}</strong>{" "}
                {chapterText}을 읽었습니다
                {chapterCount > 1 && (
                  <span className="chip ml-1.5 bg-teal-soft px-2 py-0.5 align-middle text-[11px] text-teal-deep">
                    +{chapterCount}장
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
