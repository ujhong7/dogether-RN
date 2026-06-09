# Mock API 전환 읽는 법

이 문서는 Dogether RN 프로젝트에서 mock 데이터와 실제 API 구현이 어떻게 전환되는지 읽기 위한 문서입니다.

처음에는 "서버를 쓰는 건지, mock을 쓰는 건지"가 헷갈릴 수 있습니다. 하지만 이 프로젝트는 전환 지점이 비교적 선명합니다.

핵심은 세 파일입니다.

```txt
package.json
src/config/env.ts
src/services/repositories/index.ts
```

한 줄로 말하면:

```txt
실행 스크립트가 환경 변수를 넣고,
env.ts가 환경 변수를 앱 설정으로 정리하고,
repository factory가 env 값을 보고 Mock 또는 API 구현체를 고른다.
```

---

## 1. 이 문서의 목표

이 문서를 읽고 나면 다음을 알 수 있어야 합니다.

```txt
지금 앱이 mock인지 API인지 확인하는 법
mock/dev/prod 실행 스크립트 차이
EXPO_PUBLIC_USE_MOCK_API의 의미
도메인별 mock 스위치의 의미
Repository factory가 구현체를 바꾸는 방식
MockRepository와 RepositoryImpl의 차이
mock 데이터가 어디에 저장되는지
특정 기능만 mock으로 남기는 방법
```

---

## 2. 관련 파일 한눈에 보기

mock/API 전환과 직접 관련된 파일입니다.

```txt
package.json
.env.example
src/config/env.ts
src/services/repositories/index.ts
```

각 도메인별 repository 파일은 다음 구조를 따릅니다.

```txt
src/services/repositories/contracts/
  authRepository.ts
  groupRepository.ts
  challengeGroupRepository.ts
  userRepository.ts
  reviewRepository.ts
  appInfoRepository.ts

src/services/repositories/impl/
  authRepositoryImpl.ts
  groupRepositoryImpl.ts
  challengeGroupRepositoryImpl.ts
  userRepositoryImpl.ts
  reviewRepositoryImpl.ts
  appInfoRepositoryImpl.ts

src/services/repositories/mock/
  mockAuthRepository.ts
  mockGroupRepository.ts
  mockChallengeGroupRepository.ts
  mockUserRepository.ts
  mockReviewRepository.ts
  mockAppInfoRepository.ts
```

처음 읽을 때는 아래 순서가 좋습니다.

```txt
package.json
-> src/config/env.ts
-> src/services/repositories/index.ts
-> contracts/groupRepository.ts
-> impl/groupRepositoryImpl.ts
-> mock/mockGroupRepository.ts
```

---

## 3. 전체 흐름

mock/API 전환 흐름은 이렇게 생겼습니다.

```txt
npm run start:mock 또는 npm run start:dev
  |
  v
환경 변수 주입
  |
  v
src/config/env.ts
  |
  v
env.useMockGroups / env.useMockAuth / ...
  |
  v
src/services/repositories/index.ts
  |
  v
MockRepository 또는 RepositoryImpl 생성
  |
  v
UseCase
  |
  v
Hook / Screen
```

화면 쪽 코드는 보통 mock인지 API인지 모릅니다.

예:

```ts
const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
```

여기서 `createGroupRepository()`가 mock/API 중 하나를 골라줍니다.

---

## 4. package.json에서 시작하기

파일:

```txt
package.json
```

관련 script:

```json
"start:mock": "APP_ENV=mock EXPO_PUBLIC_APP_ENV=mock EXPO_PUBLIC_API_BASE_URL=https://api-dev.dogether.site EXPO_PUBLIC_USE_MOCK_API=true EXPO_PUBLIC_APP_VERSION=$npm_package_version EXPO_PUBLIC_APP_STORE_URL=https://apps.apple.com expo start",
"start:dev": "APP_ENV=dev EXPO_PUBLIC_APP_ENV=dev EXPO_PUBLIC_API_BASE_URL=https://api-dev.dogether.site EXPO_PUBLIC_USE_MOCK_API=false EXPO_PUBLIC_USE_MOCK_APP_INFO=true EXPO_PUBLIC_USE_MOCK_AUTH=false EXPO_PUBLIC_USE_MOCK_GROUPS=false EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS=false EXPO_PUBLIC_USE_MOCK_USER=false EXPO_PUBLIC_USE_MOCK_REVIEW=false EXPO_PUBLIC_APP_VERSION=$npm_package_version EXPO_PUBLIC_APP_STORE_URL=https://apps.apple.com expo start",
"start:prod": "APP_ENV=prod EXPO_PUBLIC_APP_ENV=prod EXPO_PUBLIC_API_BASE_URL=https://api.dogether.site EXPO_PUBLIC_USE_MOCK_API=false EXPO_PUBLIC_APP_VERSION=$npm_package_version EXPO_PUBLIC_APP_STORE_URL=https://apps.apple.com expo start"
```

실행 명령은 세 가지 축으로 나뉩니다.

| 명령 | 목적 |
| --- | --- |
| `npm run start:mock` | 서버 없이 mock 데이터로 앱 확인 |
| `npm run start:dev` | dev 서버 API로 앱 확인 |
| `npm run start:prod` | production API 주소로 앱 확인 |

네이티브 빌드 실행도 같은 패턴입니다.

```txt
npm run ios:mock
npm run ios:dev
npm run ios:prod
npm run android:mock
npm run android:dev
npm run android:prod
```

---

## 5. start:mock 읽기

`start:mock`의 핵심은 이것입니다.

