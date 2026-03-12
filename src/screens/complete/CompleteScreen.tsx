import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useStartFlowStore } from '../../stores/startFlowStore';
import { CompleteContent } from './components/CompleteContent';
import { completeStyles as styles } from './styles';

export function CompleteScreen() {
  const payload = useStartFlowStore((state) => state.completePayload);
  const clearCompletePayload = useStartFlowStore((state) => state.clearCompletePayload);
  const completeStartFlow = useSessionStore((state) => state.completeStartFlow);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const queryClient = useQueryClient();
  const [isLeavingToMain, setIsLeavingToMain] = useState(false);

  useEffect(() => {
    if (!payload && !isLeavingToMain) {
      router.replace('/start');
    }
  }, [isLeavingToMain, payload]);

  if (!payload) {
    return null;
  }

  return (
    <Screen>
      <CompleteContent payload={payload} />

      <Pressable
        style={styles.button}
        onPress={async () => {
          setIsLeavingToMain(true);
          setSelectedGroupId(payload.targetGroupId);
          await queryClient.invalidateQueries({ queryKey: ['groups'] });
          await queryClient.invalidateQueries({ queryKey: ['todos'] });
          completeStartFlow();
          router.replace('/main');
          clearCompletePayload();
        }}
      >
        <Text style={styles.buttonText}>홈으로 가기</Text>
      </Pressable>
    </Screen>
  );
}
