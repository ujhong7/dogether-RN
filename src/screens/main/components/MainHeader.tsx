import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Group } from '../../../models/group';
import { mainStyles as styles } from '../styles';

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
