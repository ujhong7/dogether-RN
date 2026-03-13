import { env } from '../../config/env';
import { AppInfoRepositoryImpl } from './appInfoRepositoryImpl';
import { AuthRepositoryImpl } from './authRepositoryImpl';
import { ChallengeGroupRepositoryImpl } from './challengeGroupRepositoryImpl';
import { GroupRepositoryImpl } from './groupRepositoryImpl';
import { ReviewRepositoryImpl } from './reviewRepositoryImpl';
import { UserRepositoryImpl } from './userRepositoryImpl';
import { MockAppInfoRepository } from './mockAppInfoRepository';
import { MockChallengeGroupRepository } from './mockChallengeGroupRepository';
import { MockGroupRepository } from './mockGroupRepository';
import { MockReviewRepository } from './mockReviewRepository';
import { MockUserRepository } from './mockUserRepository';

export function createAppInfoRepository() {
  return env.useMockApi ? new MockAppInfoRepository() : new AppInfoRepositoryImpl();
}

export function createAuthRepository() {
  return new AuthRepositoryImpl();
}

export function createGroupRepository() {
  return env.useMockApi ? new MockGroupRepository() : new GroupRepositoryImpl();
}

export function createChallengeGroupRepository() {
  return env.useMockApi ? new MockChallengeGroupRepository() : new ChallengeGroupRepositoryImpl();
}

export function createUserRepository() {
  return env.useMockApi ? new MockUserRepository() : new UserRepositoryImpl();
}

export function createReviewRepository() {
  return env.useMockApi ? new MockReviewRepository() : new ReviewRepositoryImpl();
}
