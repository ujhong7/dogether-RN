# Repository / UseCase 구조 읽는 법

이 문서는 Dogether RN 프로젝트의 데이터 흐름과 아키텍처를 이해하기 위한 문서입니다.

Dogether RN은 화면이 API를 직접 호출하지 않습니다. 화면은 Hook과 Query를 통해 UseCase를 호출하고, UseCase는 Repository interface를 통해 실제 API 또는 Mock 데이터에 접근합니다.

## 큰 흐름

데이터 흐름은 대체로 아래와 같습니다.

```text
Screen
  -> Hook
    -> Query / Mutation
      -> UseCase
        -> Repository contract
          -> API Repository or Mock Repository
            -> apiClient / mock data / local storage
```

이 구조의 목적은 화면 코드가 서버 통신 방식에 직접 묶이지 않게 하는 것입니다.

예를 들어 메인 화면은 "투두를 가져온다"는 사실만 알면 됩니다. 실제로 서버 API를 치는지, mock 데이터를 읽는지는 화면이 몰라도 됩니다.

## 각 레이어 역할

| 레이어 | 역할 |
| --- | --- |
| Screen | 화면을 그리고 사용자 이벤트를 받음 |
| Hook | 화면 상태, 이벤트, query/store/usecase 조합 |
| Query / Mutation | 서버 상태 읽기/쓰기와 캐시 관리 |
| UseCase | 기능 단위 비즈니스 흐름을 제공 |
| Repository contract | 필요한 데이터 동작을 interface로 정의 |
| API Repository | 실제 서버 API 호출 |
| Mock Repository | 서버 없이 동작하는 mock 데이터 제공 |
| apiClient | Axios 공통 설정, base URL, token header |
| local storage | MMKV 기반 세션/선택 그룹 등 저장 |

iOS로 비유하면 `Repository contract`는 Swift protocol, `RepositoryImpl`은 URLSession/Alamofire 구현체, `MockRepository`는 테스트용 fake 구현체에 가깝습니다.

## 폴더 구조

관련 코드는 `src/services` 아래에 있습니다.

```text
src/services/
  api/
    client.ts
    endpoints/
    s3Upload.ts
  errors/
  repositories/
    contracts/
    impl/
    mock/
    index.ts
  usecases/
```

읽는 순서:

```text
1. usecases
2. repositories/contracts
3. repositories/impl
4. repositories/mock
5. repositories/index.ts
6. api/client.ts
```

## Model

Model은 앱 내부에서 사용하는 데이터 타입입니다.

예: `src/models/group.ts`

```ts
export type GroupStatus = 'ready' | 'running' | 'dDay';

export type Group = {
  id: number;
  name: string;
  currentMember: number;
  maximumMember: number;
  joinCode: string;
  status: GroupStatus;
  duration: number;
  progress: number;
  startDate: string;
  endDate: string;
};
```

화면, Hook, Query, UseCase, Repository가 공통으로 이해하는 타입입니다.

서버 응답 필드명과 앱 내부 모델 필드명은 다를 수 있습니다. 이 차이는 보통 Repository 구현체에서 변환합니다.

## Repository Contract

Repository contract는 이 기능이 데이터에 대해 어떤 동작을 필요로 하는지 정의합니다.

예: `src/services/repositories/contracts/groupRepository.ts`

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

여기에는 API endpoint, Axios, JSON parsing 같은 구현 세부사항이 없습니다.

읽는 법:

```text
이 feature에서 필요한 데이터 기능의 목록을 먼저 파악한다.
```

Swift의 protocol처럼, API 구현체와 Mock 구현체가 같은 메서드를 제공하도록 약속합니다.

## UseCase

UseCase는 화면이나 query가 호출할 기능 단위 동작을 제공합니다.

예: `src/services/usecases/groupUseCase.ts`

```ts
export class GroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroups() {
    return this.groupRepository.getGroups();
  }

  async createGroup(input: CreateGroupInput) {
    return this.groupRepository.createGroup(input);
  }
}
```

UseCase는 Repository contract에 의존합니다.

```text
GroupUseCase
  -> GroupRepository interface
```

이 덕분에 UseCase는 실제 API 구현체인지 Mock 구현체인지 몰라도 됩니다.

## UseCase가 얇아도 필요한 이유

현재 일부 UseCase는 Repository 메서드를 거의 그대로 감싸는 얇은 구조입니다.

그래도 의미가 있습니다.

| 이유 | 설명 |
| --- | --- |
| 화면이 Repository를 직접 알지 않음 | UI 계층과 데이터 계층 분리 |
| 기능 이름을 앱 흐름 기준으로 제공 | `joinGroupByCode`, `certifyTodo` 등 |
| 나중에 비즈니스 로직 추가 가능 | 여러 repository 조합, 검증, 분기 추가 |
| Mock/API 전환과 무관 | UseCase는 interface만 의존 |

