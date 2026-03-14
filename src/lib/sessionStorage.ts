import { storage } from './storage';
import { storageKeys } from './storageKeys';
import type { AuthSession } from '../models/auth';

export function saveSession(payload: AuthSession) {
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
  storage.remove(storageKeys.accessToken);
  storage.remove(storageKeys.refreshToken);
  storage.remove(storageKeys.userName);
  storage.remove(storageKeys.loginType);
  storage.remove(storageKeys.appleUserIdentifier);
  storage.remove(storageKeys.hasCompletedStartFlow);
}

export function readSession() {
  const accessToken = storage.getString(storageKeys.accessToken);
  const refreshToken = storage.getString(storageKeys.refreshToken);
  const userName = storage.getString(storageKeys.userName);
  const loginType = storage.getString(storageKeys.loginType) as AuthSession['loginType'] | undefined;
  const appleUserIdentifier = storage.getString(storageKeys.appleUserIdentifier);
  const hasCompletedStartFlow = storage.getBoolean(storageKeys.hasCompletedStartFlow) ?? false;

  if (!accessToken || !userName || !loginType) {
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
