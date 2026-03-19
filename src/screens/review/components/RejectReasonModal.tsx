import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { reviewStyles as styles } from '../styles';

type Props = {
  visible: boolean;
  maxReasonLength: number;
  rejectReasonDraft: string;
  onClose: () => void;
  onChangeText: (value: string) => void;
  onConfirm: () => void;
};

export function RejectReasonModal({
  visible,
  maxReasonLength,
  rejectReasonDraft,
  onClose,
  onChangeText,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.modalTitle}>이유를 들려주세요 !</Text>
          <Text style={styles.modalCaption}>ⓘ 검사가 완료된 피드백은 바꿀 수 없어요</Text>

          <View style={styles.reasonInputWrap}>
            <TextInput
              style={styles.reasonInput}
              multiline
              autoFocus
              maxLength={maxReasonLength}
              placeholder="텍스트를 입력하세요"
              placeholderTextColor="#9AA1B2"
              value={rejectReasonDraft}
              onChangeText={onChangeText}
            />
            <Text style={styles.reasonCount}>
              {rejectReasonDraft.length}/{maxReasonLength}
            </Text>
          </View>

          <Pressable
            style={[
              styles.modalPrimaryButton,
              !rejectReasonDraft.trim() ? styles.modalPrimaryButtonDisabled : undefined,
            ]}
            disabled={!rejectReasonDraft.trim()}
            onPress={onConfirm}
          >
            <Text style={styles.modalPrimaryText}>등록하기</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