프로젝트가 커질수록 UseCase는 단순 전달자에서 비즈니스 흐름 조합 계층으로 자연스럽게 커질 수 있습니다.

## API Repository

API Repository는 Repository contract를 실제 서버 API로 구현합니다.

예: `src/services/repositories/impl/groupRepositoryImpl.ts`

```ts
export class GroupRepositoryImpl implements GroupRepository {
  async getGroups(): Promise<Group[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ joiningChallengeGroups: any[] }>>(
        endpoints.groups.my,
      );
      return (res.data.data?.joiningChallengeGroups ?? []).map(mapGroup);
    } catch (error) {
      throw toAppError(error);
    }
  }
}
```

담당:

- endpoint 호출
- request body 생성
- response envelope 해석
- 서버 응답을 앱 모델로 변환
- 서버/네트워크 에러를 앱 에러로 변환

화면은 서버 응답 필드명을 몰라도 됩니다.

## Mapping

서버 응답과 앱 내부 모델은 이름이 다를 수 있습니다.

예: 서버는 `groupId`, `groupName`을 주고, 앱은 `id`, `name`을 씁니다.

```ts
function mapGroup(raw: any): Group {
  return {
    id: Number(raw.groupId ?? raw.id ?? 1),
    name: String(raw.groupName ?? raw.name ?? 'Dogether Sample Group'),
    currentMember: Number(raw.currentMemberCount ?? raw.currentMember ?? 3),
    maximumMember: Number(raw.maximumMemberCount ?? raw.maximumMember ?? 5),
    joinCode: String(raw.joinCode ?? 'ABC12345'),
    status: mapGroupStatus(raw.status),
    duration: Number(raw.progressDay ?? raw.duration ?? 12),
    progress: Number(raw.progressRate ?? raw.progress ?? 0.47),
    startDate: formatGroupDate(raw.startAt ?? raw.startDate),
    endDate: formatGroupDate(raw.endAt ?? raw.endDate),
  };
}
```

이 mapping을 Repository에 모아두면 Screen과 Hook은 서버 naming을 몰라도 됩니다.

```text
서버 응답 변경
  -> Repository mapping 수정
  -> 화면 코드는 유지
```

## ApiEnvelope

서버 응답은 공통 envelope 형태를 가집니다.

```ts
export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T | null;
};
```

Repository 구현체에서는 보통 이렇게 읽습니다.

```ts
const res = await apiClient.get<ApiEnvelope<{ todos: any[] }>>(...);
const todos = res.data.data?.todos ?? [];
```

읽는 법:

```text
Axios 응답 res
  -> res.data
    -> 서버 envelope
      -> envelope.data
        -> 실제 payload
```

## Mock Repository

Mock Repository는 서버 없이도 앱을 실행하고 화면을 확인할 수 있게 합니다.

예: `src/services/repositories/mock/mockGroupRepository.ts`

```ts
export class MockGroupRepository implements GroupRepository {
  async getGroups(): Promise<Group[]> {
    return getMockJoinedGroups();
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    return createMockGroup(input);
  }
}
```

장점:

- 서버가 없어도 UI 개발 가능
- API 장애와 무관하게 화면 확인 가능
- feature별로 실제 API와 mock을 섞어 사용 가능
- 입문자가 앱 흐름을 빠르게 실습 가능

## Repository Factory

API 구현체를 쓸지 Mock 구현체를 쓸지는 `src/services/repositories/index.ts`에서 결정합니다.

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

뜻:

```text
env.useMockGroups가 true면 MockGroupRepository
false면 GroupRepositoryImpl
```

다른 repository도 같은 패턴입니다.

```ts
export function createAuthRepository() {
  return env.useMockAuth ? new MockAuthRepository() : new AuthRepositoryImpl();
}

export function createChallengeGroupRepository() {
  return env.useMockChallengeGroups
    ? new MockChallengeGroupRepository()
    : new ChallengeGroupRepositoryImpl();
}
```

화면과 UseCase는 어떤 구현체가 선택됐는지 몰라도 됩니다.

## 환경값과 Mock 전환

Mock/API 전환 기준은 `src/config/env.ts`에 있습니다.

```text
env.useMockAuth
env.useMockGroups
env.useMockChallengeGroups
env.useMockUser
env.useMockReview
env.useMockAppInfo
```

실행 스크립트에서 `EXPO_PUBLIC_USE_MOCK_*` 값을 바꾸면 Repository factory가 선택하는 구현체가 바뀝니다.

