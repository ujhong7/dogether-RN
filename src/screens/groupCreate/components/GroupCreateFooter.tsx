import { Pressable, Text, View } from 'react-native';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  step: 1 | 2 | 3;
  canGoNext: boolean;
  onPressPrev: () => void;
  onPressNext: () => void;
};

export function GroupCreateFooter({ step, canGoNext, onPressPrev, onPressNext }: Props) {
  return (
    <View style={styles.footer}>
      {step > 1 ? (
        <Pressable style={[styles.footerButton, styles.secondaryFooter]} onPress={onPressPrev}>
          <Text style={styles.secondaryFooterText}>이전</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={[
          styles.footerButton,
          styles.primaryFooter,
          step === 1 && !canGoNext ? styles.buttonDisabled : undefined,
        ]}
        disabled={step === 1 && !canGoNext}
        onPress={onPressNext}
      >
        <Text style={styles.primaryFooterText}>{step === 3 ? '그룹 생성' : '다음'}</Text>
      </Pressable>
    </View>
  );
}
