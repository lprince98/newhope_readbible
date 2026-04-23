import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";

export interface RankingItem {
  rank: number;
  teamId: string;
  teamName: string;
  totalChapters: number;
  isMyTeam: boolean;
}

export class GetRankingUseCase {
  constructor(private repo: IReadingRecordRepository) {}

  async execute(myTeamName: string | null): Promise<RankingItem[]> {
    const counts = await this.repo.getTeamChapterCounts();
    const max = counts[0]?.totalChapters ?? 1;

    return counts.map((item, idx) => ({
      rank: idx + 1,
      teamId: item.teamId,
      teamName: item.teamName,
      totalChapters: item.totalChapters,
      isMyTeam: item.teamName === myTeamName,
      percent: Math.round((item.totalChapters / max) * 100),
    })) as RankingItem[];
  }
}
