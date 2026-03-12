import { Pressable, Text, View } from 'react-native';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  step: 1 | 2 | 3;
  onBack: () => void;
};

export function GroupCreateHeader({ step, onBack }: Props) {
  return (
    <>
      <View style={styles.nav}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>그룹 만들기</Text>
        <View style={styles.navSpacer} />
      </View>

      <Text style={styles.stepText}>{step}/3</Text>
      <Text style={styles.title}>
        {step === 1 ? '어떤 그룹을 만들까요?' : step === 2 ? '어떤 일정으로 진행할까요?' : '그룹 정보를 확인해주세요'}
      </Text>
    </>
  );
}
