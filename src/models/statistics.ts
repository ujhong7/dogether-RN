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
