import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGroupsQuery } from '../queries/useGroupsQuery';
import { createGroupRepository } from '../services/repositories';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { useMainStore } from '../stores/mainStore';

export function useGroupManagementScreen() {
  const groupsQuery = useGroupsQuery();
  const queryClient = useQueryClient();
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
  const [pendingLeaveGroupId, setPendingLeaveGroupId] = useState<number | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const groups = groupsQuery.data ?? [];
  const pendingLeaveGroup = groups.find((group) => group.id === pendingLeaveGroupId) ?? null;

  const closeLeaveConfirm = () => setPendingLeaveGroupId(null);
  const openLeaveConfirm = (groupId: number) => setPendingLeaveGroupId(groupId);

  const handleConfirmLeave = async () => {
    if (!pendingLeaveGroupId || isLeaving) {
      return;
    }

    setIsLeaving(true);

    try {
      const remainingGroups = await groupUseCase.leaveGroup(pendingLeaveGroupId);
      // 그룹 정보가 바뀌는 화면들이 많아서 관련 query를 함께 무효화한다.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groups'] }),
        queryClient.invalidateQueries({ queryKey: ['certification-list'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
      ]);

      if (remainingGroups.length === 0) {
        setSelectedGroupId(null);
        setPendingLeaveGroupId(null);
        router.replace('/start');
        return;
      }

      // 현재 보고 있던 그룹을 탈퇴한 경우에는 남아 있는 첫 그룹으로 선택 상태를 옮긴다.
      if (selectedGroupId === pendingLeaveGroupId) {
        setSelectedGroupId(remainingGroups[0].id);
      }

      setPendingLeaveGroupId(null);
    } finally {
      setIsLeaving(false);
    }
  };

  return {
    groupsQuery,
    groups,
    pendingLeaveGroup,
    isLeaving,
    openLeaveConfirm,
    closeLeaveConfirm,
    handleConfirmLeave,
  };
}
