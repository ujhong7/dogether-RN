import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// package.json의 main이 "expo-router/entry"라서 실제 앱 진입점은 app/_layout.tsx입니다.
// 이 파일은 Expo 기본 템플릿의 흔적으로 남아 있으며, Expo Router를 사용할 때는 보통 직접 실행되지 않습니다.
export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
