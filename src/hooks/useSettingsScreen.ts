import { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { resetMockAppData } from '../services/repositories/mock/resetMockAppData';
import { useMainStore } from '../stores/mainStore';
import { useSessionStore } from '../stores/sessionStore';

export type SettingsConfirmVariant = 'logout' | 'withdraw';

export function useSettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useSessionStore((state) => state.logout);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const [confirmVariant, setConfirmVariant] = useState<SettingsConfirmVariant | null>(null);

  const closeConfirm = () => setConfirmVariant(null);

  const moveToOnboarding = () => {
    queryClient.clear();
    setSelectedGroupId(null);
    router.replace('/onboarding');
  };

  const handleLogout = () => {
    logout();
    moveToOnboarding();
  };

  const handleWithdraw = () => {
    resetMockAppData();
    logout();
    moveToOnboarding();
  };

  return {
    confirmVariant,
    openLogoutConfirm: () => setConfirmVariant('logout'),
    openWithdrawConfirm: () => setConfirmVariant('withdraw'),
    closeConfirm,
    handleLogout,
    handleWithdraw,
  };
}
