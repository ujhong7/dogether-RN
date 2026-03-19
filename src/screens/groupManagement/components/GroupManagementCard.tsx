import { Pressable, Text, View } from 'react-native';
import type { Group } from '../../../models/group';
import { styles } from '../styles';

type Props = {
  group: Group;
  onPressLeave: (groupId: number) => void;
};

export function GroupManagementCard({ group, onPressLeave }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{group.name}</Text>
        <Pressable style={styles.leaveButton} onPress={() => onPressLeave(group.id)}>
          <Text style={styles.leaveButtonText}>탈퇴하기</Text>
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>그룹원</Text>
        <Text style={styles.infoValue}>
          {group.currentMember}/{group.maximumMember}
        </Text>
        <Text style={styles.infoLabel}>종료일</Text>
        <Text style={styles.infoValue}>{group.endDate}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>초대코드</Text>
        <Text style={styles.infoValue}>{group.joinCode}</Text>
      </View>
    </View>
  );
}
