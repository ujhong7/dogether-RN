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
