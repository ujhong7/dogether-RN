import { Text, View } from 'react-native';
import { styles } from '../styles';
import { BAR_MAX_HEIGHT } from '../utils';

type ChartItem = {
  day: number;
  label: string;
  total: number;
  createdCount: number;
  certificatedCount: number;
  certificationRate: number;
  isCurrent: boolean;
  isFuture: boolean;
};

type Props = {
  chartValues: ChartItem[];
  achievementPercent: number;
};

export function StatisticsChartCard({ chartValues, achievementPercent }: Props) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>🗓</Text>
        <Text style={styles.cardTitle}>인증한 기간</Text>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.axisColumn}>
          {[10, 8, 6, 4, 2, 0].map((value) => (
            <Text key={value} style={styles.axisText}>
              {value}
            </Text>
          ))}
        </View>
        <View style={styles.barRow}>
          {chartValues.map((item) => (
            <View key={item.label} style={styles.barColumn}>
              <View style={styles.barVisualArea}>
                {item.isCurrent && !item.isFuture ? (
                  <View
                    style={[
                      styles.currentIndicator,
                      {
                        bottom: Math.max((item.createdCount / item.total) * BAR_MAX_HEIGHT + 10, 10),
                      },
                    ]}
                  >
                    <View style={styles.badge}>
                      <Text numberOfLines={1} style={styles.badgeText}>
                        {achievementPercent}% 달성중
                      </Text>
                    </View>
                    <View style={styles.badgePointer} />
                    <View style={styles.currentDot} />
                  </View>
                ) : null}

                {item.createdCount > 0 ? (
                  <View
                    style={[
                      styles.barTrack,
                      {
                        height: (item.createdCount / item.total) * BAR_MAX_HEIGHT,
                      },
                    ]}
                  >
                    <View style={styles.barStripeWrap}>
                      {Array.from({ length: 8 }, (_, index) => (
                        <View key={index} style={[styles.barStripe, { left: index * 18 - 12 }]} />
                      ))}
                    </View>
                    {item.certificatedCount > 0 ? (
                      <View
                        style={[
                          styles.barFill,
                          item.isCurrent ? styles.barFillCurrent : undefined,
                          {
                            height: `${(item.certificatedCount / item.createdCount) * 100}%`,
                          },
                        ]}
                      />
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.barTrackPlaceholder} />
                )}
              </View>
              <Text style={[styles.barLabel, item.isFuture ? styles.barLabelFuture : undefined]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
