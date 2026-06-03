// MARK: - 준비 중 Screen
//
// 역할: 아직 구현되지 않은 route를 공통 안내 화면으로 보여줍니다.
// 읽는 법: "props -> header/card render -> styles" 순서로 보면 됩니다.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  description: string;
};

export function ComingSoonScreen({ title, description }: Props) {
  // MARK: - Render

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.emoji}>🛠</Text>
        <Text style={styles.cardTitle}>준비 중인 화면이에요</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </Screen>
  );
}

// MARK: - Styles

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 28,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardDescription: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
