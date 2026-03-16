import { Pressable, Text, View } from 'react-native';
import type { Ranking } from '../../../models/ranking';
import { rankingStyles as styles } from '../styles';
import { getRankAccent } from '../utils';
import { RankingAvatar } from './RankingAvatar';

type Props = {
  rankings: Ranking[];
  onPressRanking: (ranking: Ranking) => void;
};

export function RankingTopThree({ rankings, onPressRanking }: Props) {
  const topThree = [rankings[1], rankings[0], rankings[2]];

  return (
    <View style={styles.topThreeRow}>
      {topThree.map((item, index) => {
        const displayRank = item?.rank ?? (index === 1 ? 1 : index === 0 ? 2 : 3);
        const accent = getRankAccent(displayRank);
        const elevated = displayRank === 1;
        return (
          <Pressable
            key={displayRank}
            style={[styles.topCardWrap, elevated ? styles.topCardWrapRaised : undefined]}
            disabled={!item || !item.historyReadStatus}
            onPress={() => {
              if (item) {
                onPressRanking(item);
              }
            }}
          >
            <Text style={[styles.crown, { color: accent }]}>{displayRank === 1 ? '♛' : '♚'}</Text>
            <View style={styles.topCard}>
              <RankingAvatar
                accent={accent}
                imageUrl={item?.profileImageUrl}
                readStatus={item?.historyReadStatus}
              />
              <Text style={styles.topName}>{item?.name ?? '-'}</Text>
              <Text style={styles.topRate}>달성률 {item?.achievementRate ?? 0}%</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