```txt
EXPO_PUBLIC_APP_ENV=mock
EXPO_PUBLIC_USE_MOCK_API=true
```

의미:

```txt
앱 환경은 mock이다.
기본적으로 모든 repository는 mock 구현체를 사용한다.
```

`EXPO_PUBLIC_API_BASE_URL`도 같이 들어가지만, 모든 repository가 mock이면 대부분의 도메인 API 호출은 실제 서버로 가지 않습니다.

다만 API base URL 값은 env 객체에 필요하므로 여전히 주입됩니다.

---

## 6. start:dev 읽기

`start:dev`의 핵심은 이것입니다.

```txt
EXPO_PUBLIC_APP_ENV=dev
EXPO_PUBLIC_API_BASE_URL=https://api-dev.dogether.site
EXPO_PUBLIC_USE_MOCK_API=false
```

그리고 도메인별 값이 붙습니다.

```txt
EXPO_PUBLIC_USE_MOCK_APP_INFO=true
EXPO_PUBLIC_USE_MOCK_AUTH=false
EXPO_PUBLIC_USE_MOCK_GROUPS=false
EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS=false
EXPO_PUBLIC_USE_MOCK_USER=false
EXPO_PUBLIC_USE_MOCK_REVIEW=false
```

즉 dev 실행은 기본적으로 실제 dev API를 씁니다.

다만 현재 스크립트에서는 `APP_INFO`만 mock으로 둡니다.

왜 그럴 수 있을까요?

```txt
강제 업데이트 체크 같은 앱 정보 API는 개발 중에는 항상 false로 보고 싶을 수 있다.
```

그래서 `EXPO_PUBLIC_USE_MOCK_APP_INFO=true`로 남겨둔 구조입니다.

---

## 7. start:prod 읽기

`start:prod`의 핵심은 이것입니다.

```txt
EXPO_PUBLIC_APP_ENV=prod
EXPO_PUBLIC_API_BASE_URL=https://api.dogether.site
EXPO_PUBLIC_USE_MOCK_API=false
```

즉:

```txt
production API 주소를 사용하고,
기본 mock API는 끈다.
```

도메인별 mock 값은 따로 넣지 않습니다.

그러면 `env.ts`에서 `useMockApi`의 기본값인 `false`를 따라갑니다.

---

## 8. Expo 환경 변수 규칙

파일:

```txt
src/config/env.ts
```

주석에 중요한 말이 있습니다.

```ts
// EXPO_PUBLIC_ 접두사가 붙은 값만 JS bundle에서 읽을 수 있다는 점이 Expo의 중요한 규칙입니다.
```

즉 앱 JS 코드에서 읽을 수 있는 환경 변수는 보통 이런 형태입니다.

```txt
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_API_BASE_URL
EXPO_PUBLIC_USE_MOCK_API
```

반대로 `APP_ENV`만 넣으면 JS 코드에서 직접 쓰기 어렵습니다.

그래서 script에는 둘 다 들어가 있습니다.

```txt
APP_ENV=mock
EXPO_PUBLIC_APP_ENV=mock
```

이 문서에서는 JS 앱 내부 기준으로 `EXPO_PUBLIC_*`를 중심으로 보면 됩니다.

---

## 9. .env.example 읽기

파일:

```txt
.env.example
```

내용:

```txt
EXPO_PUBLIC_APP_ENV=mock
EXPO_PUBLIC_API_BASE_URL=https://api-dev.dogether.site
EXPO_PUBLIC_USE_MOCK_API=true
EXPO_PUBLIC_USE_MOCK_APP_INFO=true
EXPO_PUBLIC_USE_MOCK_AUTH=true
EXPO_PUBLIC_USE_MOCK_GROUPS=true
EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS=true
EXPO_PUBLIC_USE_MOCK_USER=true
EXPO_PUBLIC_USE_MOCK_REVIEW=true
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_STORE_URL=https://apps.apple.com
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=
EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=false
```

이 파일은 "어떤 환경 변수가 필요한지" 보여주는 예시입니다.

처음 학습할 때는 여기서 전체 스위치 목록을 확인하면 좋습니다.

---

## 10. env.ts의 역할

파일:

```txt
src/config/env.ts
```

이 파일은 환경 변수를 앱에서 쓰기 좋은 객체로 정리합니다.

결과물은 이것입니다.

```ts
export const env: RuntimeEnv = {
  appEnv,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? defaults.apiBaseUrl,
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0',
  appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL ?? defaults.appStoreUrl,
  kakaoNativeAppKey,
  useMockApi,
  useMockAppInfo,
  useMockAuth,
  useMockGroups,
  useMockChallengeGroups,
  useMockUser,
  useMockReview,
  isMock: appEnv === 'mock',
  isDevelopment: appEnv === 'dev',
  isProduction: appEnv === 'prod',
  hasKakaoNativeAppKey: Boolean(kakaoNativeAppKey),
  enableAppleSignIn,
};
```

앱의 다른 파일은 `process.env...`를 직접 읽기보다 이 `env` 객체를 가져다 씁니다.

예:

```ts
import { env } from '../config/env';
```

---

## 11. AppEnv 타입

코드:

```ts
type AppEnv = 'mock' | 'dev' | 'prod';
```

앱 환경은 세 가지입니다.

| 값 | 의미 |
| --- | --- |
| `mock` | 서버 없이 mock 중심 실행 |
| `dev` | 개발 서버 API 중심 실행 |
| `prod` | 운영 서버 API 중심 실행 |

이 값은 `EXPO_PUBLIC_APP_ENV`에서 옵니다.

---

## 12. normalizeAppEnv 읽기

코드:

