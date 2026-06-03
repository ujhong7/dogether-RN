// MARK: - Main Barrel
//
// 역할: 메인 화면 모듈의 public export를 모읍니다.

export { MainScreen } from './MainScreen';

// index.ts는 폴더의 대표 export를 모아주는 "barrel file"입니다.
// 덕분에 다른 파일에서 '../src/screens/main/MainScreen' 대신 '../src/screens/main'처럼 짧게 import할 수 있습니다.
// 이 파일은 JSX를 반환하지 않으므로 .tsx가 아니라 .ts 확장자를 사용합니다.
