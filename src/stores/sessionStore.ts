// MARK: - 세션 Zustand Store
//
// 역할: 로그인 세션을 메모리 상태로 들고, MMKV 저장소와 동기화합니다.
// 읽는 법: "state type -> create 초기값 -> hydrate/login/complete/logout action" 순서로 보면 됩니다.

import { create } from 'zustand';
import { clearSession, readSession, saveSession } from '../lib/storage';
import type { AuthSession, LoginType } from '../models/auth';

// Zustand store는 화면 밖에 존재하는 전역 상태 저장소입니다.
// React의 useState와 비슷하지만 여러 화면에서 같은 상태를 쉽게 공유할 수 있습니다.
// MARK: - State shape

type SessionState = {
  // hydrated는 앱 시작 시 네이티브 저장소에서 세션을 다 읽었는지 나타냅니다.
  // false인 동안에는 "로그아웃"이라고 단정하면 안 됩니다.
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userName: string | null;
  loginType: LoginType | null;
  appleUserIdentifier: string | null;
  hasCompletedStartFlow: boolean;
  // () => void는 "매개변수 없이 실행되고, 반환값은 없는 함수"라는 타입입니다.
  // Swift로 치면 () -> Void와 비슷합니다.
  hydrate: () => void;
  // payload: ... 는 함수가 받을 인자의 이름과 타입입니다.
  login: (payload: Omit<AuthSession, 'hasCompletedStartFlow'>) => void;
  completeStartFlow: () => void;
  logout: () => void;
};

// MARK: - Store implementation
//
// create<SessionState>((set) => ({ ... }))는 Zustand store를 만드는 코드입니다.
// 바깥 create<SessionState>는 "이 store의 모양은 SessionState 타입을 따른다"는 뜻입니다.
// 안쪽 (set) => ({ ... })는 초기 상태 객체를 반환하는 함수입니다.
// set은 Zustand가 넘겨주는 함수이고, set({ ... })을 호출하면 전역 상태가 바뀝니다.
export const useSessionStore = create<SessionState>((set) => ({
  // MARK: Initial state

  hydrated: false,
  accessToken: null,
  refreshToken: null,
  userName: null,
  loginType: null,
  appleUserIdentifier: null,
  hasCompletedStartFlow: false,

  // MARK: Hydrate
  //
  // hydrate: () => { ... } 는 객체 안에 hydrate라는 함수를 저장한다는 뜻입니다.
  // 나중에 useSessionStore((state) => state.hydrate)로 이 함수를 꺼내 호출할 수 있습니다.
  hydrate: () => {
    // 앱이 켜질 때 MMKV에 저장된 로그인 정보를 Zustand 상태로 옮깁니다.
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

  // MARK: Login

  login: (payload) => {
    // 로그인 성공 시 메모리 상태와 영구 저장소를 함께 갱신합니다.
    const session = { ...payload, hasCompletedStartFlow: false as const };
    saveSession(session);
    set(session);
  },

  // MARK: Complete start flow

  completeStartFlow: () =>
    // set에는 객체를 바로 넘길 수도 있고, 아래처럼 현재 state를 받아 새 state를 반환하는 함수를 넘길 수도 있습니다.
    // 기존 상태를 참고해서 다음 상태를 만들 때는 (state) => { ... } 형태를 씁니다.
    set((state) => {
      // 그룹 생성/참여 플로우가 끝났다는 사실도 세션에 같이 보관합니다.
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

  // MARK: Logout

  logout: () => {
    // 로그아웃은 토큰뿐 아니라 마지막 선택 그룹 같은 세션성 데이터도 함께 정리합니다.
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