```ts
function normalizeAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'prod') {
    return value;
  }

  return 'mock';
}
```

읽는 법:

```txt
value가 dev면 dev
value가 prod면 prod
그 외에는 mock
```

즉 환경 변수를 넣지 않거나 이상한 값을 넣으면 기본적으로 `mock`으로 갑니다.

초보자에게는 이게 안전합니다.

```txt
설정이 비어 있으면 실서버를 때리는 대신 mock으로 실행된다.
```

---

## 13. DEFAULT_ENV_BY_APP_ENV 읽기

코드:

```ts
const DEFAULT_ENV_BY_APP_ENV: Record<AppEnv, RuntimeEnvDefaults> = {
  mock: {
    apiBaseUrl: 'https://api-dev.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: true,
  },
  dev: {
    apiBaseUrl: 'https://api-dev.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: false,
  },
  prod: {
    apiBaseUrl: 'https://api.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: false,
  },
};
```

이 객체는 appEnv별 기본값입니다.

| appEnv | 기본 API URL | 기본 mock 여부 |
| --- | --- | --- |
| `mock` | dev API URL | `true` |
| `dev` | dev API URL | `false` |
| `prod` | prod API URL | `false` |

`mock`에서도 apiBaseUrl이 dev URL인 이유는, 일부 기능만 실제 API로 켜는 부분 mock 전환이 가능하기 때문입니다.

---

## 14. parseBoolean 읽기

환경 변수는 문자열입니다.

즉:

```txt
EXPO_PUBLIC_USE_MOCK_API=true
```

라고 넣어도 앱 코드에서는 처음에 문자열 `"true"`입니다.

그래서 `env.ts`에는 변환 함수가 있습니다.

```ts
function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}
```

읽는 법:

```txt
"true"면 true
"false"면 false
값이 없거나 이상하면 fallback
```

---

## 15. useMockApi와 도메인별 스위치

코드:

```ts
const useMockApi = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_API, defaults.useMockApi);
const useMockAppInfo = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_APP_INFO, useMockApi);
const useMockAuth = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_AUTH, useMockApi);
const useMockGroups = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_GROUPS, useMockApi);
const useMockChallengeGroups = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS,
  useMockApi,
);
const useMockUser = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_USER, useMockApi);
const useMockReview = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_REVIEW, useMockApi);
```

여기가 가장 중요합니다.

`useMockApi`는 전체 기본값입니다.

도메인별 스위치는 값이 없으면 `useMockApi`를 따라갑니다.

예:

```txt
EXPO_PUBLIC_USE_MOCK_API=true
EXPO_PUBLIC_USE_MOCK_AUTH 값 없음
```

그러면:

```txt
useMockAuth = true
```

반대로:

```txt
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_USE_MOCK_APP_INFO=true
```

그러면:

```txt
useMockAuth = false
useMockGroups = false
useMockAppInfo = true
```

---

## 16. 도메인별 mock 스위치 표

현재 repository factory는 다음 스위치를 봅니다.

| env 값 | 선택되는 repository |
| --- | --- |
| `useMockAppInfo` | 앱 버전/강제 업데이트 |
| `useMockAuth` | 로그인/토큰 |
| `useMockGroups` | 그룹 생성/참여/목록/탈퇴 |
| `useMockChallengeGroups` | 투두/챌린지/인증 |
| `useMockUser` | 랭킹/프로필/통계/인증 목록 |
| `useMockReview` | 리뷰 대기 목록/리뷰 제출 |

이렇게 도메인별로 나누면 다음이 가능합니다.

```txt
로그인은 실제 API로 테스트
그룹/투두는 mock으로 테스트
앱 업데이트 체크만 mock으로 유지
```

학습이나 개발 중에는 꽤 유용한 구조입니다.

---

## 17. repository factory가 진짜 전환 지점이다

파일:

```txt
src/services/repositories/index.ts
```

코드:

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

이 한 줄이 핵심입니다.

읽는 법:

```txt
env.useMockGroups가 true면 MockGroupRepository
false면 GroupRepositoryImpl
```

이 패턴이 모든 repository에 반복됩니다.

---

## 18. factory 전체 읽기

파일:

```txt
src/services/repositories/index.ts
```

코드:

```ts
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
```

이 파일은 iOS로 치면 DI 조립 지점에 가깝습니다.

```txt
protocol 타입을 쓰는 UseCase에
실제 API 구현체를 넣을지
Mock 구현체를 넣을지 결정하는 곳
```

---

## 19. 화면은 mock 여부를 모른다

예를 들어 그룹 목록 query를 보면:

```ts
const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
```

화면/hook은 이렇게만 말합니다.

```txt
그룹 repository 하나 주세요.
```

그 repository가 mock인지 실제 API인지는 factory가 결정합니다.

이 구조의 장점:

```txt
화면 코드는 mock/API 분기문을 몰라도 된다.
데이터 출처가 바뀌어도 화면 코드는 그대로 둔다.
```

---

## 20. contract가 중간 약속이다

파일:

```txt
src/services/repositories/contracts/groupRepository.ts
```

코드:

```ts
export interface GroupRepository {
  checkParticipating(): Promise<boolean>;
  getGroups(): Promise<Group[]>;
  createGroup(input: CreateGroupInput): Promise<Group>;
  joinGroupByCode(code: string): Promise<JoinGroupResult>;
  saveLastSelectedGroup(groupId: number): Promise<void>;
  leaveGroup(groupId: number): Promise<Group[]>;
}
```

이 interface가 "약속"입니다.

`GroupRepositoryImpl`도 이 약속을 지켜야 합니다.

