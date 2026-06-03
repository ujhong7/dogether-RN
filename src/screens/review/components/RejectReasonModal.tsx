// MARK: - 거절 사유 Modal
//
// 역할: 리뷰 거절 시 사유를 입력받고 부모 hook에 confirm 이벤트를 전달합니다.
// 읽는 법: "props -> modal/input -> footer actions" 순서로 보면 됩니다.

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
  // MARK: - Render

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
