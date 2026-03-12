import { View } from 'react-native';
import { rankingStyles as styles } from '../styles';

export function RankingAvatar({ accent }: { accent: string }) {
  return (
    <View style={[styles.avatarRing, { borderColor: accent }]}>
      <View style={styles.avatarFace}>
        <View style={styles.avatarEyeRow}>
          <View style={styles.avatarEye} />
          <View style={styles.avatarEye} />
        </View>
        <View style={styles.avatarBeak} />
      </View>
    </View>
  );
}
