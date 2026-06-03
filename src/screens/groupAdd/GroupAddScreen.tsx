// MARK: - Group Add Screen
//
// 역할: 그룹 생성 또는 초대 코드 참여 중 다음 플로우를 선택하는 화면입니다.

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { GroupEntryCards } from '../start/components/GroupEntryCards';
import { styles } from './styles';

export function GroupAddScreen() {
  return (
    <Screen>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>새 그룹 추가</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.cardsWrap}>
        <GroupEntryCards />
      </View>
    </Screen>
  );
}
