// MARK: - App Info Repository Contract
//
// 역할: 앱 버전/강제 업데이트 확인 기능의 repository 인터페이스를 정의합니다.

export interface AppInfoRepository {
  checkForceUpdate(appVersion: string): Promise<boolean>;
}
