import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { groupJoinStyles as styles } from '../styles';

export function GroupJoinHeader() {
  return (
    <>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>그룹 가입하기</Text>
        <View style={styles.navSpacer} />
      </View>

      <Text style={styles.title}>초대코드 입력</Text>
      <Text style={styles.description}>초대받은 링크에서 초대코드를 확인할 수 있어요</Text>
    </>
  );
}
