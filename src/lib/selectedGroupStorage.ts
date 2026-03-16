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
