// MARK: - 인증 화면 Header
//
// 역할: 인증 이미지/내용 입력 화면에서 공통으로 쓰는 상단 title과 뒤로가기 버튼을 그립니다.

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { certificationStyles as styles } from '../styles';

export function CertificationHeader() {
  return (
    <View style={styles.nav}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.navBack}>‹</Text>
      </Pressable>
      <Text style={styles.navTitle}>인증 하기</Text>
      <View style={styles.navSpacer} />
    </View>
  );
}
