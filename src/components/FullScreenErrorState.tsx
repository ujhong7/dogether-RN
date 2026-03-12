import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry: () => void;
};

export function FullScreenErrorState({
  title = '서비스 이용이 원활하지 않아요',
  message = '잠시 후 다시 접속해주세요.',
  actionLabel = '다시 시도',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🧊</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  button: {
    minWidth: 160,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#111318',
    fontSize: 15,
    fontWeight: '800',
  },
});
