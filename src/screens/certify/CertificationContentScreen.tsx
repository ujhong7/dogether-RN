import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { CertificationHeader } from './components/CertificationHeader';
import { certificationStyles as styles } from './styles';
import { useCertificationDraftStore } from '../../stores/certificationDraftStore';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { createChallengeGroupRepository } from '../../services/repositories';
import { colors } from '../../theme/colors';

const MAX_CONTENT_LENGTH = 60;

export function CertificationContentScreen() {
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

  const contentLength = draft.content.length;
  const canSubmit =
    Boolean(draft.todoId) &&
    Boolean(draft.groupId) &&
    Boolean(draft.date) &&
    Boolean(draft.imageUri) &&
    draft.content.trim().length > 0 &&
    !submitting;

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
        draft.imageUri,
      );
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      clearDraft();
      router.replace('/main');
    } finally {
      setSubmitting(false);
    }
  };

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
      </KeyboardAvoidingView>
    </Screen>
  );
}
