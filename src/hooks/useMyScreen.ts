import { router } from 'expo-router';
import { useProfileQuery } from '../queries/useProfileQuery';
import { useSessionStore } from '../stores/sessionStore';

export function useMyScreen() {
  const userName = useSessionStore((state) => state.userName);
  const logout = useSessionStore((state) => state.logout);
  const profileQuery = useProfileQuery();
  const displayName = profileQuery.data?.name ?? userName ?? '사용자';

  const moveToCertificationList = () => router.push('/certification-list');
  const moveToGroupManagement = () => router.push('/group-management');
  const moveToSettings = () => router.push('/settings');
  const moveToStatistics = () => router.push('/statistics');
  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  return {
    displayName,
    logout,
    profileQuery,
    moveToCertificationList,
    moveToGroupManagement,
    moveToSettings,
    moveToStatistics,
    handleLogout,
  };
}
