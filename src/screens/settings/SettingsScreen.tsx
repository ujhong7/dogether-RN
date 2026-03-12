import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

export function SettingsScreen() {
  const logout = useSessionStore((state) => state.logout);

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Pressable
        style={[styles.button, styles.danger]}
        onPress={() => {
          logout();
          router.replace('/onboarding');
        }}
      >
        <Text style={styles.buttonText}>로그아웃</Text>
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
  button: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
