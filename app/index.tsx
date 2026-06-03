import { Redirect } from 'expo-router';

// MARK: - Route: /
//
// index.tsx는 해당 폴더의 기본 route를 뜻합니다.
// app/index.tsx는 앱의 루트 경로("/")이고, 웹의 index.html 또는 iOS의 첫 진입 화면과 비슷합니다.
export default function Index() {
  // "/"로 들어오면 바로 스플래시 화면으로 보냅니다.
  // Expo Router의 Redirect는 화면을 렌더링하지 않고 route만 교체하는 컴포넌트입니다.
  // import { Redirect } from 'expo-router'는 expo-router 라이브러리에서 Redirect라는 컴포넌트만 꺼내 쓰겠다는 뜻입니다.
  return <Redirect href="/splash" />;
}
