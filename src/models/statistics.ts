// MARK: - Statistics Models
//
// 역할: 통계 화면의 요약/차트 데이터 타입을 정의합니다.

export type StatisticsAchievement = {
  day: number;
  createdCount: number;
  certificatedCount: number;
  certificationRate: number;
};

export type StatisticsData = {
  achievements: StatisticsAchievement[];
  totalMembers: number;
  myRank: number;
  certificatedCount: number;
  approvedCount: number;
  rejectedCount: number;
};
