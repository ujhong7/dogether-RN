// MARK: - Route: /main
//
// 역할: 메인 화면 route와 src/screens 구현을 연결합니다.

import { MainScreen } from '../src/screens/main';

// app/main.tsx가 존재하기 때문에 Expo Router는 "/main" 화면을 만들 수 있습니다.
// 이 파일에는 화면 구현을 길게 쓰지 않고, src/screens/main에 있는 실제 화면을 연결만 합니다.
// 이렇게 나누면 라우팅(app 폴더)과 화면 구현(src/screens 폴더)을 분리해서 관리할 수 있습니다.
export default MainScreen;
