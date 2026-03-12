import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { useMainStore } from '../../store/mainStore';
import { useSessionStore } from '../../store/sessionStore';
import { useStartFlowStore } from '../../store/startFlowStore';
import { CompleteContent } from './components/CompleteContent';
import { completeStyles as styles } from './styles';

export function CompleteScreen() {
  const payload = useStartFlowStore((state) => state.completePayload);
  const clearCompletePayload = useStartFlowStore((state) => state.clearCompletePayload);
  const completeStartFlow = useSessionStore((state) => state.completeStartFlow);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!payload) {
      router.replace('/start');
    }
  }, [payload]);

  if (!payload) {
    return null;
  }

  return (
    <Screen>
      <CompleteContent payload={payload} />

      <Pressable
        style={styles.button}
        onPress={async () => {
          setSelectedGroupId(payload.targetGroupId);
          await queryClient.invalidateQueries({ queryKey: ['groups'] });
          await queryClient.invalidateQueries({ queryKey: ['todos'] });
          completeStartFlow();
          clearCompletePayload();
          router.replace('/main');
        }}
      >
        <Text style={styles.buttonText}>홈으로 가기</Text>
      </Pressable>
    </Screen>
  );
}
