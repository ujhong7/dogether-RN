// MARK: - 리뷰 Screen
//
// 역할: 다른 멤버의 인증을 승인/거절하고, 거절 사유 또는 승인 코멘트를 입력합니다.
// 읽는 법: 화면 로직은 useReviewScreen에 있고, 이 파일은 loading/error/normal UI를 나눠 렌더링합니다.

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
import { AppErrorAlertModal } from '../../components/AppErrorAlertModal';
import { Screen } from '../../components/Screen';
import { QueryErrorState } from '../../components/QueryErrorState';
import { useReviewScreen } from '../../hooks/useReviewScreen';
import { colors } from '../../theme/colors';
import { RejectReasonModal } from './components/RejectReasonModal';
import { ReviewHeroCard } from './components/ReviewHeroCard';
import { ReviewResultSelector } from './components/ReviewResultSelector';
import { reviewStyles as styles } from './styles';

export function ReviewScreen() {
  // MARK: - Hook state
  //
  // 리뷰 큐, 선택 결과, 피드백, 모달 상태, 제출 이벤트를 hook에서 받아옵니다.
  const {
    maxReasonLength,
    pendingReviewsQuery,
    currentReview,
    selectedResult,
    feedback,
    rejectReasonDraft,
    rejectModalVisible,
    isSubmitting,
    submitError,
    canSubmit,
    setFeedback,
    setRejectReasonDraft,
    selectApprove,
    openRejectModal,
    closeRejectModal,
    confirmRejectReason,
    clearSubmitError,
    submit,
  } = useReviewScreen();

  // MARK: - Loading state

  if (pendingReviewsQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // MARK: - Error state

  if (pendingReviewsQuery.isError) {
    return (
      <QueryErrorState
        error={pendingReviewsQuery.error}
        onRetry={() => {
          void pendingReviewsQuery.refetch();
        }}
      />
    );
  }

  // MARK: - Waiting for current review
  //
  // query는 끝났지만 아직 currentReview 계산이 비어 있는 짧은 순간을 방어합니다.
  if (!currentReview) {
    return (
      <Screen>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // MARK: - Render
  //
  // 인증 카드, 승인/거절 선택, 피드백 입력, 제출 버튼, 거절 사유 모달 순서로 구성합니다.
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

        {submitError ? (
          <AppErrorAlertModal visible error={submitError} onClose={clearSubmitError} />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
