import { Pressable, StyleSheet, Text } from 'react-native';
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
      <Text style={styles.title}>My</Text>
      <Text style={styles.text}>세션 사용자: {userName ?? '-'}</Text>
      <Text style={styles.text}>프로필 이름: {profileQuery.data?.name ?? '-'}</Text>

      <Pressable style={styles.button} onPress={() => router.push('/settings')}>
        <Text style={styles.buttonText}>설정</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>뒤로</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  text: {
    color: colors.text,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