`MockGroupRepository`도 이 약속을 지켜야 합니다.

그래서 UseCase는 둘 중 어떤 구현체가 들어와도 같은 방식으로 호출할 수 있습니다.

---

## 21. API 구현체 읽기

파일:

```txt
src/services/repositories/impl/groupRepositoryImpl.ts
```

API 구현체는 실제 서버를 호출합니다.

예:

```ts
async getGroups(): Promise<Group[]> {
  try {
    const res = await apiClient.get<ApiEnvelope<{ joiningChallengeGroups: any[] }>>(endpoints.groups.my);
    const groups = (res.data.data?.joiningChallengeGroups ?? []).map(mapGroup);
    if (groups.length === 0) {
      return [];
    }
    return groups;
  } catch (error) {
    throw toAppError(error);
  }
}
```

읽는 흐름:

```txt
apiClient로 서버 요청
-> ApiEnvelope 응답
-> 서버 data 꺼내기
-> mapGroup으로 앱 모델 변환
-> 에러는 toAppError로 변환
```

---

## 22. Mock 구현체 읽기

파일:

```txt
src/services/repositories/mock/mockGroupRepository.ts
```

Mock 구현체는 서버 요청을 하지 않습니다.

예:

```ts
export class MockGroupRepository implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    return hasMockJoinedGroups();
  }

  async getGroups(): Promise<Group[]> {
    return getMockJoinedGroups();
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    return createMockGroup(input);
  }

  async joinGroupByCode(code: string): Promise<JoinGroupResult> {
    return joinMockGroupByCode(code);
  }
}
```

읽는 흐름:

```txt
mock data helper 호출
-> MMKV 또는 seed 데이터에서 값 가져오기
-> contract가 요구하는 타입으로 반환
```

---

## 23. API 구현체와 Mock 구현체 비교

같은 기능을 비교해 봅시다.

| 기능 | API 구현체 | Mock 구현체 |
| --- | --- | --- |
| 그룹 목록 | `apiClient.get(endpoints.groups.my)` | `getMockJoinedGroups()` |
| 그룹 생성 | `apiClient.post(endpoints.groups.create, ...)` | `createMockGroup(input)` |
| 그룹 참여 | `apiClient.post(endpoints.groups.join, ...)` | `joinMockGroupByCode(code)` |
| 그룹 탈퇴 | `apiClient.delete(endpoints.groups.leave(groupId))` | `leaveMockGroup(groupId)` |

겉으로는 둘 다 `GroupRepository`입니다.

안쪽 구현만 다릅니다.

---

## 24. 왜 같은 interface를 구현할까?

UseCase가 의존하는 것은 구체 class가 아니라 interface입니다.

```ts
constructor(private readonly groupRepository: GroupRepository) {}
```

그래서 UseCase는 이렇게만 호출합니다.

```ts
return this.groupRepository.getGroups();
```

이때 `groupRepository`가 실제 API인지 mock인지는 관심 없습니다.

이 구조 덕분에 다음이 가능합니다.

```txt
화면 코드 변경 없이 mock/API 전환
서버 API가 준비되기 전에도 화면 개발
특정 도메인만 mock으로 유지
```

---

## 25. UseCase는 전환을 모른다

파일:

```txt
src/services/usecases/groupUseCase.ts
```

UseCase는 repository interface만 압니다.

```ts
export class GroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  getGroups() {
    return this.groupRepository.getGroups();
  }
}
```

이 말은:

```txt
mock/API 선택은 UseCase 바깥에서 이미 끝난다.
UseCase는 받은 repository를 그냥 사용한다.
```

즉 전환 책임은 `repositories/index.ts`에 있습니다.

---

## 26. Query/Hook에서 repository가 만들어지는 방식

예:

```ts
const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
```

여기서 실행 순서는:

```txt
createGroupRepository()
-> env.useMockGroups 확인
-> MockGroupRepository 또는 GroupRepositoryImpl 생성
-> GroupUseCase에 주입
-> queryFn/mutationFn에서 useCase 호출
```

`useMemo`를 쓰는 이유는 렌더링마다 UseCase를 새로 만들지 않기 위해서입니다.

---

## 27. appInfo만 mock인 dev 모드

현재 `start:dev`는 이런 조합입니다.

```txt
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_USE_MOCK_APP_INFO=true
EXPO_PUBLIC_USE_MOCK_AUTH=false
EXPO_PUBLIC_USE_MOCK_GROUPS=false
EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS=false
EXPO_PUBLIC_USE_MOCK_USER=false
EXPO_PUBLIC_USE_MOCK_REVIEW=false
```

결과:

| repository | 구현체 |
| --- | --- |
| AppInfo | Mock |
| Auth | API |
| Groups | API |
| ChallengeGroups | API |
| User | API |
| Review | API |

즉 dev 서버를 쓰되, 앱 업데이트 체크만 mock으로 처리합니다.

---

## 28. 전체 mock 모드

`start:mock`에서는:

```txt
EXPO_PUBLIC_USE_MOCK_API=true
```

도메인별 값이 따로 없으면 모두 `useMockApi`를 따라갑니다.

결과:

| repository | 구현체 |
| --- | --- |
| AppInfo | Mock |
| Auth | Mock |
| Groups | Mock |
| ChallengeGroups | Mock |
| User | Mock |
| Review | Mock |

이 모드에서는 서버 없이 대부분의 앱 흐름을 볼 수 있습니다.

---

## 29. 전체 API 모드

`start:prod`에서는:

```txt
EXPO_PUBLIC_USE_MOCK_API=false
```

