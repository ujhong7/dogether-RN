# React Query 서버상태 읽는 법

이 문서는 Dogether RN 프로젝트에서 `React Query`를 읽는 방법을 정리한 문서입니다.

React Query는 서버에서 가져오는 데이터와 그 주변 상태를 관리합니다. 여기서 주변 상태란 로딩, 에러, 캐시, 재요청, 무효화 같은 것들입니다.

## 서버 상태란?

React Native 앱의 상태는 크게 세 종류로 나눌 수 있습니다.

| 상태 종류 | 사용 도구 | 예시 |
| --- | --- | --- |
| 화면 안에서만 쓰는 상태 | `useState` | input 값, modal 열림 여부 |
| 여러 화면이 공유하는 UI 상태 | Zustand | 선택 그룹, 날짜 offset, 인증 draft |
| 서버에서 가져오는 데이터 | React Query | 그룹 목록, 투두 목록, 프로필, 랭킹 |

React Query는 세 번째, 서버 상태를 담당합니다.

```text
서버에서 다시 가져올 수 있는 데이터라면 React Query
앱이 현재 보고 있는 조건이라면 Zustand
```

예:

```text
그룹 목록 -> React Query
현재 선택된 그룹 id -> Zustand

투두 목록 -> React Query
날짜 offset / 필터 -> Zustand
```

## React Query가 해주는 일

서버 데이터를 직접 `useState + useEffect`로 관리하면 아래 값을 모두 직접 만들어야 합니다.

- 데이터
- 로딩 상태
- 에러 상태
- 재시도
- 캐시
- 다시 불러오기
- 같은 데이터를 여러 화면에서 공유하기

React Query를 쓰면 query 하나가 이 상태를 같이 들고 있습니다.

```tsx
const groupsQuery = useGroupsQuery();

groupsQuery.data
groupsQuery.isLoading
groupsQuery.isError
groupsQuery.error
groupsQuery.refetch()
```

## Query Hook 위치

Dogether RN의 query hook은 `src/queries`에 있습니다.

```text
src/queries/
  useGroupsQuery.ts
  useLaunchFlowQuery.ts
  useMyTodosQuery.ts
  useProfileQuery.ts
  useStatisticsQuery.ts
  useCertificationListQuery.ts
  usePendingReviewsQuery.ts
  useRankingQuery.ts
```

query hook은 보통 화면이나 custom hook에서 호출합니다.

```text
Screen or custom hook
  -> useSomethingQuery()
    -> UseCase
      -> Repository
        -> apiClient or mock data
```

## Query Hook 기본 구조

가장 단순한 query는 `useGroupsQuery`입니다.

```tsx
export function useGroupsQuery() {
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupUseCase.getGroups(),
  });
}
```

읽는 법:

| 항목 | 의미 |
| --- | --- |
| `useMemo` | UseCase 인스턴스를 재사용 |
| `queryKey` | React Query 캐시 주소 |
| `queryFn` | 실제 데이터를 가져오는 함수 |
| `return useQuery(...)` | query 상태 객체 반환 |

화면에서는 이렇게 씁니다.

```tsx
const groupsQuery = useGroupsQuery();
```

## queryKey

`queryKey`는 React Query 캐시의 주소입니다.

```tsx
queryKey: ['groups']
```

같은 queryKey를 쓰면 같은 서버 상태로 취급됩니다.

파라미터가 있는 query는 key에 파라미터를 포함합니다.

```tsx
queryKey: ['todos', groupId, date]
queryKey: ['ranking', groupId]
queryKey: ['statistics', groupId]
queryKey: ['certification-list', sort]
```

뜻:

```text
같은 todos라도 groupId나 date가 다르면 다른 캐시다.
같은 ranking이라도 groupId가 다르면 다른 캐시다.
```

## queryKey 설계 읽기

Dogether RN의 주요 queryKey는 다음과 같습니다.

| query hook | queryKey | 의미 |
| --- | --- | --- |
| `useGroupsQuery` | `['groups']` | 내 그룹 목록 |
| `useMyTodosQuery` | `['todos', groupId, date]` | 특정 그룹/날짜의 내 투두 |
| `useProfileQuery` | `['profile']` | 내 프로필 |
| `useRankingQuery` | `['ranking', groupId]` | 특정 그룹 랭킹 |
| `useStatisticsQuery` | `['statistics', groupId]` | 특정 그룹 통계 |
| `useCertificationListQuery` | `['certification-list', sort]` | 정렬 조건별 인증 목록 |
| `usePendingReviewsQuery` | `['pending-reviews']` | 대기 중인 리뷰 |
| `useLaunchFlowQuery` | `['launch-flow', hydrated, token]` | 앱 시작 분기 |

