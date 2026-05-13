import type { IReadingRecordRepository } from "@/src/domain/repositories/IReadingRecordRepository";

export interface IndividualRankingItem {
  userId: string;
  userName: string;
  teamName: string | null;
  totalChapters: number;
  fullReadCount: number;
  rank: number;
  isMe: boolean;
}

export class GetIndividualRankingUseCase {
  constructor(private readingRecordRepository: IReadingRecordRepository) {}

  /**
   * 개인별 랭킹 Top 10을 가져오고, 현재 유저(나)를 표시합니다.
   * @param currentUserId 현재 로그인한 사용자의 ID
   */
  async execute(currentUserId: string | null): Promise<IndividualRankingItem[]> {
    const rawData = await this.readingRecordRepository.getIndividualRanking();

    let currentRank = 1;
    let previousChapters = -1;
    let sameRankCount = 0;

    return rawData.map((data, index) => {
      if (previousChapters === data.totalChapters) {
        sameRankCount++;
      } else {
        currentRank = index + 1;
        sameRankCount = 0;
      }
      previousChapters = data.totalChapters;

      return {
        userId: data.userId,
        userName: data.userName,
        teamName: data.teamName,
        totalChapters: data.totalChapters,
        fullReadCount: data.fullReadCount,
        rank: currentRank,
        isMe: currentUserId !== null && data.userId === currentUserId,
      };
    });
  }
}
