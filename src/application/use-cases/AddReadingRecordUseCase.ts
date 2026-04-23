import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";
import type { CreateReadingRecordDto, ReadingRecordDto } from "../dto/ReadingRecordDto";
import { getBibleBook } from "@/lib/constants/bible-books";

export class AddReadingRecordUseCase {
  constructor(private repo: IReadingRecordRepository) {}

  async execute(dto: CreateReadingRecordDto): Promise<ReadingRecordDto> {
    const book = getBibleBook(dto.bookId);

    // 유효성 검증
    if (dto.startChapter < 1 || dto.endChapter > book.chapters) {
      throw new Error(`${book.name}은(는) 1~${book.chapters}장까지 있습니다.`);
    }
    if (dto.startChapter > dto.endChapter) {
      throw new Error("시작 장이 종료 장보다 클 수 없습니다.");
    }

    const record = await this.repo.save({
      userId: dto.userId,
      bookId: dto.bookId,
      startChapter: dto.startChapter,
      endChapter: dto.endChapter,
      memo: dto.memo ?? null,
      readAt: dto.readAt,
    });

    return {
      id: record.id,
      bookId: record.bookId,
      bookName: book.name,
      startChapter: record.startChapter,
      endChapter: record.endChapter,
      chapterCount: record.chapterCount,
      memo: record.memo,
      readAt: record.readAt.toISOString().split("T")[0],
    };
  }
}
