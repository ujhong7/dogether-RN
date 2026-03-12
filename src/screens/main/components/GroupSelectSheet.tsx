import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Group } from '../../../models/group';
import { mainStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  groups: Group[];
  currentGroupId?: number;
  onClose: () => void;
  onSelectGroup: (groupId: number) => void;
};

export function GroupSelectSheet({ visible, groups, currentGroupId, onClose, onSelectGroup }: Props) {
  const rowHeight = 40;
  const rowGap = 8;
  const headerHeight = 54;
  const footerHeight = 58;
  const listHeight =
    groups.length === 0 ? 0 : Math.min(groups.length * rowHeight + Math.max(groups.length - 1, 0) * rowGap, 220);
  const sheetHeight = Math.max(198, headerHeight + listHeight + footerHeight);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.groupSheet, { height: sheetHeight }]}>
          <Text style={styles.groupSheetTitle}>그룹 선택</Text>
          <ScrollView
            style={styles.groupSheetScroll}
            contentContainerStyle={styles.groupSheetList}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>

          <View style={styles.groupSheetFooter}>
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
      </View>
    </Modal>
  );
}