queryKey에 들어간 값이 바뀌면 React Query는 다른 데이터로 봅니다.

## queryFn

`queryFn`은 실제 데이터를 가져오는 함수입니다.

```tsx
queryFn: () => groupUseCase.getGroups()
```

프로젝트 흐름:

```text
queryFn
  -> UseCase
    -> Repository contract
      -> RepositoryImpl or MockRepository
        -> apiClient or mock data
```

화면은 API 구현체를 직접 알지 않습니다. query hook도 UseCase를 통해 데이터 흐름을 시작합니다.

## enabled

`enabled`는 query를 실행할지 말지 정합니다.

```tsx
return useQuery({
  queryKey: ['todos', groupId, date],
  enabled: Boolean(groupId && date),
  queryFn: () => challengeGroupUseCase.getMyTodos(groupId!, date),
});
```

뜻:

```text
groupId와 date가 있을 때만 투두 목록을 요청한다.
```

`groupId`가 아직 없는데 API를 호출하면 잘못된 요청이 됩니다. 그래서 필요한 값이 준비될 때까지 query를 멈춥니다.

다른 예:

```tsx
enabled: Boolean(groupId)
```

랭킹과 통계는 그룹 id가 있어야 조회할 수 있습니다.

## `!`와 enabled

`useMyTodosQuery`에는 이런 코드가 있습니다.

```tsx
enabled: Boolean(groupId && date),
queryFn: () => challengeGroupUseCase.getMyTodos(groupId!, date),
```

`groupId!`는 TypeScript에게 "여기서는 groupId가 반드시 있다"고 알려주는 표시입니다.

안전한 이유는 바로 위의 `enabled`가 `groupId`가 있을 때만 query를 실행하게 막기 때문입니다.

읽을 때는 둘을 같이 봐야 합니다.

```text
enabled로 실행 조건을 막고,
queryFn 안에서는 non-null이라고 단언한다.
```

## Query 반환값

query hook은 데이터뿐 아니라 상태도 함께 반환합니다.

자주 보는 값:

| 값 | 의미 |
| --- | --- |
| `data` | 성공했을 때 받은 데이터 |
| `isLoading` | 처음 불러오는 중 |
| `isFetching` | 다시 불러오는 중 |
| `isSuccess` | 성공 여부 |
| `isError` | 실패 여부 |
| `error` | 실패한 에러 |
| `refetch()` | 수동 재요청 |

예:

```tsx
if (groupsQuery.isError || todosQuery.isError) {
  ...
}
```

메인 화면은 그룹 query나 투두 query 중 하나라도 실패하면 에러 UI를 보여줍니다.

## data 기본값 처리

query의 `data`는 처음에는 `undefined`일 수 있습니다.

그래서 화면에서는 기본값을 자주 둡니다.

```tsx
const visibleTodos = todosQuery.data ?? [];
```

뜻:

```text
투두 데이터가 아직 없으면 빈 배열로 처리한다.
```

그룹도 마찬가지입니다.

```tsx
groups={groupsQuery.data ?? []}
```

처음 로딩 중에도 화면이 터지지 않게 하기 위한 패턴입니다.

## useLaunchFlowQuery

`useLaunchFlowQuery`는 앱 시작 분기를 결정하는 query입니다.

```tsx
export function useLaunchFlowQuery() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const token = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['launch-flow', hydrated, token],
    enabled: hydrated,
    queryFn: async () => {
      await useCase.launchDelay();
      return useCase.decideNextRoute(Boolean(token), env.appVersion);
    },
  });
}
```

읽는 법:

```text
1. 세션 store에서 hydrated/token을 읽는다.
2. hydrated가 true가 될 때까지 query를 실행하지 않는다.
3. token과 앱 버전을 기준으로 다음 route를 계산한다.
4. 결과는 update/onboarding/start/review/main 중 하나다.
```

`hydrated`가 중요한 이유는 MMKV에서 세션을 읽기 전에는 로그인 여부를 알 수 없기 때문입니다.

## useMyTodosQuery

`useMyTodosQuery`는 메인 화면의 투두 목록을 읽습니다.

```tsx
export function useMyTodosQuery({ groupId, date }: Params) {
  return useQuery({
    queryKey: ['todos', groupId, date],
    enabled: Boolean(groupId && date),
    queryFn: () => challengeGroupUseCase.getMyTodos(groupId!, date),
  });
}
```

메인 화면 흐름:

```text
useMainScreen
  -> currentGroup 계산
  -> dateOffset을 실제 날짜 문자열로 변환
  -> useMyTodosQuery({ groupId: currentGroup?.id, date })
  -> todosQuery.data
  -> visibleTodos
  -> filteredTodos
```

