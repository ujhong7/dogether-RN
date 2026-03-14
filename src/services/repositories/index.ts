import { env } from '../../config/env';
import { AppInfoRepositoryImpl } from './appInfoRepositoryImpl';
import { AuthRepositoryImpl } from './authRepositoryImpl';
import { ChallengeGroupRepositoryImpl } from './challengeGroupRepositoryImpl';
import { GroupRepositoryImpl } from './groupRepositoryImpl';
import { ReviewRepositoryImpl } from './reviewRepositoryImpl';
import { UserRepositoryImpl } from './userRepositoryImpl';
import { MockAppInfoRepository } from './mockAppInfoRepository';
import { MockAuthRepository } from './mockAuthRepository';
import { MockChallengeGroupRepository } from './mockChallengeGroupRepository';
import { MockGroupRepository } from './mockGroupRepository';
import { MockReviewRepository } from './mockReviewRepository';
import { MockUserRepository } from './mockUserRepository';

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