```text
package.json script
  -> EXPO_PUBLIC_USE_MOCK_GROUPS
  -> env.useMockGroups
  -> createGroupRepository()
  -> MockGroupRepository or GroupRepositoryImpl
```

## apiClient

API Repository는 Axios를 직접 새로 만들지 않고 공통 `apiClient`를 사용합니다.

`src/services/api/client.ts`:

```ts
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

요청 직전에 access token을 붙입니다.

```ts
apiClient.interceptors.request.use(applyAuthorizationHeader);
```

흐름:

```text
RepositoryImpl
  -> apiClient.get/post/delete
    -> request interceptor
      -> MMKV에서 access token 읽기
      -> Authorization header 추가
      -> 서버 요청
```

인증 헤더 같은 공통 처리를 Repository마다 반복하지 않기 위한 구조입니다.

## Query와 UseCase

서버 데이터를 읽는 화면은 보통 React Query hook에서 UseCase를 호출합니다.

예: `useGroupsQuery`

```ts
export function useGroupsQuery() {
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupUseCase.getGroups(),
  });
}
```

흐름:

```text
useGroupsQuery
  -> GroupUseCase.getGroups()
    -> GroupRepository.getGroups()
      -> GroupRepositoryImpl or MockGroupRepository
```

Screen은 query object를 받습니다.

```ts
const groupsQuery = useGroupsQuery();
```

## Mutation과 UseCase

쓰기 작업은 `useMutation` 또는 화면의 submit 함수에서 UseCase를 호출합니다.

로그인 예:

```ts
const demoLoginMutation = useMutation({
  mutationFn: () => authUseCase.loginDemo(),
  onSuccess: (data) => {
    loginStore(data);
  },
});
```

인증 제출 예:

```ts
await challengeGroupUseCase.certifyTodo(
  draft.groupId,
  draft.date,
  draft.todoId,
  draft.content.trim(),
  draft.imageUri,
);
```

쓰기 작업 후에는 관련 React Query cache를 무효화하는 경우가 많습니다.

```ts
await queryClient.invalidateQueries({ queryKey: ['todos'] });
```

## 메인 화면 데이터 흐름

메인 화면은 그룹 목록과 투두 목록을 읽습니다.

```text
MainScreen
  -> useMainScreen
    -> useGroupsQuery
      -> GroupUseCase
        -> GroupRepository
          -> GroupRepositoryImpl or MockGroupRepository

    -> useMyTodosQuery
      -> ChallengeGroupUseCase
        -> ChallengeGroupRepository
          -> ChallengeGroupRepositoryImpl or MockChallengeGroupRepository
```

상태 역할:

```text
그룹 목록, 투두 목록 -> React Query
선택 그룹 id, 날짜 offset, 필터 -> Zustand mainStore
```

## 투두 작성 흐름

투두 작성은 서버 상태를 바꾸는 흐름입니다.

```text
TodoWriteScreen
  -> ChallengeGroupUseCase.createTodos()
    -> ChallengeGroupRepository.createTodos()
      -> ChallengeGroupRepositoryImpl.createTodos()
        -> apiClient.post(createTodos)
        -> getMyTodos()로 최신 목록 다시 조회
  -> queryClient.invalidateQueries(['todos'])
  -> router.replace('/main')
```

UseCase는 화면이 "투두를 저장한다"는 의도를 표현하고, Repository는 실제 API 호출 방법을 압니다.

## 인증 제출 흐름

인증 제출은 이미지 업로드와 인증 API 호출이 함께 있습니다.

```text
CertificationContentScreen
  -> ChallengeGroupUseCase.certifyTodo()
    -> ChallengeGroupRepository.certifyTodo()
      -> uploadImageToS3(mediaUrl)
      -> apiClient.post(certifyTodo)
      -> getMyTodos()로 인증된 Todo 다시 찾기
  -> invalidate todos / certification-list / statistics
  -> clearDraft()
  -> router.replace('/main')
```

화면은 "인증을 제출한다"는 동작만 호출하고, S3 업로드나 API endpoint 세부사항은 Repository/API 계층에 있습니다.

## 앱 시작 흐름

앱 시작 분기는 `AppLaunchUseCase`가 담당합니다.

```text
SplashScreen
  -> useLaunchFlowQuery
    -> AppLaunchUseCase.decideNextRoute()
      -> AppInfoRepository.checkForceUpdate()
      -> GroupRepository.getGroups()
      -> ReviewRepository.getPendingReviews()