서버에서 가져오는 것은 전체 투두 목록이고, 필터링은 화면/hook에서 처리합니다.

## useRankingQuery와 useStatisticsQuery

랭킹과 통계는 그룹 id가 필요합니다.

```tsx
export function useRankingQuery(groupId?: number) {
  return useQuery({
    queryKey: ['ranking', groupId],
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getRanking(groupId as number),
  });
}
```

```tsx
export function useStatisticsQuery(groupId?: number) {
  return useQuery({
    queryKey: ['statistics', groupId],
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getStatistics(groupId!),
  });
}
```

읽는 법:

```text
선택된 그룹이 있어야 query가 실행된다.
그룹 id가 바뀌면 queryKey도 바뀌므로 다른 캐시를 사용한다.
```

## useCertificationListQuery

인증 목록은 정렬 조건이 queryKey에 들어갑니다.

```tsx
export function useCertificationListQuery(sort: CertificationListSort) {
  return useQuery({
    queryKey: ['certification-list', sort],
    queryFn: () => userUseCase.getCertificationList(sort),
  });
}
```

뜻:

```text
정렬 조건이 다르면 다른 인증 목록 캐시로 본다.
```

예를 들어 최신순과 오래된순이 있다면 서로 다른 queryKey를 갖습니다.

## 전역 query 설정

React Query 전역 설정은 `src/lib/queryClient.ts`에 있습니다.

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});
```

| 설정 | 의미 |
| --- | --- |
| `retry: 1` | 실패 시 한 번 더 재시도 |
| `staleTime: 1000 * 30` | 30초 동안 신선한 데이터로 간주 |

`staleTime` 동안은 불필요한 재요청을 줄일 수 있습니다.

## QueryClientProvider

React Query를 앱 전체에서 쓰려면 `QueryClientProvider`로 감싸야 합니다.

`app/_layout.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
  <StatusBar style="light" />
  <Stack screenOptions={{ headerShown: false }}>
    ...
  </Stack>
