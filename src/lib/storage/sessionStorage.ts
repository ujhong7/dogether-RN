// MARK: - 세션 저장소
//
// 역할: access token, refresh token, 로그인 타입 등 세션 값을 MMKV에 저장/복원합니다.

import { storage } from './storage';
import { storageKeys } from './storageKeys';
import type { AuthSession } from '../../models/auth';
import { clearLastSelectedGroupId } from './selectedGroupStorage';

export function saveSession(payload: AuthSession) {
  // MMKV는 key-value 저장소입니다. 객체를 통째로 저장하기보다 필요한 필드를 key별로 저장합니다.
  storage.set(storageKeys.accessToken, payload.accessToken);
  if (payload.refreshToken) {
    storage.set(storageKeys.refreshToken, payload.refreshToken);
  } else {
    storage.remove(storageKeys.refreshToken);
  }
  storage.set(storageKeys.userName, payload.userName);
  storage.set(storageKeys.loginType, payload.loginType);
  if (payload.appleUserIdentifier) {
    storage.set(storageKeys.appleUserIdentifier, payload.appleUserIdentifier);
  } else {
    storage.remove(storageKeys.appleUserIdentifier);
  }
  storage.set(storageKeys.hasCompletedStartFlow, payload.hasCompletedStartFlow);
}

export function clearSession() {
  // 로그인 사용자가 바뀌면 이전 사용자의 선택 그룹이 남지 않도록 관련 값까지 지웁니다.
  storage.remove(storageKeys.accessToken);
  storage.remove(storageKeys.refreshToken);
  storage.remove(storageKeys.userName);
  storage.remove(storageKeys.loginType);
  storage.remove(storageKeys.appleUserIdentifier);
  storage.remove(storageKeys.hasCompletedStartFlow);
  clearLastSelectedGroupId();
}

export function readSession() {
  // 앱 시작 시 저장소에서 값을 읽어 AuthSession 모델로 다시 조립합니다.
  const accessToken = storage.getString(storageKeys.accessToken);
  const refreshToken = storage.getString(storageKeys.refreshToken);
  const userName = storage.getString(storageKeys.userName);
  const loginType = storage.getString(storageKeys.loginType) as AuthSession['loginType'] | undefined;
  const appleUserIdentifier = storage.getString(storageKeys.appleUserIdentifier);
  const hasCompletedStartFlow = storage.getBoolean(storageKeys.hasCompletedStartFlow) ?? false;

  if (!accessToken || !userName || !loginType) {
    // 필수 값 중 하나라도 없으면 세션이 깨진 상태로 보고 비로그인 처리합니다.
    return null;
  }

  return {
    accessToken,
    refreshToken,
    userName,
    loginType,
    appleUserIdentifier,
    hasCompletedStartFlow,
  } as AuthSession;
}
