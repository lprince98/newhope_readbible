import type { SupabaseClient } from "@supabase/supabase-js";
import type { IReadingRecordRepository, NewReadingRecord } from "@/src/domain/repositories/IReadingRecordRepository";
import { ReadingRecord } from "@/src/domain/entities/ReadingRecord";
import type { BibleBookId } from "@/lib/constants/bible-books";

/** 로컬 날짜를 YYYY-MM-DD 문자열로 변환 (UTC 편차 방지) */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class SupabaseReadingRecordRepository
  implements IReadingRecordRepository
{
  constructor(private client: SupabaseClient) {}

  private mapRow(row: Record<string, unknown>): ReadingRecord {
    return new ReadingRecord(
      row.id as string,
      row.user_id as string,
      row.book_id as BibleBookId,
      row.start_chapter as number,
      row.end_chapter as number,
      (row.memo as string) ?? null,
      new Date(row.read_at as string),
      new Date(row.created_at as string),
    );
  }

  async findByUserId(userId: string): Promise<ReadingRecord[]> {
    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .order("read_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => this.mapRow(r));
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<ReadingRecord[]> {
    const dateStr = toLocalDateStr(date);
    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .eq("read_at", dateStr);

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => this.mapRow(r));
  }

  async findByUserIdAndBook(
    userId: string,
    bookId: BibleBookId,
  ): Promise<ReadingRecord[]> {
    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => this.mapRow(r));
  }

  async save(record: NewReadingRecord): Promise<ReadingRecord> {
    const { data, error } = await this.client
      .from("reading_records")
      .insert({
        user_id: record.userId,
        book_id: record.bookId,
        start_chapter: record.startChapter,
        end_chapter: record.endChapter,
        memo: record.memo,
        read_at: toLocalDateStr(record.readAt),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(data);
  }

  async deleteById(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("reading_records")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  async getTeamChapterCounts(): Promise<
    { teamId: string; teamName: string; totalChapters: number }[]
  > {
    const { data, error } = await this.client.rpc("get_team_chapter_counts");
    if (error) {
      // RPC가 없을 경우 빈 배열 반환
      return [];
    }
    return (data ?? []).map(
      (r: { team_id: string; team_name: string; total_chapters: number }) => ({
        teamId: r.team_id,
        teamName: r.team_name,
        totalChapters: r.total_chapters,
      }),
    );
  }
}
