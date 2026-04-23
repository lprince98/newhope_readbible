import type { BibleBookId } from "@/lib/constants/bible-books";

/** 읽기 기록 입력 DTO */
export interface CreateReadingRecordDto {
  userId: string;
  bookId: BibleBookId;
  startChapter: number;
  endChapter: number;
  memo?: string;
  readAt: Date;
}

/** 읽기 기록 응답 DTO */
export interface ReadingRecordDto {
  id: string;
  bookId: BibleBookId;
  bookName: string;
  startChapter: number;
  endChapter: number;
  chapterCount: number;
  memo: string | null;
  readAt: string; // ISO date string
}
