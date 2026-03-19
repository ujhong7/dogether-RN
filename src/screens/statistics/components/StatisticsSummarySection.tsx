import { Text, View } from 'react-native';
import { styles } from '../styles';

type Props = {
  totalMembers: number;
  rank: number;
  certificatedCount: number;
  approvedCount: number;
  rejectedCount: number;
};

export function StatisticsSummarySection({
  totalMembers,
  rank,
  certificatedCount,
  approvedCount,
  rejectedCount,
}: Props) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoIcon}>✦</Text>
          <Text style={styles.infoTitle}>내 순위</Text>
        </View>
        <Text style={styles.infoSubText}>{totalMembers}명 중</Text>
        <Text style={styles.rankValue}>{rank}등</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoIcon}>▥</Text>
          <Text style={styles.infoTitle}>요약</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryBullet}>✔</Text>
          <Text style={styles.summaryItemText}>달성 {certificatedCount}개</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryBullet}>◔</Text>
          <Text style={styles.summaryItemText}>인정 {approvedCount}개</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryBullet}>✿</Text>
          <Text style={styles.summaryItemText}>노인정 {rejectedCount}개</Text>
        </View>
      </View>
    </View>
  );
}
