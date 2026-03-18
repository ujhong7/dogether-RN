import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Group } from '../../../models/group';
import { colors } from '../../../theme/colors';

type Props = {
  group?: Group;
  dayLabel: string;
  progressPercent: number;
  onPressGroupName: () => void;
};

export function MainHeader({ group, dayLabel, progressPercent, onPressGroupName }: Props) {
  return (
    <>
      <View style={styles.topBar}>
        <Text style={styles.logo}>dogether</Text>
        <Pressable onPress={() => router.push('/my')} style={styles.profileButton}>
          <Text style={styles.profileIcon}>◌</Text>
        </Pressable>
      </View>

      <View style={styles.groupSection}>
        <View style={styles.groupTextArea}>
          <Pressable style={styles.groupNameRow} onPress={onPressGroupName}>
            <Text style={styles.groupName}>{group?.name ?? '그룹 선택'}</Text>
            <Text style={styles.groupChevron}>⌄</Text>
          </Pressable>

          <View style={styles.groupMetaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>그룹원</Text>
              <Text style={styles.metaValue}>
                {group ? `${group.currentMember}/${group.maximumMember}` : '-'}
              </Text>
            </View>

            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>초대코드</Text>
              <Text style={styles.metaValue}>{group?.joinCode ?? '-'}</Text>
            </View>

            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>종료일</Text>
              <Text style={styles.metaValue}>{group?.endDate ?? '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dosikWrap}>
          <View style={styles.dosikBody} />
          <View style={styles.dosikLaptop} />
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>진행 현황 {dayLabel}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <Pressable style={styles.rankingButton} onPress={() => router.push('/ranking')}>
        <Text style={styles.rankingIcon}>▦</Text>
        <Text style={styles.rankingText}>그룹 활동 한눈에 보기 !</Text>
        <Text style={styles.rankingChevron}>›</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logo: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  profileButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    color: colors.text,
    fontSize: 22,
  },
  groupSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupTextArea: {
    flex: 1,
    paddingTop: 8,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  groupName: {
    color: '#4EA0FF',
    fontSize: 18,
    fontWeight: '800',
  },
  groupChevron: {
    color: colors.text,
    fontSize: 16,
    marginTop: 2,
  },
  groupMetaRow: {
    flexDirection: 'row',
    gap: 18,
  },
  metaColumn: {
    gap: 2,
  },
  metaLabel: {
    color: '#8C91A7',
    fontSize: 11,
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  dosikWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dosikBody: {
    width: 78,
    height: 78,
    borderRadius: 30,
    backgroundColor: '#5B9DF0',
  },
  dosikLaptop: {
    position: 'absolute',
    bottom: 20,
    width: 48,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#23252D',
  },
  progressHeader: {
    marginTop: 4,
    marginBottom: 6,
  },
  progressLabel: {
    color: '#8C91A7',
    fontSize: 11,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1E212A',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5B9DF0',
  },
  rankingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26272D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  rankingIcon: {
    color: '#5B9DF0',
    marginRight: 10,
    fontSize: 16,
  },
  rankingText: {
    flex: 1,
    color: '#D3D7E4',
    fontSize: 14,
    fontWeight: '600',
  },
  rankingChevron: {
    color: '#B7BDCF',
    fontSize: 22,
  },
});
