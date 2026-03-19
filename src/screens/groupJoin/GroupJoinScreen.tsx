import { useCallback, useMemo, useRef, useState } from 'react';
import { InteractionManager, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppAlertModal } from '../../components/AppAlertModal';
import { Screen } from '../../components/Screen';
import { getAppError, type AppError, type AppErrorCode } from '../../models/error';
import { toAppError } from '../../services/errors/appError';
import { createGroupRepository } from '../../services/repositories';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import { useMainStore } from '../../stores/mainStore';
import { useStartFlowStore } from '../../stores/startFlowStore';
import { GroupJoinHeader } from './components/GroupJoinHeader';
import { groupJoinStyles as styles } from './styles';

export function GroupJoinScreen() {
  const queryClient = useQueryClient();
  const [joinCode, setJoinCode] = useState('');
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const setCompletePayload = useStartFlowStore((state) => state.setCompletePayload);

  // iOS의 viewDidAppear에 해당하는 화면 진입 시점에 TextInput 포커스
  // Android는 화면 전환 애니메이션 중에 focus()를 호출하면 무시되므로
  // InteractionManager로 애니메이션 완료 후 실행
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        inputRef.current?.focus();
      });
      return () => task.cancel();
    }, []),
  );
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const normalizedCode = joinCode.trim().toUpperCase();
  const canSubmit = normalizedCode.length >= 8;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <GroupJoinHeader />

        <View style={styles.formSection}>
          <TextInput
            ref={inputRef}
            value={joinCode}
            onChangeText={setJoinCode}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="코드입력 (8자리 이상)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            style={[styles.input, isFocused ? styles.inputFocused : undefined]}
          />
        </View>

        <Pressable
          style={[styles.button, !canSubmit ? styles.buttonDisabled : undefined]}
          disabled={!canSubmit}
          onPress={async () => {
            try {
              const result = await groupUseCase.joinGroupByCode(normalizedCode);
              if (!result.ok) {
                setErrorCode(result.code);
                return;
              }
              await queryClient.invalidateQueries({ queryKey: ['groups'] });
              setSelectedGroupId(result.group.id);
              setCompletePayload({
                kind: 'join',
                targetGroupId: result.group.id,
                groupName: result.group.name,
                joinCode: result.group.joinCode,
                durationLabel: `${result.group.duration}일`,
                memberCountLabel: `총 ${result.group.currentMember}명`,
                startDateLabel: result.group.startDate,
                endDateLabel: result.group.endDate,
              });
              router.replace('/complete');
            } catch (error) {
              setSubmitError(toAppError(error));
            }
          }}
        >
          <Text style={styles.buttonText}>가입하기</Text>
        </Pressable>
      </KeyboardAvoidingView>

      <AppAlertModal
        visible={Boolean(errorCode)}
        error={getAppError(errorCode ?? 'CGF-0005')}
        onClose={() => setErrorCode(null)}
      />

      {submitError ? (
        <AppAlertModal visible error={submitError} onClose={() => setSubmitError(null)} />
      ) : null}
    </Screen>
  );
}
