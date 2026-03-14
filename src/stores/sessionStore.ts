import { create } from 'zustand';
import { clearSession, readSession, saveSession } from '../lib/sessionStorage';
import type { AuthSession, LoginType } from '../models/auth';

type SessionState = {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userName: string | null;
  loginType: LoginType | null;
  appleUserIdentifier: string | null;
  hasCompletedStartFlow: boolean;
  hydrate: () => void;
  login: (payload: Omit<AuthSession, 'hasCompletedStartFlow'>) => void;
  completeStartFlow: () => void;
  logout: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  userName: null,
  loginType: null,
  appleUserIdentifier: null,
  hasCompletedStartFlow: false,
  hydrate: () => {
    const session = readSession();
    if (!session) {
      set({
        hydrated: true,
        accessToken: null,
        refreshToken: null,
        userName: null,
        loginType: null,
        appleUserIdentifier: null,
        hasCompletedStartFlow: false,
      });
      return;
    }

    set({
      hydrated: true,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? null,
      userName: session.userName,
      loginType: session.loginType,
      appleUserIdentifier: session.appleUserIdentifier ?? null,
      hasCompletedStartFlow: session.hasCompletedStartFlow,
    });
  },
  login: (payload) => {
    const session = { ...payload, hasCompletedStartFlow: false as const };
    saveSession(session);
    set(session);
  },
  completeStartFlow: () =>
    set((state) => {
      if (!state.accessToken || !state.userName || !state.loginType) {
        return state;
      }

      const session = {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userName: state.userName,
        loginType: state.loginType,
        appleUserIdentifier: state.appleUserIdentifier,
        hasCompletedStartFlow: true,
      };
      saveSession(session);
      return session;
    }),
  logout: () => {
    clearSession();
    set({
      accessToken: null,
      refreshToken: null,
      userName: null,
      loginType: null,
      appleUserIdentifier: null,
      hasCompletedStartFlow: false,
    });
  },
}));
