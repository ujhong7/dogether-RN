// MARK: - 공통 선택 BottomSheet
//
// 역할: 정렬/선택 옵션 목록을 modal bottom sheet 형태로 보여주는 공통 컴포넌트입니다.
// 읽는 법: "item 타입 -> 높이 계산 -> modal render -> styles" 순서로 보면 됩니다.

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export type SelectionBottomSheetItem = {
  key: string;
  label: string;
  selected?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  items: SelectionBottomSheetItem[];
  onClose: () => void;
  onSelect: (key: string) => void;
  footerAction?: {
    label: string;
    icon?: string;
    onPress: () => void;
  };
};

export function SelectionBottomSheet({ visible, title, items, onClose, onSelect, footerAction }: Props) {
  // MARK: - Layout metrics
  //
  // 항목 수와 safe area bottom inset을 기준으로 sheet 높이를 계산합니다.
  const insets = useSafeAreaInsets();
  const rowHeight = 40;
  const rowGap = 8;
  const titleHeight = 24;
  const titleMarginBottom = 18;
  const topPadding = 20;
  const bottomPadding = 12 + insets.bottom;
  const footerHeight = footerAction ? 70 : 0;
  const listHeight =
    items.length === 0 ? 0 : Math.min(items.length * rowHeight + Math.max(items.length - 1, 0) * rowGap, 220);
  const sheetHeight = Math.max(
    footerAction ? 198 : 170,
    topPadding + titleHeight + titleMarginBottom + listHeight + footerHeight + bottomPadding,
  );

  // MARK: - Render

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: bottomPadding }]}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.list,
              footerAction ? styles.listWithFooter : undefined,
              !footerAction ? styles.listWithoutFooter : undefined,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <Pressable
                key={item.key}
                style={styles.row}
                onPress={() => {
                  onSelect(item.key);
                  onClose();
                }}
              >
                <Text style={[styles.rowText, item.selected ? styles.rowTextSelected : undefined]}>{item.label}</Text>
                <Text style={styles.check}>{item.selected ? '✓' : ''}</Text>
              </Pressable>
            ))}
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

// MARK: - Styles

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
