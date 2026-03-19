import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { useReviewScreen } from '../../hooks/useReviewScreen';
import { toAppError } from '../../services/errors/appError';
import { colors } from '../../theme/colors';
import { reviewStyles as styles } from './styles';

export function ReviewScreen() {
  const {
    maxReasonLength,
    pendingReviewsQuery,
    currentReview,
    selectedResult,
    feedback,
    rejectReasonDraft,
    rejectModalVisible,
    isSubmitting,
    canSubmit,
    setFeedback,
    setRejectReasonDraft,
    selectApprove,
    openRejectModal,
    closeRejectModal,
    confirmRejectReason,
    submit,
  } = useReviewScreen();

  if (pendingReviewsQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (pendingReviewsQuery.isError) {
    const appError = toAppError(pendingReviewsQuery.error);
    return (
      <Screen>
        <FullScreenErrorState
          title={appError.title}
          message={appError.message}
          actionLabel={appError.actionLabel}
          onRetry={() => {
            void pendingReviewsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  if (!currentReview) {
    return (
      <Screen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View>
            <Text style={styles.title}>투두를 검사해주세요!</Text>
            <Text style={styles.subtitle}>ⓘ 검사 결과는 선택하면 수정할 수 없어요</Text>
          </View>

          <View style={styles.heroCard}>
            <Image source={{ uri: currentReview.mediaUrl }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroContent}>{currentReview.content}</Text>
              <Text style={styles.heroDoer}>{currentReview.doer}</Text>
            </View>
          </View>

          <Text style={styles.todoTitle}>{currentReview.todoContent}</Text>

          <View style={styles.resultRow}>
            <Pressable
              style={[
                styles.resultButton,
                selectedResult === 'REJECT' ? styles.rejectActive : undefined,
              ]}
              onPress={openRejectModal}
            >
              <Text style={styles.resultButtonText}>노인정</Text>
            </Pressable>
            <Pressable
              style={[
                styles.resultButton,
                selectedResult === 'APPROVE' ? styles.approveActive : undefined,
              ]}
              onPress={selectApprove}
            >
              <Text style={styles.resultButtonText}>인정</Text>
            </Pressable>
          </View>

          {selectedResult === 'REJECT' && feedback ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}

          {selectedResult === 'APPROVE' ? (
            <TextInput
              style={styles.approveInput}
              multiline
              maxLength={maxReasonLength}
              placeholder="오 ~~~"
              placeholderTextColor="#8E97AA"
              value={feedback}
              onChangeText={setFeedback}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.sendButton, !canSubmit ? styles.sendButtonDisabled : undefined]}
            disabled={!canSubmit}
            onPress={() => {
              void submit();
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#111318" />
            ) : (
              <Text style={[styles.sendButtonText, !canSubmit ? styles.sendButtonTextDisabled : undefined]}>
                보내기
              </Text>
            )}
          </Pressable>
        </View>

        <Modal
          visible={rejectModalVisible}
          animationType="fade"
          transparent
          onRequestClose={closeRejectModal}
        >
          {/* 노인정은 사유가 필수라서 별도 입력 모달에서 확정한다. */}
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Pressable
                style={styles.closeButton}
                onPress={closeRejectModal}
              >
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
                  onChangeText={setRejectReasonDraft}
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
                onPress={confirmRejectReason}
              >
                <Text style={styles.modalPrimaryText}>등록하기</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </Screen>
  );
}
