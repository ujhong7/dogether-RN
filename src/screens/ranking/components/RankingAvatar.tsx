import { Image, Text, View } from 'react-native';
import type { RankingHistoryReadStatus } from '../../../models/ranking';
import { rankingStyles as styles } from '../styles';

type Props = {
  accent: string;
  imageUrl?: string;
  readStatus?: RankingHistoryReadStatus;
};

function getRingStyle(readStatus?: RankingHistoryReadStatus) {
  if (readStatus === 'READ_YET') {
    return styles.avatarUnreadRing;
  }

  if (readStatus === 'READ_ALL') {
    return styles.avatarReadRing;
  }

  return styles.avatarPlainRing;
}

export function RankingAvatar({ accent, imageUrl, readStatus }: Props) {
  return (
    <View style={[styles.avatarRing, getRingStyle(readStatus), readStatus ? undefined : { borderColor: accent }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <View style={styles.avatarFace}>
          <View style={styles.avatarEyeRow}>
            <View style={styles.avatarEye} />
            <View style={styles.avatarEye} />
          </View>
          <View style={styles.avatarBeak} />
        </View>
      )}
      {readStatus === 'READ_YET' ? <Text style={styles.avatarUnreadOverlay}>●</Text> : null}
    </View>
  );
}
