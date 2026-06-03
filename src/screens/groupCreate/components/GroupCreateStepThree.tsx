// MARK: - 그룹 생성 Step 3
//
// 역할: 입력한 그룹 생성 정보를 최종 확인용 summary로 보여줍니다.

import { Text, View } from 'react-native';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  groupName: string;
  durationLabel: string;
  memberCount: number;
  startDateLabel: string;
  endDateLabel: string;
};

export function GroupCreateStepThree({
  groupName,
  durationLabel,
  memberCount,
  startDateLabel,
  endDateLabel,
}: Props) {
  return (
    <View style={styles.summaryWrap}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{groupName}</Text>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>활동 기간</Text>
          <Text style={styles.summaryValue}>{durationLabel}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>그룹원</Text>
          <Text style={styles.summaryValue}>총 {memberCount}명</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>시작일</Text>
          <Text style={styles.summaryValue}>{startDateLabel}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>종료일</Text>
          <Text style={styles.summaryValue}>{endDateLabel}</Text>
        </View>
      </View>
    </View>
  );
}
