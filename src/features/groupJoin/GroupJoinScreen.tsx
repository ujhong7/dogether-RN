import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { joinMockGroupByCode } from '../../data/repositories/mockGroupData';
import { useMainStore } from '../../store/mainStore';
import { useStartFlowStore } from '../../store/startFlowStore';
import { GroupJoinHeader } from './components/GroupJoinHeader';
import { GroupJoinErrorModal } from './components/GroupJoinErrorModal';
import { groupJoinStyles as styles } from './styles';

export function GroupJoinScreen() {
  const [joinCode, setJoinCode] = useState('');
  const [errorType, setErrorType] = useState<'full' | 'joined' | 'invalid' | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const setCompletePayload = useStartFlowStore((state) => state.setCompletePayload);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);

  const normalizedCode = joinCode.trim().toUpperCase();
  const canSubmit = normalizedCode.length >= 8;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <GroupJoinHeader />

        <View style={styles.formSection}>
          <TextInput
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
          onPress={() => {
            const result = joinMockGroupByCode(normalizedCode);
            if (!result.ok) {
              setErrorType(result.reason);
              return;
            }
            setSelectedGroupId(result.group.id);
            setCompletePayload({
              kind: 'join',
              targetGroupId: result.group.id,
              groupName: result.group.name,
              joinCode: normalizedCode,
              durationLabel: `${result.group.duration}일`,
              memberCountLabel: `총 ${result.group.currentMember}명`,
              startDateLabel: result.group.startDate,
              endDateLabel: result.group.endDate,
            });
            router.replace('/complete');
          }}
        >
          <Text style={styles.buttonText}>가입하기</Text>
        </Pressable>
      </KeyboardAvoidingView>

      <GroupJoinErrorModal errorType={errorType} onClose={() => setErrorType(null)} />
    </Screen>
  );
}
