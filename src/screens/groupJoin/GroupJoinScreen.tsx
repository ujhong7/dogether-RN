// MARK: - 그룹 참여 Screen
//
// 역할: 초대 코드를 입력받아 그룹에 참여하고, 완료 화면에 필요한 정보를 저장합니다.
// 읽는 법: "state/ref -> focus side effect -> derived code -> render/submit/modal" 순서로 보면 됩니다.

import { useCallback, useMemo, useRef, useState } from 'react';
import { InteractionManager, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppAlertModal } from '../../components/AppAlertModal';
import { AppErrorAlertModal } from '../../components/AppErrorAlertModal';
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
  // MARK: - Dependencies and form state

  const queryClient = useQueryClient();
  const [joinCode, setJoinCode] = useState('');
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const setCompletePayload = useStartFlowStore((state) => state.setCompletePayload);

  // MARK: - Focus input on enter
  //
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

  // MARK: - Derived form values

  const normalizedCode = joinCode.trim().toUpperCase();
  const canSubmit = normalizedCode.length >= 8;

  // MARK: - Render

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <GroupJoinHeader />

        <View style={styles.formSection}>
          <TextInput
            ref={inputRef}
            value={joinCode}
            onChangeText={(text) => setJoinCode(text.slice(0, 8))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="코드입력 (8자리 이상)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, isFocused ? styles.inputFocused : undefined]}
          />
        </View>

        <Pressable
          style={[styles.button, !canSubmit ? styles.buttonDisabled : undefined]}
          disabled={!canSubmit}
          // MARK: Submit join
          //
          // 비즈니스 에러는 AppAlertModal로 보여주고, 성공하면 완료 화면 payload를 저장한 뒤 이동합니다.
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
                joinCode: result.group.joinCode ?? normalizedCode,
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
        <AppErrorAlertModal visible error={submitError} onClose={() => setSubmitError(null)} />
      ) : null}
    </Screen>
  );
}
