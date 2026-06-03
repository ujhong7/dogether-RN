// MARK: - Update Screen
//
// 역할: 앱 강제 업데이트가 필요할 때 안내 문구와 이동 action을 보여줍니다.

import { Linking, Pressable, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { env } from '../../config/env';
import { styles } from './styles';

export function UpdateScreen() {
  return (
    <Screen>
      <Text style={styles.title}>업데이트가 필요해요</Text>
      <Text style={styles.description}>최신 버전에서만 안정적으로 서비스를 이용할 수 있어요.</Text>
      <Pressable style={styles.button} onPress={() => Linking.openURL(env.appStoreUrl)}>
        <Text style={styles.buttonText}>스토어 열기</Text>
      </Pressable>
    </Screen>
  );
}