도메인별 값도 따로 없으므로 모두 false입니다.

결과:

| repository | 구현체 |
| --- | --- |
| AppInfo | API |
| Auth | API |
| Groups | API |
| ChallengeGroups | API |
| User | API |
| Review | API |

이때 API 주소는:

```txt
https://api.dogether.site
```

입니다.

---

## 30. 부분 mock 모드 예시

부분 mock은 이런 식입니다.

```txt
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_USE_MOCK_AUTH=false
EXPO_PUBLIC_USE_MOCK_GROUPS=true
EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS=true
EXPO_PUBLIC_USE_MOCK_USER=true
EXPO_PUBLIC_USE_MOCK_REVIEW=true
```

의미:

```txt
로그인은 실제 API
그룹/투두/유저/리뷰는 mock
```

반대로:

```txt
EXPO_PUBLIC_USE_MOCK_API=true
EXPO_PUBLIC_USE_MOCK_AUTH=false
```

의미:

```txt
기본은 전부 mock
auth만 실제 API
```

도메인별 스위치가 전체 스위치를 덮어쓸 수 있다는 점이 핵심입니다.

---

## 31. 실제 API 요청은 어디로 가나?

파일:

```txt
src/services/api/client.ts
```

API 구현체는 `apiClient`를 씁니다.

```ts
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

`env.apiBaseUrl`은 `env.ts`에서 정해집니다.

```txt
mock/dev 기본: https://api-dev.dogether.site
prod 기본: https://api.dogether.site
```

실제 API repository가 선택되면 이 baseURL로 요청이 나갑니다.

---

## 32. MockRepository는 apiClient를 쓰지 않는다

mock 구현체는 보통 `apiClient`를 import하지 않습니다.

예:

```ts
import { createMockGroup, getMockJoinedGroups } from './data/mockGroupData';
```

그리고 mock data helper를 호출합니다.

```ts
async getGroups(): Promise<Group[]> {
  return getMockJoinedGroups();
}
```

즉:

```txt
MockRepository
-> mock data helper
-> seed data 또는 MMKV
```

입니다.

서버 요청이 나가지 않습니다.

---

## 33. mock 데이터 저장 위치

mock 데이터는 일부 seed 데이터와 MMKV를 같이 씁니다.

파일:

```txt
src/services/repositories/mock/data/mockGroupData.ts
src/services/repositories/mock/data/mockTodoData.ts
src/services/repositories/mock/data/mockReviewData.ts
```

대표 key:

| 파일 | key |
| --- | --- |
| `mockGroupData.ts` | `mockJoinedGroups`, `mockNextGroupId` |
| `mockTodoData.ts` | `mockTodosByGroupDate` |
| `mockReviewData.ts` | `mockPendingReviews` |

mock 데이터도 앱을 재실행했을 때 유지될 수 있습니다.

이유는 MMKV에 저장하기 때문입니다.

---

## 34. mock seed 데이터와 저장 데이터

mock 파일에는 보통 두 종류의 데이터가 있습니다.

```txt
seed 데이터
-> 앱을 처음 실행해도 테스트할 수 있게 준비된 기본 데이터

저장 데이터
-> 사용자가 mock 모드에서 생성/수정한 데이터
```

예를 들어 `mockGroupData.ts`에는 초대 코드로 참여할 수 있는 seed 그룹이 있습니다.

```ts
const seededJoinableGroups: Group[] = [
  ...
];
```

사용자가 그룹을 생성하면:

```ts
writeGroups([group, ...readGroups()]);
```

로 MMKV에 저장됩니다.

---

## 35. mock 데이터 리셋

파일:

```txt
src/services/repositories/mock/resetMockAppData.ts
```

코드:

```ts
import { resetMockJoinedGroups } from './data/mockGroupData';
import { resetMockPendingReviews } from './data/mockReviewData';
import { resetMockTodos } from './data/mockTodoData';

