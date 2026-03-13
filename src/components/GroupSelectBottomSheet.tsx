import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Group } from '../models/group';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  groups: Group[];
  currentGroupId?: number;
  onClose: () => void;
  onSelectGroup: (groupId: number) => void;
  footerAction?: {
    label: string;
    icon?: string;
    onPress: () => void;
  };
};

export function GroupSelectBottomSheet({
  visible,
  groups,
  currentGroupId,
  onClose,
  onSelectGroup,
  footerAction,
}: Props) {
  const insets = useSafeAreaInsets();
  const rowHeight = 40;
  const rowGap = 8;
  const titleHeight = 24;
  const titleMarginBottom = 18;
  const topPadding = 20;
  const bottomPadding = 12 + insets.bottom;
  const footerHeight = footerAction ? 70 : 0;
  const listHeight =
    groups.length === 0 ? 0 : Math.min(groups.length * rowHeight + Math.max(groups.length - 1, 0) * rowGap, 220);
  const sheetHeight = Math.max(
    footerAction ? 198 : 170,
    topPadding + titleHeight + titleMarginBottom + listHeight + footerHeight + bottomPadding,
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: bottomPadding }]}>
          <Text style={styles.title}>그룹 선택</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.list,
              footerAction ? styles.listWithFooter : undefined,
              !footerAction ? styles.listWithoutFooter : undefined,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => {
              const selected = currentGroupId === group.id;

              return (
                <Pressable
                  key={group.id}
                  style={styles.row}
                  onPress={() => {
                    onSelectGroup(group.id);
                    onClose();
                  }}
                >
                  <Text style={[styles.rowText, selected ? styles.rowTextSelected : undefined]}>{group.name}</Text>
                  <Text style={styles.check}>{selected ? '✓' : ''}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {footerAction ? (
            <View style={styles.footer}>
              <Pressable
                style={styles.footerRow}
                onPress={() => {
                  onClose();
                  footerAction.onPress();
                }}
              >
                <Text style={styles.footerIcon}>{footerAction.icon ?? '⊕'}</Text>
                <Text style={styles.footerText}>{footerAction.label}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  sheet: {
    backgroundColor: '#2A2B31',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
  },
  scroll: {
    flexGrow: 0,
  },
  list: {
    gap: 8,
  },
  listWithFooter: {
    paddingBottom: 8,
  },
  listWithoutFooter: {
    paddingBottom: 24,
  },
  row: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    color: '#A9AFBF',
    fontSize: 15,
    fontWeight: '600',
  },
  rowTextSelected: {
    color: '#5B9DF0',
    fontWeight: '800',
  },
  check: {
    minWidth: 24,
    textAlign: 'right',
    color: '#75B0FF',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#3A3E4A',
    marginTop: 12,
    paddingTop: 12,
  },
  footerRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerIcon: {
    color: '#D7DCEA',
    fontSize: 18,
  },
  footerText: {
    color: '#D7DCEA',
    fontSize: 15,
    fontWeight: '600',
  },
});
