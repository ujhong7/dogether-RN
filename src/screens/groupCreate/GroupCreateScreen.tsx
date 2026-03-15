import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppAlertModal } from '../../components/AppAlertModal';
import { Screen } from '../../components/Screen';
import type { AppError } from '../../models/error';
import { createGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import { useMainStore } from '../../stores/mainStore';
import { useStartFlowStore } from '../../stores/startFlowStore';
import { GroupCreateHeader } from './components/GroupCreateHeader';
import { GroupCreateStepOne } from './components/GroupCreateStepOne';
import { GroupCreateStepTwo } from './components/GroupCreateStepTwo';
import { GroupCreateStepThree } from './components/GroupCreateStepThree';
import { GroupCreateFooter } from './components/GroupCreateFooter';
import { GroupCreateDuplicateModal } from './components/GroupCreateDuplicateModal';
import { groupCreateStyles as styles } from './styles';
import type { DurationOption, StartOption } from './types';
import { buildSchedule } from './utils';

export function GroupCreateScreen() {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState('');
  const [memberCount, setMemberCount] = useState(10);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [duration, setDuration] = useState<DurationOption>('3일');
  const [startOption, setStartOption] = useState<StartOption>('오늘 시작');
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [isGroupNameFocused, setIsGroupNameFocused] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const setCompletePayload = useStartFlowStore((state) => state.setCompletePayload);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const normalizedName = groupName.trim();
  const schedule = useMemo(() => buildSchedule(startOption, duration), [startOption, duration]);
  const canGoStepOne = normalizedName.length >= 2;

  const completeGroupCreate = async () => {
    try {
      const createdGroup = await groupUseCase.createGroup({
        name: normalizedName,
        memberCount,
        durationDays: schedule.durationDays,
        startAt: schedule.startAt,
      });
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      setSelectedGroupId(createdGroup.id);
      setCompletePayload({
        kind: 'create',
        targetGroupId: createdGroup.id,
        groupName: createdGroup.name,
        joinCode: createdGroup.joinCode,
        durationLabel: duration,
        memberCountLabel: `총 ${memberCount}명`,
        startDateLabel: createdGroup.startDate,
        endDateLabel: createdGroup.endDate,
      });
      router.replace('/complete');
    } catch (error) {
      setSubmitError(toAppError(error));
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <GroupCreateHeader
          step={step}
          onBack={() => (step === 1 ? router.back() : setStep((step - 1) as 1 | 2 | 3))}
        />

        {step === 1 ? (
          <GroupCreateStepOne
            groupName={groupName}
            memberCount={memberCount}
            isFocused={isGroupNameFocused}
            onChangeGroupName={setGroupName}
            onFocus={() => setIsGroupNameFocused(true)}
            onBlur={() => setIsGroupNameFocused(false)}
            onDecreaseMemberCount={() => setMemberCount((value) => Math.max(2, value - 1))}
            onIncreaseMemberCount={() => setMemberCount((value) => Math.min(20, value + 1))}
          />
        ) : null}

        {step === 2 ? (
          <GroupCreateStepTwo
            duration={duration}
            startOption={startOption}
            onSelectDuration={setDuration}
            onSelectStartOption={setStartOption}
          />
        ) : null}

        {step === 3 ? (
          <GroupCreateStepThree
            groupName={normalizedName}
            durationLabel={duration}
            memberCount={memberCount}
            startDateLabel={schedule.startLabel}
            endDateLabel={schedule.endLabel}
          />
        ) : null}

        <GroupCreateFooter
          step={step}
          canGoNext={canGoStepOne}
          onPressPrev={() => setStep((step - 1) as 1 | 2 | 3)}
          onPressNext={() => {
            if (step === 1) {
              setStep(2);
              return;
            }
            if (step === 2) {
              setStep(3);
              return;
            }
            if (normalizedName === 'DND 작심삼일 탈출러') {
              setDuplicateModalVisible(true);
              return;
            }
            void completeGroupCreate();
          }}
        />
      </KeyboardAvoidingView>

      <GroupCreateDuplicateModal
        visible={duplicateModalVisible}
        onClose={() => setDuplicateModalVisible(false)}
        onConfirm={() => {
          setDuplicateModalVisible(false);
          void completeGroupCreate();
        }}
      />

      {submitError ? (
        <AppAlertModal visible error={submitError} onClose={() => setSubmitError(null)} />
      ) : null}
    </Screen>
  );
}
