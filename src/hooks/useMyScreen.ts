import { router } from 'expo-router';
import { useProfileQuery } from '../queries/useProfileQuery';
import { useSessionStore } from '../stores/sessionStore';

// MARK: - 마이페이지 Hook
//
// 역할: 프로필 query, 세션 fallback 이름, 마이페이지 내 이동 action을 한곳에 모읍니다.
// 읽는 법: "session/profile data -> displayName 계산 -> navigation action -> output" 순서로 보면 됩니다.

export function useMyScreen() {
  const userName = useSessionStore((state) => state.userName);
  const logout = useSessionStore((state) => state.logout);
  const profileQuery = useProfileQuery();
  // 서버 프로필이 아직 도착하지 않았을 때는 세션에 저장된 이름을 먼저 보여줍니다.
  const displayName = profileQuery.data?.name ?? userName ?? '사용자';

  // MARK: - Navigation actions

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
