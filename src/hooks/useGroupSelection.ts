import { useMemo } from 'react';
import { createGroupRepository } from '../services/repositories';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { useMainStore } from '../stores/mainStore';

// MARK: - 그룹 선택 Hook
//
// 역할: 화면에서 그룹을 선택했을 때 Zustand 상태와 로컬 저장소를 함께 갱신합니다.
// 읽는 법: "전역 선택 상태 변경 -> 마지막 선택 그룹 저장" 순서로 보면 됩니다.

export function useGroupSelection() {
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const selectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    // 저장 실패가 화면 전환을 막을 정도의 치명 오류는 아니므로 비동기로 기록하고 로그만 남깁니다.
    void groupUseCase.saveLastSelectedGroup(groupId).catch((error: unknown) => {
      console.error('[GroupSelect] failed to save last selected group', error);
    });
  };

  return { selectGroup };
}
