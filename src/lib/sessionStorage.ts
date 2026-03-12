import { storage } from './storage';
import { storageKeys } from './storageKeys';

export type SessionPayload = {
  accessToken: string;
  userName: string;
  loginType: 'apple' | 'demo';
  hasCompletedStartFlow: boolean;
};

export function saveSession(payload: SessionPayload) {
  storage.set(storageKeys.accessToken, payload.accessToken);
  storage.set(storageKeys.userName, payload.userName);
  storage.set(storageKeys.loginType, payload.loginType);
  storage.set(storageKeys.hasCompletedStartFlow, payload.hasCompletedStartFlow);
}

export function clearSession() {
  storage.remove(storageKeys.accessToken);
  storage.remove(storageKeys.userName);
  storage.remove(storageKeys.loginType);
  storage.remove(storageKeys.hasCompletedStartFlow);
}

export function readSession() {
  const accessToken = storage.getString(storageKeys.accessToken);
  const userName = storage.getString(storageKeys.userName);
  const loginType = storage.getString(storageKeys.loginType) as 'apple' | 'demo' | undefined;
  const hasCompletedStartFlow = storage.getBoolean(storageKeys.hasCompletedStartFlow) ?? false;

  if (!accessToken || !userName || !loginType) {
    return null;
  }

  return { accessToken, userName, loginType, hasCompletedStartFlow } as SessionPayload;
}
