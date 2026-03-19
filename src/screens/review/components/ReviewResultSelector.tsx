import { Pressable, Text, View } from 'react-native';
import type { ReviewResult } from '../../../models/review';
import { reviewStyles as styles } from '../styles';

type Props = {
  selectedResult: ReviewResult | null;
  onPressReject: () => void;
  onPressApprove: () => void;
};

export function ReviewResultSelector({
  selectedResult,
  onPressReject,
  onPressApprove,
}: Props) {
  return (
    <View style={styles.resultRow}>
      <Pressable
        style={[styles.resultButton, selectedResult === 'REJECT' ? styles.rejectActive : undefined]}
        onPress={onPressReject}
      >
        <Text style={styles.resultButtonText}>노인정</Text>
      </Pressable>
      <Pressable
        style={[styles.resultButton, selectedResult === 'APPROVE' ? styles.approveActive : undefined]}
        onPress={onPressApprove}
      >
        <Text style={styles.resultButtonText}>인정</Text>
      </Pressable>
    </View>
  );
}
