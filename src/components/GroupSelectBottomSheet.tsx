import type { Group } from '../models/group';
import { SelectionBottomSheet, type SelectionBottomSheetItem } from './SelectionBottomSheet';

// MARK: - 그룹 선택 BottomSheet Adapter
//
// 역할: Group 모델 배열을 공통 SelectionBottomSheet가 이해하는 item 배열로 변환합니다.
// 읽는 법: 이 파일은 UI를 직접 그리기보다 "도메인 모델 -> 공통 컴포넌트 props" 연결만 담당합니다.

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
  // MARK: - Model mapping

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
