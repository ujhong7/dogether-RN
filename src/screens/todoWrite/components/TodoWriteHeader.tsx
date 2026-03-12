import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { todoWriteStyles as styles } from '../styles';

type Props = {
  todoCount: number;
};

export function TodoWriteHeader({ todoCount }: Props) {
  return (
    <>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>투두 작성</Text>
        <View style={styles.navSpacer} />
      </View>

      <Text style={styles.date}>{formatToday()}</Text>
      <Text style={styles.limit}>
        추가 가능 투두 <Text style={styles.limitCurrent}>{todoCount}</Text>
        <Text style={styles.limitTotal}>/10</Text>
      </Text>
    </>
  );
}

function formatToday() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()];
  return `${month}월 ${day}일 ${weekday}`;
}