export function resetMockAppData() {
  resetMockJoinedGroups();
  resetMockPendingReviews();
  resetMockTodos();
}
```

이 함수는 mock 데이터 저장값을 지웁니다.

현재 설정 화면의 회원 탈퇴 흐름에서 호출됩니다.

파일:

```txt
src/hooks/useSettingsScreen.ts
```

코드:

```ts
const handleWithdraw = () => {
  resetMockAppData();
  logout();
  moveToOnboarding();
};
```

즉 mock 모드에서 만든 그룹/투두/리뷰 데이터가 꼬이면 이 흐름을 보면 됩니다.

---

## 36. mock auth 흐름

파일:

```txt
src/hooks/useOnboarding.ts
```

이 파일에는 `env.useMockAuth` 분기가 있습니다.

예:

```ts
if (env.useMockAuth) {
  setIsAppleLoginAvailable(env.enableAppleSignIn);
  setIsKakaoLoginAvailable(true);
  return;
}
```

Kakao 로그인도 mock이면 native SDK를 거치지 않습니다.

```ts
if (env.useMockAuth) {
  return authUseCase.loginWithKakao({
    providerId: 'mock-kakao-user-' + Date.now(),
    name: 'Kakao User',
  });
}
```

Apple 로그인도 비슷합니다.

```ts
if (env.useMockAuth) {
  return authUseCase.loginWithApple({
    providerId: 'mock-apple-token-' + Date.now(),
    name: 'Apple User',
    authorizationCode: 'mock-authorization-code-' + Date.now(),
    appleUserIdentifier: 'mock-apple-user-' + Date.now(),
  });
}
```

즉 auth는 repository factory뿐 아니라 native SDK 호출 전에도 mock 분기가 있습니다.

---

## 37. 왜 auth는 hook에도 mock 분기가 있을까?

일반 repository는 데이터 요청만 바꾸면 됩니다.

하지만 Kakao/Apple 로그인은 서버 요청 전에 native SDK를 먼저 호출합니다.

실제 auth 흐름:

```txt
Kakao SDK 로그인
-> Kakao profile 조회
-> AuthUseCase
-> AuthRepositoryImpl
-> 서버 로그인
```

mock auth 흐름:

```txt
mock providerId/name 생성
-> AuthUseCase
-> MockAuthRepository
-> mock session 반환
```

즉 native SDK 단계 자체를 건너뛰어야 하므로 hook에도 `env.useMockAuth` 분기가 있습니다.

---

## 38. MockAuthRepository는 무엇을 반환하나?

파일:

```txt
src/services/repositories/mock/mockAuthRepository.ts
```

검색 결과 기준으로 mock auth는 이런 형태의 토큰을 만듭니다.

```txt
accessToken: "mock-token-" + Date.now()
refreshToken: "mock-refresh-" + Date.now()
```

이 값도 로그인 성공 후 `sessionStore.login()`을 타면 MMKV에 저장됩니다.

즉 mock 로그인도 실제 로그인과 같은 세션 저장 흐름을 탑니다.

---

## 39. appInfo mock 흐름

파일:

```txt
src/services/repositories/mock/mockAppInfoRepository.ts
```

코드:

```ts
export class MockAppInfoRepository implements AppInfoRepository {
  async checkForceUpdate(): Promise<boolean> {
    return false;
  }
}
```

강제 업데이트가 필요하지 않다고 항상 반환합니다.

반면 실제 구현체는:

```ts
const res = await apiClient.get<ApiEnvelope<{ forceUpdateRequired: boolean }>>(
  endpoints.appInfo.checkUpdate,
  {
    params: { 'app-version': appVersion },
  },
);
```

서버에 앱 버전을 보내 강제 업데이트 여부를 확인합니다.

dev에서 appInfo만 mock으로 둔 이유를 여기서 이해할 수 있습니다.

---

## 40. GroupRepository 전환 예시

`env.useMockGroups = true`일 때:

```txt
createGroupRepository()
-> new MockGroupRepository()
-> getGroups()
-> getMockJoinedGroups()
-> MMKV/seed mock data
```

`env.useMockGroups = false`일 때:

```txt
createGroupRepository()
-> new GroupRepositoryImpl()
-> getGroups()
-> apiClient.get(endpoints.groups.my)
-> 서버 응답
-> mapGroup()
```

화면은 둘 다 이렇게만 부릅니다.

```ts
groupUseCase.getGroups()
```

---

## 41. ChallengeGroupRepository 전환 예시

투두/인증 쪽은 `useMockChallengeGroups`가 담당합니다.

`true`일 때:

```txt
MockChallengeGroupRepository
-> getMockTodos / saveMockTodos / setMockTodos
-> MMKV mock todos
```

`false`일 때:

```txt
ChallengeGroupRepositoryImpl
-> apiClient
-> challenge group endpoints
-> 서버 응답 mapping
```

메인 화면의 내 투두, 투두 작성, 인증 제출 흐름이 이 스위치의 영향을 받습니다.

---

## 42. UserRepository 전환 예시

`useMockUser`는 다음 화면들에 영향을 줍니다.

```txt
랭킹
프로필
통계
인증 목록
```

`true`이면:

```txt
MockUserRepository
-> static mockRanking/mockProfile
-> mock todo entries 기반 통계/인증 목록
```

`false`이면:

```txt
UserRepositoryImpl
-> apiClient
-> 서버 API
```

---

## 43. ReviewRepository 전환 예시

`useMockReview`는 리뷰 화면에 영향을 줍니다.

`true`이면:

```txt
MockReviewRepository
-> readPendingReviews()
-> submitMockReview()
```

`false`이면:

```txt
ReviewRepositoryImpl
-> apiClient
-> 서버 API
```

앱 시작 흐름에서도 pending review가 있는지 확인하기 때문에, `useMockReview`는 첫 화면 결정에도 영향을 줄 수 있습니다.

---

## 44. 앱 시작 흐름과 mock 스위치

파일:

```txt
src/queries/useLaunchFlowQuery.ts
```

앱 시작 판단에는 여러 repository가 들어갑니다.

```txt
createAppInfoRepository()
createGroupRepository()
createReviewRepository()
```

즉 첫 화면 결정도 mock/API 스위치 영향을 받습니다.

예:

```txt
useMockGroups = true
-> 참여 그룹 여부를 mock group data 기준으로 판단

useMockReview = true
-> 대기 리뷰 여부를 mock review data 기준으로 판단

