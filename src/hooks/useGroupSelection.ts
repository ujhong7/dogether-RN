import { useMemo } from 'react';
import { createGroupRepository } from '../services/repositories';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { useMainStore } from '../stores/mainStore';

/** 그룹 선택 및 마지막 선택 그룹 저장 로직을 담당하는 훅 */
export function useGroupSelection() {
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const selectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    void groupUseCase.saveLastSelectedGroup(groupId).catch((error: unknown) => {
      console.error('[GroupSelect] failed to save last selected group', error);
    });
  };

  return { selectGroup };
}
