import { create } from 'zustand';
import { clearSession, readSession, saveSession } from '../lib/sessionStorage';

type SessionState = {
  hydrated: boolean;
  accessToken: string | null;
  userName: string | null;
  loginType: 'apple' | 'demo' | null;
  hasCompletedStartFlow: boolean;
  hydrate: () => void;
  login: (payload: { accessToken: string; userName: string; loginType: 'apple' | 'demo' }) => void;
  completeStartFlow: () => void;
  logout: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  hydrated: false,
  accessToken: null,
  userName: null,
  loginType: null,
  hasCompletedStartFlow: false,
  hydrate: () => {
    const session = readSession();
    if (!session) {
      set({ hydrated: true, accessToken: null, userName: null, loginType: null, hasCompletedStartFlow: false });
      return;
    }

    set({
      hydrated: true,
      accessToken: session.accessToken,
      userName: session.userName,
      loginType: session.loginType,
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
        userName: state.userName,
        loginType: state.loginType,
        hasCompletedStartFlow: true,
      };
      saveSession(session);
      return session;
    }),
  logout: () => {
    clearSession();
    set({ accessToken: null, userName: null, loginType: null, hasCompletedStartFlow: false });
  },
}));
