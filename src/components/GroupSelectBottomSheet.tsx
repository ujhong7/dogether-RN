import type { Group } from '../models/group';
import { SelectionBottomSheet, type SelectionBottomSheetItem } from './SelectionBottomSheet';

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
  const items: SelectionBottomSheetItem[] = groups.map((group) => ({
    key: String(group.id),
    label: group.name,
    selected: currentGroupId === group.id,
  }));

  return (
    <SelectionBottomSheet
      visible={visible}
      title="그룹 선택"
      items={items}
      onClose={onClose}
      onSelect={(key) => onSelectGroup(Number(key))}
      footerAction={footerAction}
    />
  );
}
