export interface AppInfoRepository {
  checkForceUpdate(appVersion: string): Promise<boolean>;
}
