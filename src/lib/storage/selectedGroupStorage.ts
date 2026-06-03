// MARK: - 마지막 선택 그룹 저장소
//
// 역할: 사용자가 마지막으로 선택한 그룹 id를 MMKV에 저장/복원합니다.

import { storage } from './storage';
import { storageKeys } from './storageKeys';

export function readLastSelectedGroupId() {
  return storage.getNumber(storageKeys.lastSelectedGroupId) ?? null;
}

export function saveLastSelectedGroupId(groupId: number | null) {
  if (groupId === null) {
    storage.remove(storageKeys.lastSelectedGroupId);
    return;
  }

  storage.set(storageKeys.lastSelectedGroupId, groupId);
}

export function clearLastSelectedGroupId() {
  storage.remove(storageKeys.lastSelectedGroupId);
}
