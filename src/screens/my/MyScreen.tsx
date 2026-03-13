import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useProfileQuery } from '../../queries/useProfileQuery';
import { toAppError } from '../../services/errors/appError';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

export function MyScreen() {
  const userName = useSessionStore((state) => state.userName);
  const logout = useSessionStore((state) => state.logout);
  const profileQuery = useProfileQuery();
  const displayName = profileQuery.data?.name ?? userName ?? '사용자';

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

        <Pressable style={styles.primaryButton} onPress={() => router.push('/statistics')}>
          <Text style={styles.primaryButtonText}>통계 보러가기</Text>
        </Pressable>
      </View>

      <View style={styles.menuList}>
        <Pressable style={styles.menuRow} onPress={() => router.push('/certification-list')}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>◔</Text>
            <Text style={styles.menuLabel}>인증 목록</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.menuRow} onPress={() => router.push('/group-management')}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuLabel}>그룹 관리</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.menuRow} onPress={() => router.push('/settings')}>
          <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>설정</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.hiddenLogoutButton]}
        onPress={() => {
          logout();
          router.replace('/onboarding');
        }}
      >
        <Text style={styles.hiddenLogoutText}>로그아웃</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatarOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B9DF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#78B5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 14,
    marginBottom: 18,
  },
  summaryIllustration: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  summaryBody: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5B9DF0',
  },
  summaryWingLeft: {
    position: 'absolute',
    top: 44,
    left: '34%',
    width: 20,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#4A8BE0',
  },
  summaryWingRight: {
    position: 'absolute',
    top: 44,
    right: '34%',
    width: 20,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#4A8BE0',
  },
  summaryEyeRow: {
    position: 'absolute',
    top: 44,
    flexDirection: 'row',
    gap: 12,
  },
  summaryEye: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#111318',
  },
  summaryBeak: {
    position: 'absolute',
    top: 56,
    width: 16,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#F7DF84',
  },
  summaryText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#111318',
    fontSize: 18,
    fontWeight: '800',
  },
  menuList: {
    gap: 4,
  },
  menuRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 22,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  menuChevron: {
    color: '#AAB1C4',
    fontSize: 26,
    fontWeight: '700',
  },
  hiddenLogoutButton: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    paddingVertical: 6,
  },
  hiddenLogoutText: {
    color: '#6B7280',
    fontSize: 12,
  },
});
