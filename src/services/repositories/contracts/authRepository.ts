export interface AuthRepository {
  loginDemo(): Promise<{ userName: string; accessToken: string }>;
}
