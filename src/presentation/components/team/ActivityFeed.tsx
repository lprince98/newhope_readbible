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
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e4e2de] p-8 text-center text-[#75777e]"
        style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
        아직 읽기 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.map((item) => {
        const book = BIBLE_BOOKS.find((b) => b.id === item.book_id);
        const chapterCount = item.end_chapter - item.start_chapter + 1;
        const chapterText = item.start_chapter === item.end_chapter
          ? `${item.start_chapter}장`
          : `${item.start_chapter}~${item.end_chapter}장`;
        const initials = item.user_name.charAt(0);

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(4,17,41,0.03)] flex gap-3 items-start border border-[#e4e2de] hover:border-[#c5c6ce] transition-colors"
          >
            {/* 아바타 */}
            <div className="w-10 h-10 rounded-full bg-[#eae8e4] flex items-center justify-center flex-shrink-0 border border-[#c5c6ce]">
              <span className="text-[#1b1c1a]"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "16px", fontWeight: 700 }}>
                {initials}
              </span>
            </div>
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
                className="text-[#1b1c1a]">
                {item.user_name}
              </p>
              <p className="text-[#45474d] mt-0.5"
                style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px", lineHeight: "24px" }}>
                <strong className="text-[#041129] font-medium">{book?.name ?? item.book_id}</strong>{" "}
                {chapterText}을 읽었습니다
                {chapterCount > 1 && (
                  <span className="ml-1.5 text-[#775a19] font-medium"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
                    +{chapterCount}장
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[#75777e]"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px" }}>
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {timeAgo(item.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