```

분기:

```text
force update -> update
not logged in -> onboarding
no groups -> start
pending reviews -> review
else -> main
```

여러 repository 결과를 조합해 첫 화면을 결정하므로 UseCase에 두는 것이 자연스럽습니다.

## 그룹 생성/참여 흐름

그룹 생성:

```text
GroupCreateScreen
  -> GroupUseCase.createGroup(input)
    -> GroupRepository.createGroup(input)
      -> GroupRepositoryImpl.createGroup()
        -> apiClient.post(groups.create)
        -> getGroups()로 생성 그룹 찾기
  -> invalidate ['groups']
  -> startFlowStore.setCompletePayload()
  -> router.push('/complete')
```

그룹 참여:

```text
GroupJoinScreen
  -> GroupUseCase.joinGroupByCode(code)
    -> GroupRepository.joinGroupByCode(code)
      -> 성공: { ok: true, group }
      -> 비즈니스 에러: { ok: false, code }
  -> 성공이면 complete payload 저장
  -> 실패면 에러 modal 분기
```

`JoinGroupResult`가 union type인 이유는 특정 비즈니스 에러를 throw하지 않고 화면에서 분기하기 위해서입니다.

## 에러 처리 흐름

API Repository는 에러를 `toAppError`로 변환해 던집니다.

```ts
try {
  ...
} catch (error) {
  throw toAppError(error);
}
```

화면에서는 query/mutation 에러를 받아 alert 또는 full screen error로 보여줍니다.

```text
API error
  -> Repository catch
  -> toAppError
  -> Query error / Mutation onError
  -> Screen error UI
```

이 구조 덕분에 화면마다 Axios 에러 모양을 직접 해석하지 않아도 됩니다.

## 파일 읽는 순서

새 기능을 이해할 때는 아래 순서가 좋습니다.

```text
1. Model
   -> 어떤 데이터 타입을 쓰는지 확인

2. Repository contract
   -> 어떤 데이터 동작이 필요한지 확인

3. UseCase
   -> 화면이 호출하는 기능 이름과 흐름 확인

4. Query or Hook
   -> UseCase가 어디서 호출되는지 확인

5. API Repository
   -> 실제 endpoint, request body, response mapping 확인

6. Mock Repository
   -> mock 환경에서 어떤 데이터가 나오는지 확인

7. Repository factory
   -> 현재 환경에서 API/Mock 중 무엇을 쓰는지 확인

8. Screen
   -> query 결과와 action이 UI에 어떻게 연결되는지 확인
```

## 서버 응답이 바뀌었을 때 어디를 볼까?

서버 응답 필드명이 바뀌었다면 먼저 API Repository를 봅니다.

```text
src/services/repositories/impl/*
```

예:

```text
groupName -> name mapping 문제
  -> groupRepositoryImpl.ts의 mapGroup 확인

todo status 변환 문제
  -> challengeGroupRepositoryImpl.ts의 mapTodoStatus 확인
```

화면 파일을 먼저 고치기보다, 서버 응답을 앱 모델로 바꾸는 경계인 Repository mapping을 먼저 확인하는 것이 좋습니다.

## Mock 데이터가 이상할 때 어디를 볼까?

Mock 환경에서 데이터가 이상하면 아래를 봅니다.

```text
src/services/repositories/mock/*
src/services/repositories/mock/data/*
```

MockRepository는 실제 API와 같은 contract를 구현하지만, 데이터 출처는 mock data입니다.

## 자주 헷갈리는 점

### UseCase와 Repository 차이

```text
UseCase -> 앱 기능의 동작 이름
Repository -> 데이터 출처에 대한 약속과 구현
```

### Contract와 Impl 차이

```text
contracts/*.ts -> 어떤 메서드가 있어야 하는지
impl/*.ts -> 그 메서드를 실제 API로 어떻게 구현하는지
mock/*.ts -> 그 메서드를 mock 데이터로 어떻게 구현하는지
```

### 화면에서 API endpoint를 찾지 않는다

화면은 endpoint를 몰라도 됩니다. endpoint는 RepositoryImpl과 `src/services/api/endpoints`에서 찾습니다.

### Mock 전환은 화면에서 하지 않는다

Mock/API 선택은 `repositories/index.ts`와 `env.ts`에서 합니다.

### Repository는 서버 응답을 앱 모델로 바꾸는 경계다

화면이 서버 필드명을 직접 알게 만들지 않는 것이 핵심입니다.

## 한 줄 요약

```text
Dogether RN은 Screen이 API를 직접 호출하지 않고,
Hook/Query가 UseCase를 호출하며,
UseCase는 Repository contract만 알고,
Repository factory가 API 구현체와 Mock 구현체를 선택하고,
RepositoryImpl이 서버 응답을 앱 모델로 변환한다.
```
