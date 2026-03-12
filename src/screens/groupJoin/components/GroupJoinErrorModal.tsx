import { Pressable, Text, View } from 'react-native';
import { groupJoinStyles as styles } from '../styles';

type ErrorType = 'full' | 'joined' | 'invalid';

const errorConfig = {
  full: {
    title: '그룹 인원이 가득 찼어요',
    desc: '다른 그룹에 참여하거나 새로 만들어주세요.',
  },
  joined: {
    title: '이미 참여한 그룹이에요',
    desc: '해당 그룹은 다시 참여하실 수 없어요.',
  },
  invalid: {
    title: '참여할 수 없는 그룹이에요',
    desc: '종료되었거나 유효하지 않은 그룹이에요.',
  },
} as const;

type Props = {
  errorType: ErrorType | null;
  onClose: () => void;
};

export function GroupJoinErrorModal({ errorType, onClose }: Props) {
  if (!errorType) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalIcon}>!</Text>
        <Text style={styles.modalTitle}>{errorConfig[errorType].title}</Text>
        <Text style={styles.modalDesc}>{errorConfig[errorType].desc}</Text>
        <View style={styles.modalActions}>
          <Pressable style={[styles.modalButton, styles.modalButtonMuted]} onPress={onClose}>
            <Text style={styles.modalButtonMutedText}>다시 입력하기</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={onClose}>
            <Text style={styles.modalButtonPrimaryText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
