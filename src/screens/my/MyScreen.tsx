// MARK: - 마이페이지 Screen
//
// 역할: 내 프로필, 통계/인증 목록/그룹 관리/설정 이동 메뉴, 로그아웃 진입점을 보여줍니다.
// 읽는 법: "hook state -> profile error -> profile card -> menu list -> logout" 순서로 보면 됩니다.

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QueryErrorState } from '../../components/QueryErrorState';
import { Screen } from '../../components/Screen';
import { useMyScreen } from '../../hooks/useMyScreen';
import { styles } from './styles';

export function MyScreen() {
  // MARK: - Hook state
  //
  // 화면 이동과 로그아웃 처리는 useMyScreen hook에 모아두었습니다.
  const {
    displayName,
    profileQuery,
    moveToCertificationList,
    moveToGroupManagement,
    moveToSettings,
    moveToStatistics,
    handleLogout,
  } = useMyScreen();

  // MARK: - Error state

  if (profileQuery.isError) {
    return (
      <QueryErrorState
        error={profileQuery.error}
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  // MARK: - Render

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>마이페이지</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarEmoji}>🐦</Text>
          </View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIllustration}>
          <View style={styles.summaryBody} />
          <View style={styles.summaryWingLeft} />
          <View style={styles.summaryWingRight} />
          <View style={styles.summaryEyeRow}>
            <View style={styles.summaryEye} />
            <View style={styles.summaryEye} />
          </View>
          <View style={styles.summaryBeak} />
        </View>

        <Text style={styles.summaryText}>그룹별 진행 상황을 모아봤어요!</Text>

        <Pressable style={styles.primaryButton} onPress={moveToStatistics}>
          <Text style={styles.primaryButtonText}>통계 보러가기</Text>
        </Pressable>
      </View>

      <View style={styles.menuList}>
        <Pressable style={styles.menuRow} onPress={moveToCertificationList}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>◔</Text>
            <Text style={styles.menuLabel}>인증 목록</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.menuRow} onPress={moveToGroupManagement}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuLabel}>그룹 관리</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.menuRow} onPress={moveToSettings}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>설정</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.hiddenLogoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.hiddenLogoutText}>로그아웃</Text>
      </Pressable>
    </Screen>
  );
}
