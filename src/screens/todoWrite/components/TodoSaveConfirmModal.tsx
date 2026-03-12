import { Pressable, Text, View } from 'react-native';
import { todoWriteStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TodoSaveConfirmModal({ visible, onCancel, onConfirm }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalIcon}>!</Text>
        <Text style={styles.modalTitle}>투두를 저장하시겠습니까?</Text>
        <Text style={styles.modalDesc}>한 번 저장한 투두는 수정과 삭제가 불가능합니다</Text>
        <View style={styles.modalActions}>
          <Pressable style={[styles.modalButton, styles.modalButtonMuted]} onPress={onCancel}>
            <Text style={styles.modalMutedText}>뒤로가기</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={onConfirm}>
            <Text style={styles.modalPrimaryText}>저장하기</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
