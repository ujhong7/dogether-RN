import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import type { ReviewResult } from '../models/review';
import { usePendingReviewsQuery } from '../queries/usePendingReviewsQuery';
import { createGroupRepository, createReviewRepository } from '../services/repositories';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { ReviewUseCase } from '../services/usecases/reviewUseCase';
import { useReviewToastStore } from '../stores/reviewToastStore';

const MAX_REASON_LENGTH = 60;

export function useReviewScreen() {
  const queryClient = useQueryClient();
  const showCompletedToast = useReviewToastStore((state) => state.showCompletedToast);
  const pendingReviewsQuery = usePendingReviewsQuery();
  const reviewUseCase = useMemo(() => new ReviewUseCase(createReviewRepository()), []);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

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
      // 검사하기는 할당된 review를 모두 끝낼 때까지 빠져나가지 못하게 막는다.
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    if (!pendingReviewsQuery.isSuccess || currentReview) {
      return;
    }

    void (async () => {
      // 마지막 review까지 끝나면 메인으로 돌려보내고 완료 토스트를 띄운다.
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

  const selectApprove = () => {
    setSelectedResult('APPROVE');
  };

  const openRejectModal = () => {
    setRejectReasonDraft(feedback);
    setRejectModalVisible(true);
  };

  const closeRejectModal = () => {
    setRejectModalVisible(false);
  };

  const confirmRejectReason = () => {
    const nextFeedback = rejectReasonDraft.trim();
    if (!nextFeedback) {
      return;
    }

    setSelectedResult('REJECT');
    setFeedback(nextFeedback);
    setRejectModalVisible(false);
  };

  const submit = async () => {
    if (!currentReview || !selectedResult || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewUseCase.submitReview(currentReview.id, selectedResult, feedback.trim());
      // 다음 review 큐와 앱 진입 분기를 바로 갱신할 수 있도록 관련 query를 무효화한다.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pending-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['launch-flow'] }),
      ]);
      resetSelection();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    maxReasonLength: MAX_REASON_LENGTH,
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
  };
}
