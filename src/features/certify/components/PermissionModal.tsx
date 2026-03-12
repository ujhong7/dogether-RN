import { Linking, Modal, Pressable, Text, View } from 'react-native';
import { certificationStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export function PermissionModal({ visible, title, description, onClose }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>!</Text>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>

          <View style={styles.modalActions}>
            <Pressable style={[styles.modalButton, styles.modalButtonMuted]} onPress={onClose}>
              <Text style={styles.modalButtonText}>나중에</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={async () => {
                onClose();
                await Linking.openSettings();
              }}
            >
              <Text style={styles.modalButtonText}>설정 열기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