useMockAppInfo = true
-> 강제 업데이트는 항상 false
```

이걸 모르고 보면 "왜 mock 모드에서 start로 가지?" 같은 상황이 헷갈릴 수 있습니다.

---

## 45. mock에서 start 화면으로 가는 이유

mock 모드에서 로그인 후 앱이 start 화면으로 갈 수 있습니다.

가능한 이유:

```txt
MockGroupRepository.checkParticipating()
-> hasMockJoinedGroups()
-> mockJoinedGroups가 비어 있음
-> 참여 그룹 없음
-> start 화면
```

그룹을 생성하거나 초대 코드로 참여하면 mock group data에 저장됩니다.

다음부터는 참여 그룹이 있다고 판단할 수 있습니다.

---

## 46. mock 초대 코드

`mockGroupData.ts`에는 초대 코드 테스트용 seed 그룹이 있습니다.

예:

```txt
12345678
87654321
FULL0001
```

각 코드는 다른 상황을 만들 수 있습니다.

| 코드 | 의미 |
| --- | --- |
| `12345678` | 참여 가능한 seed 그룹 |
| `87654321` | 참여 가능한 다른 seed 그룹 |
| `FULL0001` | 정원이 찬 그룹 |

이런 seed 데이터 덕분에 서버 없이도 그룹 참여 에러 플로우를 테스트할 수 있습니다.

---

## 47. MockRepository도 Promise를 반환하는 이유

mock 구현체를 보면 실제 네트워크가 없는데도 `async`를 씁니다.

```ts
async getGroups(): Promise<Group[]> {
  return getMockJoinedGroups();
}
```

이유는 contract가 비동기 API를 약속하기 때문입니다.

```ts
getGroups(): Promise<Group[]>;
```

실제 API는 네트워크 요청이라 비동기입니다.

mock도 같은 모양을 맞춰야 UseCase/Query가 동일하게 사용할 수 있습니다.

---

## 48. mock과 API가 같은 모델을 반환해야 한다

MockRepository와 API Repository는 둘 다 앱 내부 모델을 반환해야 합니다.

예:

```ts
Promise<Group[]>
```

API 구현체는 서버 응답을 `mapGroup`으로 변환합니다.

Mock 구현체는 처음부터 `Group` 모델에 맞는 mock 데이터를 반환합니다.

중요한 원칙:

```txt
화면은 서버 응답 모양도, mock 원본 모양도 몰라야 한다.
화면은 앱 내부 모델만 받아야 한다.
```

---

## 49. mock/API 전환 디버깅 순서

"왜 mock이 아니라 API를 치지?" 또는 "왜 API가 아니라 mock이지?" 싶으면 이 순서로 봅니다.

1. 어떤 명령으로 앱을 실행했는가?

```txt
npm run start:mock
npm run start:dev
npm run ios:dev
```

2. script에 어떤 `EXPO_PUBLIC_USE_MOCK_*` 값이 들어가 있는가?

```txt
package.json
```

3. `env.ts`에서 해당 값이 어떻게 파싱되는가?

```txt
useMockApi
useMockGroups
useMockAuth
...
```

4. `repositories/index.ts`에서 어떤 구현체를 고르는가?

```txt
env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl()
```

5. 실제 hook/query가 어떤 factory를 호출하는가?

```txt
createGroupRepository()
createAuthRepository()
createUserRepository()
```

---

## 50. API가 안 불리는지 확인하는 법

코드를 읽을 때는 다음을 확인하면 됩니다.

```txt
선택된 repository가 MockRepository인가?
MockRepository 내부에서 apiClient를 import하나?
```

대부분의 mock repository는 `apiClient`를 import하지 않습니다.

반대로 실제 API repository는 보통 이런 import가 있습니다.

```ts
import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
```

즉 파일 상단 import만 봐도 감이 옵니다.

---

## 51. 전환 후 Metro/Expo 재시작이 필요한 이유

환경 변수는 앱 bundle이 만들어질 때 들어갑니다.

그래서 실행 중에 `.env`나 script 값을 바꿨다면 앱을 다시 시작해야 합니다.

안 그러면 이전 값으로 bundle이 떠 있을 수 있습니다.

읽는 법:

```txt
mock/dev/prod 전환은 실행 시점 설정이다.
앱을 켠 뒤 버튼 하나로 repository가 바뀌는 구조는 아니다.
```

---

## 52. 새 도메인 repository를 추가할 때

새 기능이 생겨서 repository를 추가한다면 보통 이 순서입니다.

1. contract 만들기

```txt
src/services/repositories/contracts/newFeatureRepository.ts
```

2. API 구현체 만들기

```txt
src/services/repositories/impl/newFeatureRepositoryImpl.ts
```

3. Mock 구현체 만들기

```txt
src/services/repositories/mock/mockNewFeatureRepository.ts
```

4. env에 스위치 추가

```ts
useMockNewFeature: boolean;
```

5. `.env.example`과 `package.json` script에 값 추가

```txt
EXPO_PUBLIC_USE_MOCK_NEW_FEATURE=true/false
```

6. repository factory 추가

```ts
export function createNewFeatureRepository() {
  return env.useMockNewFeature ? new MockNewFeatureRepository() : new NewFeatureRepositoryImpl();
}
```

이 패턴을 따르면 기존 구조와 잘 맞습니다.

---

## 53. mock 구현체를 만들 때 주의할 점

mock은 "대충 화면에 값만 띄우는 코드"로 만들면 나중에 API 전환 때 고생합니다.

좋은 mock 구현체는 다음을 지켜야 합니다.

```txt
contract와 같은 메서드 이름
contract와 같은 반환 타입
실제 API에서 발생할 수 있는 주요 성공/실패 케이스
앱 내부 모델 기준 반환
필요하면 MMKV에 저장해 앱 재실행 후 유지
```

예를 들어 그룹 참여 mock은 중복 참여, 정원 초과, 존재하지 않는 코드 같은 에러를 결과값으로 반환합니다.

이런 mock은 실제 API에 가까워서 화면 로직을 더 제대로 테스트할 수 있습니다.

---

## 54. API 구현체를 만들 때 주의할 점

API 구현체는 다음 책임을 갖습니다.

```txt
endpoint 호출
request body 구성
ApiEnvelope에서 data 꺼내기
서버 필드명을 앱 모델로 mapping
서버/네트워크 에러를 AppError로 변환
```

화면에 서버 필드명이 새어 나가면 좋지 않습니다.

예:

```txt
서버: groupId, groupName, currentMemberCount
앱 모델: id, name, currentMember
```

이 변환은 repository에서 끝내는 것이 현재 프로젝트 패턴입니다.

---

## 55. 흔한 착각

### 55-1. `appEnv=mock`이면 API baseURL은 필요 없나?

필요할 수 있습니다.

`mock` 환경에서도 일부 도메인을 API로 켤 수 있기 때문입니다.

그래서 mock 기본값에도 dev API URL이 들어 있습니다.

### 55-2. `EXPO_PUBLIC_USE_MOCK_API=false`면 모든 mock이 꺼지나?

기본값은 꺼집니다.

하지만 도메인별 스위치가 true면 해당 도메인은 mock입니다.

예:

```txt
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_USE_MOCK_APP_INFO=true
```

이 경우 AppInfo는 mock입니다.

### 55-3. mock 데이터를 바꾸면 서버 데이터도 바뀌나?

아닙니다.

mock 데이터는 로컬 MMKV/seed 데이터입니다.

실제 서버에는 영향을 주지 않습니다.

### 55-4. RepositoryImpl과 MockRepository를 화면에서 직접 골라야 하나?

아닙니다.

화면이나 hook에서는 `createXRepository()`를 씁니다.

전환은 factory가 담당합니다.

### 55-5. mock auth면 Kakao SDK도 실행되나?

아닙니다.

`useOnboarding.ts`에서 `env.useMockAuth`일 때 SDK 호출을 건너뛰고 mock payload를 만듭니다.

---

## 56. iOS 개발자 관점에서 보기

iOS에 익숙하다면 이렇게 볼 수 있습니다.

| iOS | RN Dogether |
| --- | --- |
| Scheme Environment | `package.json` script의 `EXPO_PUBLIC_*` |
| AppConfig | `src/config/env.ts`의 `env` |
| Protocol | `contracts/*Repository.ts` |
| Production Repository | `impl/*RepositoryImpl.ts` |
| Mock Repository | `mock/mock*Repository.ts` |
| DI Container / Assembly | `src/services/repositories/index.ts` |
| UserDefaults mock fixture | mock data + MMKV |

가장 중요한 그림은 이것입니다.

```txt
GroupRepository protocol
  |
  +-- GroupRepositoryImpl  // API
  |
  +-- MockGroupRepository  // mock
```

그리고 어떤 구현체를 쓸지는 `env`가 정합니다.

---

## 57. 읽기 연습: 그룹 목록이 mock인지 확인하기

그룹 목록을 예로 들어 따라가 봅시다.

1. 화면/hook에서 repository 생성 위치 찾기

```txt
rg "createGroupRepository" src
```

2. factory 확인

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

3. env 값 확인

```txt
EXPO_PUBLIC_USE_MOCK_GROUPS
또는
EXPO_PUBLIC_USE_MOCK_API
```

4. true면 mock 파일 보기

```txt
src/services/repositories/mock/mockGroupRepository.ts
```

5. false면 API 파일 보기

```txt
src/services/repositories/impl/groupRepositoryImpl.ts
```

이 순서면 거의 모든 도메인에 적용할 수 있습니다.

---

## 58. 읽기 연습: 로그인이 mock인지 확인하기

로그인은 한 단계 더 봐야 합니다.

1. onboarding hook 확인

```txt
src/hooks/useOnboarding.ts
```

2. `env.useMockAuth` 분기 확인

```ts
if (env.useMockAuth) {
  return authUseCase.loginWithKakao({
    providerId: 'mock-kakao-user-' + Date.now(),
    name: 'Kakao User',
  });
}
```

3. repository factory 확인

```ts
export function createAuthRepository() {
  return env.useMockAuth ? new MockAuthRepository() : new AuthRepositoryImpl();
}
```

4. mock이면 SDK와 서버를 건너뛰는지 확인

```txt
mock payload
-> AuthUseCase
-> MockAuthRepository
-> mock session
```

로그인은 native SDK 단계가 있어서 다른 repository보다 분기가 조금 더 넓습니다.

---

## 59. 추천 검색어

mock/API 전환을 추적할 때 유용한 검색어입니다.

```bash
rg "useMock" src
rg "create.*Repository" src
rg "Mock.*Repository" src
rg "RepositoryImpl" src
rg "EXPO_PUBLIC_USE_MOCK" .
rg "apiClient" src/services/repositories
```

특정 도메인을 볼 때는:

```bash
rg "createGroupRepository" src
rg "useMockGroups" src
rg "MockGroupRepository|GroupRepositoryImpl" src
```

---

## 60. 마지막으로 한 번에 정리

mock/API 전환의 핵심은 이렇습니다.

```txt
package.json script가 EXPO_PUBLIC_* 환경 변수를 넣는다.
env.ts가 문자열 환경 변수를 boolean/union 설정으로 정리한다.
useMockApi는 전체 기본 mock 스위치다.
useMockAuth/useMockGroups 같은 값은 도메인별 스위치다.
repositories/index.ts가 env 값을 보고 MockRepository 또는 RepositoryImpl을 생성한다.
화면과 UseCase는 mock/API 여부를 몰라도 된다.
MockRepository는 seed/MMKV 데이터를 사용한다.
RepositoryImpl은 apiClient와 endpoints를 사용해 실제 서버를 호출한다.
```

한 줄로 줄이면:

```txt
Dogether RN의 mock/API 전환은 화면이 아니라 repository factory에서 일어나고,
그 factory를 움직이는 것은 Expo 환경 변수로 만든 env 설정이다.
```
