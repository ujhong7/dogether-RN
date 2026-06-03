import { env } from '../../config/env';
import { AppInfoRepositoryImpl } from './impl/appInfoRepositoryImpl';
import { AuthRepositoryImpl } from './impl/authRepositoryImpl';
import { ChallengeGroupRepositoryImpl } from './impl/challengeGroupRepositoryImpl';
import { GroupRepositoryImpl } from './impl/groupRepositoryImpl';
import { ReviewRepositoryImpl } from './impl/reviewRepositoryImpl';
import { UserRepositoryImpl } from './impl/userRepositoryImpl';
import { MockAppInfoRepository } from './mock/mockAppInfoRepository';
import { MockAuthRepository } from './mock/mockAuthRepository';
import { MockChallengeGroupRepository } from './mock/mockChallengeGroupRepository';
import { MockGroupRepository } from './mock/mockGroupRepository';
import { MockReviewRepository } from './mock/mockReviewRepository';
import { MockUserRepository } from './mock/mockUserRepository';

// MARK: - Repository Factory
//
// Repository factory 모음입니다.
// 화면/UseCase는 "진짜 API인지 목 데이터인지"를 몰라도 되고, env 값만 바꾸면 구현체가 교체됩니다.
// Swift로 비유하면 protocol 타입에 실제 구현체 또는 mock 구현체를 주입하는 DI 지점입니다.
export function createAppInfoRepository() {
  return env.useMockAppInfo ? new MockAppInfoRepository() : new AppInfoRepositoryImpl();
}

export function createAuthRepository() {
  return env.useMockAuth ? new MockAuthRepository() : new AuthRepositoryImpl();
}

export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}

export function createChallengeGroupRepository() {
  return env.useMockChallengeGroups
    ? new MockChallengeGroupRepository()
    : new ChallengeGroupRepositoryImpl();
}

export function createUserRepository() {
  return env.useMockUser ? new MockUserRepository() : new UserRepositoryImpl();
}

export function createReviewRepository() {
  return env.useMockReview ? new MockReviewRepository() : new ReviewRepositoryImpl();
}
