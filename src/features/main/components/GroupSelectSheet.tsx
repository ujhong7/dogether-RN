import { Modal, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Group } from '../../../domain/entities/group';
import { mainStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  groups: Group[];
  currentGroupId?: number;
  onClose: () => void;
  onSelectGroup: (groupId: number) => void;
};

export function GroupSelectSheet({ visible, groups, currentGroupId, onClose, onSelectGroup }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.groupSheet}>
          <Text style={styles.groupSheetTitle}>그룹 선택</Text>
          <View style={styles.groupSheetList}>
            {groups.map((group) => {
              const selected = currentGroupId === group.id;
              return (
                <Pressable
                  key={group.id}
                  style={styles.groupSheetRow}
                  onPress={() => {
                    onSelectGroup(group.id);
                    onClose();
                  }}
                >
                  <Text style={[styles.groupSheetText, selected ? styles.groupSheetTextSelected : undefined]}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupSheetCheck}>{selected ? '✓' : ''}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={styles.groupAddRow}
            onPress={() => {
              onClose();
              router.push('/group-add');
            }}
          >
            <Text style={styles.groupAddPlus}>⊕</Text>
            <Text style={styles.groupAddText}>새 그룹 추가하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
