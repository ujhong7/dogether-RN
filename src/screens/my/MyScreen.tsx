import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useMyScreen } from '../../hooks/useMyScreen';
import { toAppError } from '../../services/errors/appError';
import { styles } from './styles';

export function MyScreen() {
  const {
    displayName,
    logout,
    profileQuery,
    moveToCertificationList,
    moveToGroupManagement,
    moveToSettings,
    moveToStatistics,
    handleLogout,
  } = useMyScreen();

  if (profileQuery.isError) {
    const appError = toAppError(profileQuery.error);

    if (appError.variant === 'alert') {
      return (
        <Screen>
          <AppAlertModal
            visible
            error={appError}
            onClose={() => {
              logout();
              router.replace('/onboarding');
            }}
          />
        </Screen>
      );
    }

    return (
      <Screen>
        <FullScreenErrorState
          title={appError.title}
          message={appError.message}
          actionLabel={appError.actionLabel}
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </Screen>
    );
  }

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
