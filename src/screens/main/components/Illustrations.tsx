import { View } from 'react-native';
import { mainStyles as styles } from '../styles';

export function EmptyIllustration({ tint = '#7F89A8' }: { tint?: string }) {
  return (
    <View style={styles.emptyFigure}>
      <View style={[styles.emptyCircle, { borderColor: tint }]}>
        <View style={[styles.emptyEye, { backgroundColor: tint, left: 30 }]} />
        <View style={[styles.emptyEye, { backgroundColor: tint, right: 30 }]} />
        <View style={[styles.emptyMouth, { borderColor: tint }]} />
      </View>
    </View>
  );
}

export function DoneIllustration() {
  return (
    <View style={styles.doneFigure}>
      <View style={styles.doneBlob} />
      <View style={styles.doneBlob} />
    </View>
  );
}

export function TodayIllustration() {
  return (
    <View style={styles.todayFigure}>
      <View style={[styles.todayChip, { backgroundColor: '#E8C95F' }]} />
      <View style={[styles.todayChip, { backgroundColor: '#5B9DF0', width: 72, height: 72 }]} />
      <View style={[styles.todayChip, { backgroundColor: '#FF4F7A' }]} />
    </View>
  );
}
