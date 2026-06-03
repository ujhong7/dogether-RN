import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../config/env';
import type { AppError } from '../models/error';
import { toAppError } from '../services/errors/appError';
import { createAuthRepository } from '../services/repositories';
import { resetMockAppData } from '../services/repositories/mock/resetMockAppData';
import { AuthUseCase } from '../services/usecases/authUseCase';
import { useMainStore } from '../stores/mainStore';
import { useSessionStore } from '../stores/sessionStore';

export type SettingsConfirmVariant = 'logout' | 'withdraw';

// MARK: - 설정 화면 Hook
//
// 역할: 로그아웃/회원탈퇴 확인 모달 상태와 세션 초기화 플로우를 관리합니다.
// 읽는 법: "confirm state -> 공통 이동 처리 -> logout/withdraw action -> output" 순서로 보면 됩니다.

export function useSettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useSessionStore((state) => state.logout);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
  const [confirmVariant, setConfirmVariant] = useState<SettingsConfirmVariant | null>(null);
  const [settingsError, setSettingsError] = useState<AppError | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const closeConfirm = () => setConfirmVariant(null);

  // 세션이 사라지면 서버 상태 캐시와 선택 그룹도 함께 비워 다음 사용자의 데이터가 섞이지 않게 합니다.
  const moveToOnboarding = () => {
    queryClient.clear();
    setSelectedGroupId(null);
    router.replace('/onboarding');
  };

  const handleLogout = () => {
    logout();
    moveToOnboarding();
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await authUseCase.withdraw();
      // mock 모드에서는 실제 서버 탈퇴 대신 로컬 mock 데이터를 초기화해 탈퇴처럼 보이게 합니다.
      if (env.useMockAuth) {
        resetMockAppData();
      }
      logout();
      moveToOnboarding();
    } catch (error) {
      setConfirmVariant(null);
      setSettingsError(toAppError(error));
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    confirmVariant,
    settingsError,
    isWithdrawing,
    openLogoutConfirm: () => setConfirmVariant('logout'),
    openWithdrawConfirm: () => setConfirmVariant('withdraw'),
    closeConfirm,
    clearSettingsError: () => setSettingsError(null),
    handleLogout,
    handleWithdraw,
  };
}
