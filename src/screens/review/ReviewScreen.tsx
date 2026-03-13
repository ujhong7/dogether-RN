import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
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
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { usePendingReviewsQuery } from '../../queries/usePendingReviewsQuery';
import type { ReviewResult } from '../../models/review';
import { createGroupRepository, createReviewRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import { ReviewUseCase } from '../../services/usecases/reviewUseCase';
import { useReviewToastStore } from '../../stores/reviewToastStore';
import { colors } from '../../theme/colors';
import { reviewStyles as styles } from './styles';

const MAX_REASON_LENGTH = 60;

export function ReviewScreen() {
  const queryClient = useQueryClient();
  const showCompletedToast = useReviewToastStore((state) => state.showCompletedToast);
  const pendingReviewsQuery = usePendingReviewsQuery();
  const reviewUseCase = useMemo(
    () => new ReviewUseCase(createReviewRepository()),
    [],
  );
  const groupUseCase = useMemo(
    () => new GroupUseCase(createGroupRepository()),
    [],
  );

  const [selectedResult, setSelectedResult] = useState<ReviewResult | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentReview = pendingReviewsQuery.data?.[0] ?? null;
  const canSubmit =
    selectedResult === 'APPROVE'
      ? !isSubmitting
      : selectedResult === 'REJECT'
        ? feedback.trim().length > 0 && !isSubmitting
        : false;

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    if (!pendingReviewsQuery.isSuccess || currentReview) {
      return;
    }

    void (async () => {
      const groups = await groupUseCase.getGroups();
      showCompletedToast('완료, 검사가 완료되었어요');
      router.replace(groups.length > 0 ? '/main' : '/start');
    })();
  }, [currentReview, groupUseCase, pendingReviewsQuery.isSuccess, showCompletedToast]);

  const resetSelection = () => {
    setSelectedResult(null);
    setFeedback('');
    setRejectReasonDraft('');
    setRejectModalVisible(false);
  };

  const handleSelectApprove = () => {
    setSelectedResult('APPROVE');
  };

  const handleSelectReject = () => {
    setRejectReasonDraft(feedback);
    setRejectModalVisible(true);
  };

  const handleConfirmRejectReason = () => {
    const nextFeedback = rejectReasonDraft.trim();
    if (!nextFeedback) {
      return;
    }

    setSelectedResult('REJECT');
    setFeedback(nextFeedback);
    setRejectModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!currentReview || !selectedResult || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewUseCase.submitReview(currentReview.id, selectedResult, feedback.trim());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pending-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['launch-flow'] }),
      ]);
      resetSelection();
    } finally {
      setIsSubmitting(false);
    }
  };

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
              onPress={handleSelectReject}
            >
              <Text style={styles.resultButtonText}>노인정</Text>
            </Pressable>
            <Pressable
              style={[
                styles.resultButton,
                selectedResult === 'APPROVE' ? styles.approveActive : undefined,
              ]}
              onPress={handleSelectApprove}
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
              maxLength={MAX_REASON_LENGTH}
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
              void handleSubmit();
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
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setRejectModalVisible(false)}
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
                  maxLength={MAX_REASON_LENGTH}
                  placeholder="텍스트를 입력하세요"
                  placeholderTextColor="#9AA1B2"
                  value={rejectReasonDraft}
                  onChangeText={setRejectReasonDraft}
                />
                <Text style={styles.reasonCount}>
                  {rejectReasonDraft.length}/{MAX_REASON_LENGTH}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.modalPrimaryButton,
                  !rejectReasonDraft.trim() ? styles.modalPrimaryButtonDisabled : undefined,
                ]}
                disabled={!rejectReasonDraft.trim()}
                onPress={handleConfirmRejectReason}
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
