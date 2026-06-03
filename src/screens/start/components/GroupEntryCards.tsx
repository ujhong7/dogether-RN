// MARK: - 그룹 시작 Entry Cards
//
// 역할: 시작 화면에서 그룹 만들기/초대 코드 참여하기 진입 카드를 보여줍니다.
// 읽는 법: 두 Pressable card가 각각 group-create, group-join route로 이동합니다.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../theme/colors';

export function GroupEntryCards() {
  // MARK: - Render

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={() => router.push('/group-create')}>
        <Text style={[styles.cardIcon, styles.blueIcon]}>👥</Text>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>그룹 만들기</Text>
          <Text style={styles.cardDesc}>그룹을 만들고 그룹원을 초대해보세요</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/group-join')}>
        <Text style={[styles.cardIcon, styles.yellowIcon]}>🔑</Text>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>초대 코드로 참여하기</Text>
          <Text style={styles.cardDesc}>그룹원에게 받은 초대 코드로 참여하세요</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

// MARK: - Styles

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    minHeight: 100,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  blueIcon: {
    color: colors.primary,
  },
  yellowIcon: {
    color: '#F2D15C',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardDesc: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  chevron: {
    color: '#B7BDCF',
    fontSize: 28,
  },
});
