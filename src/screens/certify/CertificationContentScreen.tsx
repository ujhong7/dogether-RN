// MARK: - 인증 내용 Screen
//
// 역할: 사진 선택 이후 인증 설명을 입력받고, 최종 인증 API를 호출합니다.
// 읽는 법: "draft/dependency -> 제출 가능 조건 -> submit -> render/error" 순서로 보면 됩니다.

import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppErrorAlertModal } from '../../components/AppErrorAlertModal';
import { Screen } from '../../components/Screen';
import { CertificationHeader } from './components/CertificationHeader';
import { certificationStyles as styles } from './styles';
import { useCertificationDraftStore } from '../../stores/certificationDraftStore';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { createChallengeGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import type { AppError } from '../../models/error';
import { colors } from '../../theme/colors';

const MAX_CONTENT_LENGTH = 60;

export function CertificationContentScreen() {
  // MARK: - Dependencies and draft
  //
  // 사진 단계에서 저장한 draft를 이어받아 인증 설명과 함께 제출합니다.
  const queryClient = useQueryClient();
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const draft = useCertificationDraftStore((state) => state.draft);
  const setContent = useCertificationDraftStore((state) => state.setContent);
  const clearDraft = useCertificationDraftStore((state) => state.clearDraft);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);

  // MARK: - Validation

  const contentLength = draft.content.length;
  const canSubmit =
    Boolean(draft.todoId) &&
    Boolean(draft.groupId) &&
    Boolean(draft.date) &&
    Boolean(draft.imageUri) &&
    draft.content.trim().length > 0 &&
    !submitting;

  // MARK: - Submit certification
  //
  // 인증 성공 후 관련 query들을 무효화해 메인/인증목록/통계가 최신 데이터를 다시 읽게 합니다.
  const handleSubmit = async () => {
    if (!canSubmit || !draft.todoId || !draft.groupId || !draft.date || !draft.imageUri) {
      return;
    }

    setSubmitting(true);
    try {
      await challengeGroupUseCase.certifyTodo(
        draft.groupId,
        draft.date,
        draft.todoId,
        draft.content.trim(),
        {
          uri: draft.imageUri,
          mimeType: draft.imageMimeType,
        },
      );
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      await queryClient.invalidateQueries({ queryKey: ['certification-list'] });
      await queryClient.invalidateQueries({ queryKey: ['statistics'] });
      clearDraft();
      router.replace('/main');
    } catch (error) {
      setSubmitError(toAppError(error));
    } finally {
      setSubmitting(false);
    }
  };

  // MARK: - Render

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <CertificationHeader />

        <Text style={styles.title}>인증 내용을 보완해주세요!</Text>

        <View style={styles.noticeWrap}>
          <Text style={styles.noticeIcon}>ⓘ</Text>
          <Text style={styles.noticeText}>한번 인증한 내용은 바꿀 수 없어요</Text>
        </View>

        <View>
          <TextInput
            value={draft.content}
            onChangeText={(text) => setContent(text.slice(0, MAX_CONTENT_LENGTH))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="팀원이 이해하기 쉽도록 투두에 대한 설명을 입력해주세요."
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.textArea, focused ? styles.textAreaFocused : undefined]}
            maxLength={MAX_CONTENT_LENGTH}
          />
          <Text style={styles.textCounter}>{contentLength}/{MAX_CONTENT_LENGTH}</Text>
        </View>

        <Pressable
          style={[styles.footerButton, !canSubmit ? styles.footerButtonDisabled : undefined]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text style={styles.footerButtonText}>인증하기</Text>
        </Pressable>

        {submitError ? (
          <AppErrorAlertModal visible error={submitError} onClose={() => setSubmitError(null)} />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
