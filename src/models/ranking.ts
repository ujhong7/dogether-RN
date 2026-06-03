// MARK: - Ranking Models
//
// 역할: 랭킹 화면에서 사용하는 사용자 순위 데이터 타입을 정의합니다.

export type RankingHistoryReadStatus = 'READ_YET' | 'READ_ALL' | null;

export type Ranking = {
  memberId: number;
  rank: number;
  name: string;
  achievementRate: number;
  profileImageUrl?: string;
  historyReadStatus: RankingHistoryReadStatus;
};
