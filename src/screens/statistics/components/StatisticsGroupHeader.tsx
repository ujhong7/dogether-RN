import { Pressable, Text, View } from 'react-native';
import type { Group } from '../../../models/group';
import { styles } from '../styles';

type Props = {
  group?: Group;
  onPressGroupSelect: () => void;
};

export function StatisticsGroupHeader({ group, onPressGroupSelect }: Props) {
  return (
    <View style={styles.groupHeader}>
      <View style={styles.groupInfoArea}>
        <Pressable style={styles.groupNameRow} onPress={onPressGroupSelect}>
          <Text style={styles.groupName}>{group?.name}</Text>
          <Text style={styles.groupChevron}>⌄</Text>
        </Pressable>

        <View style={styles.metaRow}>
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

      <View style={styles.characterWrap}>
        <View style={styles.characterBody} />
        <View style={styles.characterGlasses} />
        <View style={styles.characterLaptop} />
      </View>
    </View>
  );
}
