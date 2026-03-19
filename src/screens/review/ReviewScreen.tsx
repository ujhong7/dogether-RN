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
import { RejectReasonModal } from './components/RejectReasonModal';
import { ReviewHeroCard } from './components/ReviewHeroCard';
import { ReviewResultSelector } from './components/ReviewResultSelector';
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

          <ReviewHeroCard
            mediaUrl={currentReview.mediaUrl}
            content={currentReview.content}
            doer={currentReview.doer}
            todoContent={currentReview.todoContent}
          />

          <ReviewResultSelector
            selectedResult={selectedResult}
            onPressReject={openRejectModal}
            onPressApprove={selectApprove}
          />

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

        <RejectReasonModal
          visible={rejectModalVisible}
          maxReasonLength={maxReasonLength}
          rejectReasonDraft={rejectReasonDraft}
          onClose={closeRejectModal}
          onChangeText={setRejectReasonDraft}
          onConfirm={confirmRejectReason}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
