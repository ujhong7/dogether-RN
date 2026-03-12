import { Pressable, Text, View } from 'react-native';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function GroupCreateDuplicateModal({ visible, onClose, onConfirm }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalIcon}>!</Text>
        <Text style={styles.modalTitle}>동일한 이름의 그룹이 이미 존재합니다.</Text>
        <Text style={styles.modalDesc}>같은 이름으로도 그룹을 생성할 수 있어요.</Text>
        <View style={styles.modalActions}>
          <Pressable style={[styles.footerButton, styles.secondaryFooter]} onPress={onClose}>
            <Text style={styles.secondaryFooterText}>뒤로가기</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.primaryFooter]} onPress={onConfirm}>
            <Text style={styles.primaryFooterText}>그룹 생성</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
