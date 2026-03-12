import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppError } from '../models/error';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  error: AppError;
  onClose: () => void;
  onConfirm?: () => void;
};

export function AppAlertModal({ visible, error, onClose, onConfirm }: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>{error.title}</Text>
          <Text style={styles.message}>{error.message}</Text>
          <View style={styles.actions}>
            {error.cancelLabel ? (
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelText}>{error.cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                if (onConfirm) {
                  onConfirm();
                  return;
                }
                onClose();
              }}
            >
              <Text style={styles.confirmText}>{error.actionLabel ?? '확인'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    backgroundColor: '#2A2B31',
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
  },
  icon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: '#4B5563',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    color: '#111318',
    fontSize: 14,
    fontWeight: '800',
  },
});
