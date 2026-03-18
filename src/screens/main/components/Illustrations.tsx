import { StyleSheet, View } from 'react-native';

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

const styles = StyleSheet.create({
  todayFigure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  todayChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emptyFigure: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyEye: {
    position: 'absolute',
    top: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyMouth: {
    marginTop: 20,
    width: 30,
    height: 14,
    borderBottomWidth: 3,
    borderRadius: 10,
  },
  doneFigure: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  doneBlob: {
    width: 88,
    height: 88,
    borderRadius: 32,
    backgroundColor: '#5B9DF0',
  },
});
