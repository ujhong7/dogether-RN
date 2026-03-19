import { useMemo, useState } from 'react';
import { createGroupRepository } from '../services/repositories';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { useGroupsQuery } from '../queries/useGroupsQuery';
import { useStatisticsQuery } from '../queries/useStatisticsQuery';
import { useMainStore } from '../stores/mainStore';
import { getCurrentGroupDay, MAX_TODOS_PER_DAY } from '../screens/statistics/utils';

export function useStatisticsScreen() {
  const groupsQuery = useGroupsQuery();
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const groups = groupsQuery.data ?? [];
  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const statisticsQuery = useStatisticsQuery(currentGroup?.id);

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    // 메인 화면과 동일하게 마지막 선택 그룹을 저장해 다음 진입 시 복원한다.
    void groupUseCase.saveLastSelectedGroup(groupId).catch((error: unknown) => {
      console.error('[Statistics] failed to save last selected group', error);
    });
  };

  const summary = useMemo(() => {
    if (!currentGroup || !statisticsQuery.data) {
      return null;
    }

    // 통계 차트는 항상 최대 4칸만 노출하고, 현재 일차가 마지막 칸에 오도록 계산한다.
    const currentDay = getCurrentGroupDay(currentGroup.startDate, Math.max(currentGroup.duration, 1));
    const firstVisibleDay = currentDay <= 4 ? 1 : currentDay - 3;
    const visibleDays = Array.from({ length: 4 }, (_, index) => firstVisibleDay + index);
    const achievementMap = new Map(statisticsQuery.data.achievements.map((item) => [item.day, item]));
    const chartValues = visibleDays.map((day) => {
      const achievement = achievementMap.get(day);
      const createdCount = Math.min(achievement?.createdCount ?? 0, MAX_TODOS_PER_DAY);
      const certificatedCount = Math.min(achievement?.certificatedCount ?? 0, createdCount);

      return {
        day,
        label: `${day}일차`,
        total: MAX_TODOS_PER_DAY,
        createdCount,
        certificatedCount,
        certificationRate: achievement?.certificationRate ?? 0,
        isCurrent: day === currentDay,
        isFuture: day > currentDay,
      };
    });

    const achievementPercent = chartValues.find((item) => item.isCurrent)?.certificationRate ?? 0;

    return {
      achievementPercent,
      currentDay,
      chartValues,
      rank: statisticsQuery.data.myRank,
      totalMembers: statisticsQuery.data.totalMembers,
      certificatedCount: statisticsQuery.data.certificatedCount,
      approvedCount: statisticsQuery.data.approvedCount,
      rejectedCount: statisticsQuery.data.rejectedCount,
    };
  }, [currentGroup, statisticsQuery.data]);

  return {
    groupsQuery,
    groups,
    currentGroup,
    statisticsQuery,
    summary,
    sheetVisible,
    openSheet: () => setSheetVisible(true),
    closeSheet: () => setSheetVisible(false),
    handleSelectGroup,
  };
}
