import type { SupabaseClient } from "@supabase/supabase-js";
import type { IReadingRecordRepository, NewReadingRecord } from "@/src/domain/repositories/IReadingRecordRepository";
import { ReadingRecord } from "@/src/domain/entities/ReadingRecord";
import type { BibleBookId } from "@/lib/constants/bible-books";


/**
 * Supabase를 사용하여 성경 읽기 기록을 관리하는 저장소 구현체
 */
export class SupabaseReadingRecordRepository implements IReadingRecordRepository {
  constructor(private client: SupabaseClient) {}

  /**
   * 새로운 읽기 기록을 데이터베이스에 저장합니다.
   * @param record 저장할 새로운 기록 정보 (ID 미포함)
   */
  async save(record: NewReadingRecord): Promise<ReadingRecord> {
    const { data, error } = await this.client
      .from("reading_records")
      .insert({
        user_id: record.userId,
        book_id: record.bookId,
        start_chapter: record.startChapter,
        end_chapter: record.endChapter,
        // (종료 - 시작 + 1)로 장 수 계산
        chapter_count: record.endChapter - record.startChapter + 1,
        memo: record.memo,
        read_at: record.readAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  /**
   * 특정 사용자의 모든 읽기 기록을 조회합니다.
   */
  async findByUserId(userId: string): Promise<ReadingRecord[]> {
    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .order("read_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapToEntity);
  }

  /**
   * [신규] 특정 사용자가 특정 성경 권을 읽은 기록을 조회합니다.
   */
  async findByUserIdAndBook(userId: string, bookId: BibleBookId): Promise<ReadingRecord[]> {
    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("read_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapToEntity);
  }

  /**
   * 특정 날짜에 기록된 사용자의 읽기 데이터를 조회합니다.
   */
  async findByUserIdAndDate(userId: string, date: Date): Promise<ReadingRecord[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .gte("read_at", start.toISOString())
      .lte("read_at", end.toISOString());

    if (error) throw new Error(error.message);
    return data.map(this.mapToEntity);
  }

  /**
   * 기록의 고유 ID로 데이터를 삭제합니다. (보안을 위해 본인 확인 포함)
   */
  async deleteById(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("reading_records")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  /**
   * 모든 팀별 통독 합계를 조회합니다. (랭킹용)
   */
  async getTeamChapterCounts(): Promise<{ teamId: string; teamName: string; totalChapters: number }[]> {
    const { data, error } = await this.client
      .from("team_reading_summary")
      .select("*")
      .order("total_chapters", { ascending: false });

    if (error) {
      console.error(">>> [REPO ERROR] getTeamChapterCounts:", error);
      return [];
    }

    return data.map((d) => ({
      teamId: d.team_id,
      teamName: d.team_name,
      totalChapters: d.total_chapters,
    }));
  }

  /**
   * [신규] 특정 팀 내 개별 팀원들의 통독 진행 현황을 조회합니다.
   * 데이터베이스에 설치된 'get_member_chapter_counts' RPC 함수를 호출합니다.
   */
  async getMemberChapterCounts(teamId: string): Promise<{ userId: string; userName: string; totalChapters: number }[]> {
    const { data, error } = await this.client.rpc("get_member_chapter_counts", {
      target_team_id: teamId,
    });

    if (error) {
      console.error(">>> [REPO ERROR] getMemberChapterCounts:", error);
      // RPC 함수가 없거나 오류가 난 경우 빈 배열을 반환하여 페이지 오류 방지
      return [];
    }

    return (data ?? []).map((d: any) => ({
      userId: d.user_id,
      userName: d.user_name,
      totalChapters: Number(d.total_chapters),
    }));
  }

  /**
   * 데이터베이스 결과 객체를 도메인 엔티티(ReadingRecord)로 변환합니다.
   */
  private mapToEntity(data: any): ReadingRecord {
    return new ReadingRecord(
      data.id,
      data.user_id,
      data.book_id,
      data.start_chapter,
      data.end_chapter,
      data.memo,
      new Date(data.read_at),
      new Date(data.created_at || new Date())
    );
  }
}

