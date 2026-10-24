import type { ReadingRecord } from "../entities/ReadingRecord";
import type { BibleBookId } from "@/lib/constants/bible-books";

export interface NewReadingRecord {
  userId: string;
  bookId: BibleBookId;
  startChapter: number;
  endChapter: number;
  memo: string | null;
  readAt: Date;
}

export interface IReadingRecordRepository {
  /** 사용자의 읽기 기록 조회 (since: "YYYY-MM-DD" 시즌 시작일, 지정 시 그 이후만) */
  findByUserId(userId: string, since?: string | null): Promise<ReadingRecord[]>;

  /** 특정 날짜의 읽기 기록 조회 */
  findByUserIdAndDate(userId: string, date: Date): Promise<ReadingRecord[]>;

  /** 특정 권의 읽기 기록 조회 */
  findByUserIdAndBook(
    userId: string,
    bookId: BibleBookId,
  ): Promise<ReadingRecord[]>;

  /** 읽기 기록 저장 */
  save(record: NewReadingRecord): Promise<ReadingRecord>;

  /** 읽기 기록 삭제 */
  deleteById(id: string, userId: string): Promise<void>;

  /** 팀별 총 읽은 장 수 집계 */
  getTeamChapterCounts(since?: string | null): Promise<
    { teamId: string; teamName: string; totalChapters: number }[]
  >;

  /** 개인별 총 읽은 장 수 집계 (Top 10) */
  getIndividualRanking(since?: string | null): Promise<
    { userId: string; userName: string; teamName: string | null; totalChapters: number; fullReadCount: number; currentChapters: number }[]
  >;

  /** 특정 팀 내 개별 팀원들의 통독 진행 현황 조회 */
  getMemberChapterCounts(
    teamId: string,
    since?: string | null,
  ): Promise<
    {
      userId: string;
      userName: string;
      totalChapters: number;
      fullReadCount: number;
      currentChapters: number;
    }[]
  >;
}

