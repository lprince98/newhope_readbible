import type { SupabaseClient } from "@supabase/supabase-js";
import type { IReadingRecordRepository, NewReadingRecord } from "@/src/domain/repositories/IReadingRecordRepository";
import { ReadingRecord } from "@/src/domain/entities/ReadingRecord";
import type { BibleBookId } from "@/lib/constants/bible-books";


function toKstDateString(date: Date): string {
  const kstParts = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).formatToParts(date);
  
  const y = kstParts.find(p => p.type === "year")?.value;
  const m = kstParts.find(p => p.type === "month")?.value;
  const d = kstParts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}


/** reading_records 테이블 행 */
interface ReadingRecordRow {
  id: string;
  user_id: string;
  book_id: BibleBookId;
  start_chapter: number;
  end_chapter: number;
  memo: string | null;
  read_at: string;
  created_at: string | null;
}

/** get_team_chapter_counts RPC 결과 행 */
interface TeamChapterCountRow {
  team_id: string;
  team_name: string;
  total_chapters: number | string;
}

/** get_individual_ranking / get_member_chapter_counts RPC 결과 행 (bigint는 문자열로 올 수 있음) */
interface MemberChapterCountRow {
  user_id: string;
  user_name: string;
  team_name?: string | null;
  total_chapters: number | string;
  full_read_count: number | null;
  current_chapters: number | null;
}

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
    const kstDateStr = toKstDateString(record.readAt);
    const { data, error } = await this.client
      .from("reading_records")
      .insert({
        user_id: record.userId,
        book_id: record.bookId,
        start_chapter: record.startChapter,
        end_chapter: record.endChapter,
        memo: record.memo,
        read_at: kstDateStr,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(data);
  }

  /**
   * 특정 사용자의 모든 읽기 기록을 조회합니다.
   * @param since "YYYY-MM-DD" 형식의 시즌 시작일. 지정하면 그 날짜 이후 기록만 조회합니다.
   */
  async findByUserId(userId: string, since?: string | null): Promise<ReadingRecord[]> {
    let query = this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId);
    if (since) query = query.gte("read_at", since);

    const { data, error } = await query.order("read_at", { ascending: false });

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
    const kstDateStr = toKstDateString(date);

    const { data, error } = await this.client
      .from("reading_records")
      .select("*")
      .eq("user_id", userId)
      .eq("read_at", kstDateStr);

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
  async getTeamChapterCounts(since?: string | null): Promise<{ teamId: string; teamName: string; totalChapters: number }[]> {
    const { data, error } = await this.callRpc("get_team_chapter_counts", {}, since);

    if (error) {
      console.error(">>> [REPO ERROR] getTeamChapterCounts:", error);
      return [];
    }

    return ((data ?? []) as TeamChapterCountRow[]).map((d) => ({
      teamId: d.team_id,
      teamName: d.team_name,
      totalChapters: Number(d.total_chapters),
    }));
  }

  /**
   * [신규] 모든 유저의 개인별 통독 합계를 조회합니다. (Top 10 랭킹용)
   */
  async getIndividualRanking(since?: string | null): Promise<{ userId: string; userName: string; teamName: string | null; totalChapters: number; fullReadCount: number; currentChapters: number }[]> {
    const { data, error } = await this.callRpc("get_individual_ranking", {}, since);

    if (error) {
      console.error(">>> [REPO ERROR] getIndividualRanking:", error);
      return [];
    }

    return ((data ?? []) as MemberChapterCountRow[]).map((d) => ({
      userId: d.user_id,
      userName: d.user_name,
      teamName: d.team_name ?? null,
      totalChapters: Number(d.total_chapters),
      fullReadCount: Number(d.full_read_count || 0),
      currentChapters: Number(d.current_chapters || 0),
    }));
  }

  /**
   * [신규] 특정 팀 내 개별 팀원들의 통독 진행 현황을 조회합니다.
   * 데이터베이스에 설치된 'get_member_chapter_counts' RPC 함수를 호출합니다.
   */
  async getMemberChapterCounts(teamId: string, since?: string | null): Promise<
    {
      userId: string;
      userName: string;
      totalChapters: number;
      fullReadCount: number;
      currentChapters: number;
    }[]
  > {
    const { data, error } = await this.callRpc(
      "get_member_chapter_counts",
      { target_team_id: teamId },
      since,
    );

    if (error) {
      console.error(">>> [REPO ERROR] getMemberChapterCounts:", error);
      // RPC 함수가 없거나 오류가 난 경우 빈 배열을 반환하여 페이지 오류 방지
      return [];
    }

    return ((data ?? []) as MemberChapterCountRow[]).map((d) => ({
      userId: d.user_id,
      userName: d.user_name,
      totalChapters: Number(d.total_chapters),
      fullReadCount: Number(d.full_read_count || 0),
      currentChapters: Number(d.current_chapters || 0),
    }));
  }

  /**
   * 집계 RPC를 시즌 시작일(since_date)과 함께 호출합니다.
   * 시즌 마이그레이션(20261024000000)이 아직 DB에 적용되지 않아 함수 시그니처를 찾지 못하면
   * since_date 없이 다시 호출하여 페이지가 비지 않도록 합니다.
   */
  private async callRpc(fn: string, args: Record<string, unknown>, since?: string | null) {
    if (!since) return this.client.rpc(fn, args);

    const result = await this.client.rpc(fn, { ...args, since_date: since });
    if (result.error?.code === "PGRST202") {
      console.error(`>>> [REPO WARN] ${fn}(since_date) 미설치 — 시즌 마이그레이션을 적용하세요. 전체 기간으로 대체합니다.`);
      return this.client.rpc(fn, args);
    }
    return result;
  }

  /**
   * 데이터베이스 결과 객체를 도메인 엔티티(ReadingRecord)로 변환합니다.
   */
  private mapToEntity(data: ReadingRecordRow): ReadingRecord {
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

