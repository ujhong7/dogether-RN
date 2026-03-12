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
