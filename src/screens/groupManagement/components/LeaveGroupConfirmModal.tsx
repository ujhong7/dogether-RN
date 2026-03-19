import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

type Props = {
  visible: boolean;
  isLeaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LeaveGroupConfirmModal({ visible, isLeaving, onClose, onConfirm }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>현재 그룹을 탈퇴하시겠어요?</Text>
        <Text style={styles.modalMessage}>그룹을 탈퇴하면 그룹 내 모든 데이터가{"\n"}삭제되며 복구할 수 없어요.</Text>
        <View style={styles.modalActions}>
          <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={onClose}>
            <Text style={styles.modalCancelText}>뒤로가기</Text>
          </Pressable>
          <Pressable
            style={[
              styles.modalButton,
              styles.modalConfirmButton,
              isLeaving ? styles.modalConfirmButtonDisabled : undefined,
            ]}
            disabled={isLeaving}
            onPress={onConfirm}
          >
            <Text style={styles.modalConfirmText}>{isLeaving ? '탈퇴중...' : '탈퇴하기'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
