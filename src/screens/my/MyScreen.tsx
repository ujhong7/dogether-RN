import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useProfileQuery } from '../../queries/useProfileQuery';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

export function MyScreen() {
  const userName = useSessionStore((state) => state.userName);
  const profileQuery = useProfileQuery();

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
