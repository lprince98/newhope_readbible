import type { BibleBookId } from "@/lib/constants/bible-books";

/** 읽기 기록 엔티티 */
export class ReadingRecord {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: BibleBookId,
    public readonly startChapter: number,
    public readonly endChapter: number,
    public readonly memo: string | null,
    public readonly readAt: Date,
    public readonly createdAt: Date,
  ) {}

  /** 읽은 장 수 */
  get chapterCount(): number {
    return this.endChapter - this.startChapter + 1;
  }
}