</QueryClientProvider>
```

이 Provider 아래에 있는 모든 화면에서 query cache를 공유합니다.

## refetch

`refetch()`는 query를 수동으로 다시 요청합니다.

```tsx
void groupsQuery.refetch();
void todosQuery.refetch();
```

에러 화면의 "다시 시도" 버튼에서 자주 사용합니다.

```tsx
onRetry={() => {
  if (groupsQuery.isError) {
    void groupsQuery.refetch();
  }
  if (todosQuery.isError) {
    void todosQuery.refetch();
  }
}}
```

`refetch()`는 Promise를 반환하기 때문에, 기다리지 않을 때는 `void`를 붙여 "호출만 하겠다"는 의도를 표시합니다.

## useMutation

`useQuery`가 서버 데이터를 읽는 작업이라면, `useMutation`은 서버 상태를 바꾸는 작업입니다.

로그인 예:

```tsx
const demoLoginMutation = useMutation({
  mutationFn: () => authUseCase.loginDemo(),
  onSuccess: (data) => {
    loginStore(data);
  },
  onError: (error) => {
    setLoginError(toAppError(error));
  },
});
```

읽는 법:

| 항목 | 의미 |
| --- | --- |
| `mutationFn` | 실행할 비동기 작업 |
| `onSuccess` | 성공 후 처리 |
| `onError` | 실패 후 처리 |
| `mutate()` | mutation 실행 |
| `isPending` | 진행 중 여부 |

버튼에서는 이렇게 호출합니다.

```tsx
onPress={() => demoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
```

## invalidateQueries

서버 데이터를 바꾸는 작업이 성공하면 기존 query cache가 낡을 수 있습니다.

이때 `invalidateQueries`로 관련 query를 무효화합니다.

```tsx
await queryClient.invalidateQueries({ queryKey: ['todos'] });
```

뜻:

```text
todos로 시작하는 query는 낡았으니 다시 가져와야 한다.
```

인증 제출 예:

```tsx
await challengeGroupUseCase.certifyTodo(...);
await queryClient.invalidateQueries({ queryKey: ['todos'] });
await queryClient.invalidateQueries({ queryKey: ['certification-list'] });
await queryClient.invalidateQueries({ queryKey: ['statistics'] });
router.replace('/main');
```

인증을 하면 투두 상태, 인증 목록, 통계가 바뀔 수 있으므로 세 query를 최신화합니다.

## queryKey 일부 무효화

React Query는 queryKey 앞부분으로 여러 query를 무효화할 수 있습니다.

예:

```tsx
queryKey: ['todos', groupId, date]
```

무효화:

```tsx
invalidateQueries({ queryKey: ['todos'] })
```

이렇게 하면 `['todos', ...]`로 시작하는 관련 투두 query들을 다시 가져올 수 있습니다.

반대로 특정 그룹 랭킹만 무효화하고 싶으면 더 구체적으로 쓸 수 있습니다.

```tsx
invalidateQueries({ queryKey: ['ranking', context.groupId] })
```

## Dogether RN의 주요 무효화 흐름

| 상황 | 무효화 query |
| --- | --- |
| 투두 작성 성공 | `['todos']` |
| 인증 제출 성공 | `['todos']`, `['certification-list']`, `['statistics']` |
| 리뷰 제출 성공 | `['pending-reviews']`, `['launch-flow']` |
| 그룹 생성 성공 | `['groups']` |
| 그룹 참여 성공 | `['groups']` |
| 그룹 관리/탈퇴 | `['groups']`, `['certification-list']`, `['ranking']` |
| 완료 화면에서 홈 이동 | `['groups']`, `['todos']` |

무효화 목록을 보면 어떤 API 작업이 앱의 어떤 화면 데이터에 영향을 주는지 알 수 있습니다.

## Query와 Store 같이 읽기

메인 화면은 Query와 Store가 함께 쓰입니다.

```text
useGroupsQuery()
  -> 서버의 그룹 목록

useMyTodosQuery()
  -> 서버의 투두 목록

useMainStore()
  -> 선택 그룹 id, 날짜 offset, 필터
```

중요한 점:

```text
선택 조건은 store
조건으로 조회한 결과는 query
```

예:

```text
dateOffset이 바뀐다
  -> queryDate가 바뀐다
  -> useMyTodosQuery의 queryKey가 바뀐다
  -> 다른 날짜 투두를 조회한다
```

## 에러 처리

query가 실패하면 `isError`, `error`를 확인합니다.

```tsx
if (groupsQuery.isError || todosQuery.isError) {
  const appError = toAppError(groupsQuery.error ?? todosQuery.error);
  ...
}
```

화면에서는 query error를 프로젝트 공통 `AppError`로 변환한 뒤 alert 또는 full screen error로 보여줍니다.

에러 화면에서는 보통 `refetch()`를 연결합니다.

## Query Hook 읽는 순서

처음 보는 query hook은 아래 순서로 읽으면 좋습니다.

```text
1. hook 이름을 본다.
   -> 어떤 서버 데이터를 읽는지 확인

2. 매개변수를 본다.
   -> groupId, date, sort처럼 조회 조건 확인

3. useMemo로 만드는 UseCase를 본다.
   -> 어떤 service 계층으로 내려가는지 확인

4. queryKey를 본다.
   -> 캐시 주소와 파라미터 확인

5. enabled를 본다.
   -> 실행 조건 확인

6. queryFn을 본다.
   -> 실제 어떤 UseCase 메서드를 호출하는지 확인
```

## Screen에서 Query 읽는 순서

화면에서는 query 객체가 어떻게 쓰이는지 봅니다.

```text
1. 어떤 query hook을 호출하는지 본다.
2. isLoading/isError/isSuccess 분기를 본다.
3. data 기본값 처리(`?? []`, `?? null`)를 본다.
4. refetch가 어떤 버튼에 연결되는지 본다.
5. mutation 또는 제출 후 invalidateQueries가 있는지 본다.
```

## 자주 헷갈리는 점

### queryKey가 바뀌면 다른 데이터다

```tsx
['todos', 1, '2026-05-27']
['todos', 1, '2026-05-28']
```

두 key는 서로 다른 날짜의 투두입니다.

### enabled가 false면 queryFn은 실행되지 않는다

`groupId`가 없을 때 `enabled: false`이면 API 요청을 보내지 않습니다.

### data는 처음에 undefined일 수 있다

처음 로딩 중에는 `data`가 없을 수 있으므로 `?? []` 같은 기본값 처리가 필요합니다.

### invalidateQueries는 직접 데이터를 바꾸는 게 아니다

무효화는 "이 데이터는 낡았다"고 표시하는 것입니다. 이후 React Query가 다시 가져와 최신 상태로 맞춥니다.

### 서버 데이터는 Zustand에 넣지 않는다

그룹 목록이나 투두 목록처럼 서버에서 가져오는 데이터는 React Query가 담당합니다. Zustand는 선택값, draft, toast 같은 UI 상태를 담당합니다.

## 한 줄 요약

```text
React Query는 서버 데이터를 queryKey 단위로 캐싱하고,
queryFn으로 UseCase를 호출해 데이터를 가져오며,
enabled로 실행 조건을 제어하고,
refetch와 invalidateQueries로 다시 가져올 시점을 관리한다.
```
