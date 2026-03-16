export type RankingHistoryReadStatus = 'READ_YET' | 'READ_ALL' | null;

export type Ranking = {
  memberId: number;
  rank: number;
  name: string;
  achievementRate: number;
  profileImageUrl?: string;
  historyReadStatus: RankingHistoryReadStatus;
};
