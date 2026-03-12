import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';

export function UpdateScreen() {
  return (
    <Screen>
      <Text style={styles.title}>업데이트가 필요해요</Text>
      <Text style={styles.description}>최신 버전에서만 안정적으로 서비스를 이용할 수 있어요.</Text>
      <Pressable style={styles.button} onPress={() => Linking.openURL('https://apps.apple.com')}>
        <Text style={styles.buttonText}>스토어 열기</Text>
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
  description: {
    color: colors.muted,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.warning,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111827',
    fontWeight: '700',
  },
});
