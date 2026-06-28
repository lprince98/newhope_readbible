import { BIBLE_BOOKS } from "@/lib/constants/bible-books";
import type { ReadingRecord } from "@/src/domain/entities/ReadingRecord";
import type { UnreadBookInfo, UnreadChapterRange } from "../dto/DashboardDto";

export class GetUnreadChaptersUseCase {
  /**
   * 사용자의 모든 읽기 기록을 분석하여 현재 회차에서 읽지 않은 장 목록을 추출합니다.
   * @param records 사용자의 전체 성경 읽기 기록 리스트
   */
  execute(records: ReadingRecord[]): UnreadBookInfo[] {
    // 1. 전체 읽은 총 장수 계산 및 완독(1189장 단위) 횟수 산출
    const totalChaptersRead = records.reduce((sum, r) => sum + r.chapterCount, 0);
    const fullReadsCount = Math.floor(totalChaptersRead / 1189);

    // 2. 책별로 각 장을 읽은 횟수를 카운트하기 위한 맵 구성
    // Map<bookId, Map<chapterNumber, readCount>>
    const readCountMap = new Map<string, Map<number, number>>();

    for (const record of records) {
      const { bookId, startChapter, endChapter } = record;
      if (!readCountMap.has(bookId)) {
        readCountMap.set(bookId, new Map<number, number>());
      }
      const bookMap = readCountMap.get(bookId)!;

      for (let ch = startChapter; ch <= endChapter; ch++) {
        const currentCount = bookMap.get(ch) ?? 0;
        bookMap.set(ch, currentCount + 1);
      }
    }

    // 3. 성경 66권을 돌며 완독 기준(읽은 횟수 <= 완독 수)에 부합하는 미독 장들을 찾음
    const unreadBooks: UnreadBookInfo[] = [];

    for (const book of BIBLE_BOOKS) {
      const bookMap = readCountMap.get(book.id);
      const unreadChaptersList: number[] = [];

      for (let ch = 1; ch <= book.chapters; ch++) {
        const count = bookMap?.get(ch) ?? 0;
        // 누적 읽기 횟수가 전체 완독 수 이하인 경우, 현재 회차에서 아직 안 읽은 장으로 처리
        if (count <= fullReadsCount) {
          unreadChaptersList.push(ch);
        }
      }

      if (unreadChaptersList.length > 0) {
        const ranges = this.mergeToRanges(unreadChaptersList);
        unreadBooks.push({
          bookId: book.id,
          bookName: book.name,
          testament: book.testament,
          unreadChapters: ranges,
          totalUnreadCount: unreadChaptersList.length,
        });
      }
    }

    return unreadBooks;
  }

  /**
   * 연속된 숫자 배열을 범위(Range) 구조로 병합합니다.
   * 예: [1, 2, 3, 5, 7, 8] -> [{start: 1, end: 3}, {start: 5, end: 5}, {start: 7, end: 8}]
   */
  private mergeToRanges(chapters: number[]): UnreadChapterRange[] {
    if (chapters.length === 0) return [];
    
    const ranges: UnreadChapterRange[] = [];
    let start = chapters[0];
    let end = chapters[0];

    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i] === end + 1) {
        end = chapters[i];
      } else {
        ranges.push({ start, end });
        start = chapters[i];
        end = chapters[i];
      }
    }
    ranges.push({ start, end });
    
    return ranges;
  }
}
