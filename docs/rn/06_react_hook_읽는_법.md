# React Hook 읽는 법

이 문서는 Dogether RN 프로젝트에서 사용하는 React Hook을 읽는 방법을 정리한 문서입니다.

Hook은 React 함수형 컴포넌트에서 상태, 생명주기, 서버 데이터, 전역 store, 화면 로직을 연결하는 핵심 문법입니다.

## Hook이란?

Hook은 `use`로 시작하는 함수입니다.

```tsx
useState()
useEffect()
useMemo()
useCallback()
useQuery()
useMutation()
useMainStore()
useMainScreen()
```

Hook은 함수형 컴포넌트에 React 기능을 연결해줍니다.

iOS로 비유하면 다음 역할들이 섞여 있습니다.

| Hook | iOS에 빗대면 |
| --- | --- |
| `useState` | ViewController의 private state, SwiftUI `@State` |
| `useEffect` | `viewDidLoad`, `viewDidAppear`, `deinit` 일부 |
| `useMemo` | lazy property, 계산 결과 캐시 |
| `useCallback` | 재사용되는 closure |
| custom hook | ViewModel |
| React Query hook | async ViewModel, repository cache |
| Zustand store hook | ObservableObject, 전역 store |

## Hook의 기본 규칙

Hook은 반드시 규칙을 지켜야 합니다.

### 1. 컴포넌트 최상위에서 호출한다

좋은 예:

```tsx
export function MainScreen() {
  const { currentGroup } = useMainScreen();
  const [visible, setVisible] = useState(false);

  if (!currentGroup) {
    return <Text>그룹 없음</Text>;
  }

  return <Text>{currentGroup.name}</Text>;
}
```

나쁜 예:

```tsx
if (currentGroup) {
  const [visible, setVisible] = useState(false);
}
```

조건문, 반복문, 중첩 함수 안에서 Hook을 호출하면 안 됩니다. React는 Hook 호출 순서로 상태를 기억하기 때문입니다.

### 2. 함수형 컴포넌트나 custom hook 안에서만 호출한다

좋은 예:

```tsx
export function useMainScreen() {
  const dateOffset = useMainStore((state) => state.dateOffset);
  return { dateOffset };
}
```

나쁜 예:

```tsx
function normalFunction() {
  const dateOffset = useMainStore((state) => state.dateOffset);
}
```

Hook을 사용하는 일반 로직은 `use...`로 시작하는 custom hook으로 빼는 것이 좋습니다.

## useState

`useState`는 컴포넌트 안에서 변하는 값을 저장합니다.

```tsx
const [groupSheetVisible, setGroupSheetVisible] = useState(false);
```

읽는 법:

| 부분 | 의미 |
| --- | --- |
| `groupSheetVisible` | 현재 상태값 |
| `setGroupSheetVisible` | 상태를 바꾸는 함수 |
| `false` | 초기값 |

값이 바뀌면 컴포넌트가 다시 렌더링됩니다.

```tsx
setGroupSheetVisible(true);
```

Dogether RN 예시:

```tsx
const [selectedResult, setSelectedResult] = useState<ReviewResult | null>(null);
const [feedback, setFeedback] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

이 값들은 리뷰 화면 안에서만 필요한 local state입니다.

## useState를 쓰는 기준

`useState`는 한 화면 안에서만 필요한 값에 사용합니다.

| 상태 | 위치 |
| --- | --- |
| 그룹 선택 bottom sheet 열림 여부 | `MainScreen`의 `useState` |
| 리뷰 승인/거절 선택값 | `useReviewScreen`의 `useState` |
| 거절 사유 입력값 | `useReviewScreen`의 `useState` |
| 그룹명 input focus 여부 | 그룹 생성 화면 local state |

여러 화면이 공유해야 하는 상태라면 Zustand store를 봅니다.

서버에서 가져오는 데이터라면 React Query hook을 봅니다.

## 함수형 업데이트

이전 state를 기준으로 다음 state를 만들 때는 함수형 업데이트가 안전합니다.

```tsx
setCount((prev) => prev + 1);
```

Zustand에서도 비슷한 패턴이 보입니다.

```ts
movePast: () => set((state) => ({ dateOffset: state.dateOffset - 1, filter: 'all' })),
```

뜻:

```text
현재 state를 받아서 dateOffset을 하나 줄인 새 상태를 만든다.
```

## useEffect

`useEffect`는 렌더링 이후 실행할 작업을 등록합니다.

```tsx
useEffect(() => {
  hydrate();
}, [hydrate]);
```

기본 형태:

```tsx
useEffect(() => {
  // 실행할 작업

  return () => {
    // cleanup
  };
}, [dependencies]);
```

의존성 배열은 언제 다시 실행할지 결정합니다.

| 형태 | 의미 |
| --- | --- |
| `[]` | 처음 mount된 뒤 한 번 실행 |
| `[value]` | `value`가 바뀔 때마다 실행 |
| 생략 | 렌더링마다 실행. 거의 쓰지 않음 |

## useEffect cleanup

`useEffect`에서 함수를 반환하면 cleanup입니다.

```tsx
useEffect(() => {
  let mounted = true;

  AppleAuthentication.isAvailableAsync().then((available) => {
    if (mounted) {
      setIsAppleLoginAvailable(available);
    }
  });

  return () => {
    mounted = false;
  };
}, []);
```

컴포넌트가 사라졌거나 effect가 다시 실행되기 직전에 cleanup이 실행됩니다.

iOS의 `deinit`, `removeObserver`, task cancel과 비슷한 감각입니다.

## Dogether의 useEffect 예시

`useReviewScreen`에서는 pending review가 더 없으면 다음 화면으로 이동합니다.

```tsx
useEffect(() => {
  if (!pendingReviewsQuery.isSuccess || currentReview) {
    return;
  }

  void (async () => {
    const groups = await groupUseCase.getGroups();
    showCompletedToast('완료, 검사가 완료되었어요');
    router.replace(groups.length > 0 ? '/main' : '/start');
  })();
}, [currentReview, groupUseCase, pendingReviewsQuery.isSuccess, showCompletedToast]);
```

읽는 순서:

```text
1. pending review query가 성공했는지 본다.
2. currentReview가 남아 있으면 아무것도 하지 않는다.
3. 더 이상 리뷰가 없으면 그룹 목록을 확인한다.
4. 완료 toast를 띄운다.
5. 그룹이 있으면 main, 없으면 start로 이동한다.
```

## useMemo

`useMemo`는 계산 결과나 객체 생성을 재사용합니다.

```tsx
const reviewUseCase = useMemo(() => new ReviewUseCase(createReviewRepository()), []);
```

뜻:

```text
처음 렌더링 때 ReviewUseCase를 만들고,
이후 렌더링에서는 같은 인스턴스를 재사용한다.
```

Dogether RN에서는 UseCase 인스턴스를 만들 때 자주 사용합니다.

```tsx
const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
```

화면이 다시 렌더링될 때마다 UseCase를 새로 만들 필요가 없기 때문입니다.

## useCallback

`useCallback`은 함수를 재사용합니다.

```tsx
useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []),
);
```

여기서는 Android hardware back 이벤트를 막는 함수를 안정적으로 재사용하기 위해 `useCallback`을 사용합니다.

`useMemo`와 `useCallback`은 비슷합니다.

| Hook | 재사용하는 것 |
| --- | --- |
| `useMemo` | 값, 객체, 계산 결과 |
| `useCallback` | 함수 |

## useRef

`useRef`는 값이 바뀌어도 렌더링을 일으키지 않는 참조 저장소입니다.

```tsx
const inputRef = useRef<TextInput>(null);
```

주로 다음 상황에서 씁니다.

| 용도 | 예시 |
| --- | --- |
| native component 참조 | TextInput focus |
| timer id 보관 | setTimeout/clearTimeout |
| 이전 값 기억 | previous value |

현재 Dogether RN의 핵심 흐름에서는 `useState`, `useEffect`, `useMemo`, `useCallback`이 더 자주 보입니다.

## Custom Hook

Custom hook은 여러 Hook을 조합해 화면 로직을 분리한 함수입니다.

이름은 `use`로 시작합니다.

```tsx
export function useMainScreen() {
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const groupsQuery = useGroupsQuery();

  return {
    selectedGroupId,
    groupsQuery,
  };
}
```

iOS로 비유하면 ViewModel에 가깝습니다.

```text
Screen
  -> custom hook
    -> useState
    -> useEffect
    -> React Query
    -> Zustand
    -> UseCase
```

## Custom Hook을 쓰는 이유

화면 컴포넌트 안에 모든 로직을 넣으면 JSX를 읽기 어려워집니다.

그래서 Dogether RN은 화면 로직을 hook으로 분리합니다.

```text
MainScreen
  -> useMainScreen()

OnboardingScreen
  -> useOnboarding()

ReviewScreen
  -> useReviewScreen()

SettingsScreen
  -> useSettingsScreen()
```

Screen은 UI와 이벤트 연결에 집중하고, hook은 상태 계산과 비동기 작업을 담당합니다.

## useMainScreen 읽는 법

`useMainScreen`은 메인 화면의 ViewModel처럼 읽으면 됩니다.

흐름:

```text
useMainScreen()
  -> Zustand에서 selectedGroupId, dateOffset, filter 읽기
  -> useGroupsQuery()로 그룹 목록 조회
  -> currentGroup 계산
  -> 선택된 그룹이 유효한지 useEffect로 보정
  -> 날짜 이동 가능 여부 계산
  -> useMyTodosQuery()로 현재 날짜의 투두 조회
  -> filter에 맞는 투두 목록 계산
  -> MainScreen이 바로 쓸 값 반환
```

`return` 객체가 중요합니다.

```tsx
return {
  currentGroup,
  groupsQuery,
  todosQuery,
  sheetStatus,
  visibleTodos,
  filteredTodos,
  canGoPast,
  canGoFuture,
};
```

이 return 값이 `MainScreen`의 입력값입니다.

## useOnboarding 읽는 법

`useOnboarding`은 로그인 화면의 ViewModel처럼 읽으면 됩니다.

흐름:

```text
useOnboarding()
  -> 세션 store의 login action 준비
  -> AuthUseCase 생성
  -> loginError local state 준비
  -> Apple/Kakao 로그인 가능 여부 확인
  -> demo/kakao/apple mutation 정의
  -> Screen이 쓸 값과 mutation 반환
```

`OnboardingScreen`은 SDK나 repository를 직접 알지 않습니다.

```tsx
const {
  demoLoginMutation,
  kakaoLoginMutation,
  appleLoginMutation,
  loginError,
} = useOnboarding();
```

화면은 버튼을 mutation에 연결만 합니다.

## useReviewScreen 읽는 법

`useReviewScreen`은 리뷰 화면의 상태와 제출 흐름을 담당합니다.

흐름:

```text
useReviewScreen()
  -> pendingReviewsQuery로 리뷰 큐 조회
  -> selectedResult, feedback, modal state 관리
  -> Android hardware back 방지
  -> 리뷰가 끝나면 main/start로 이동
  -> approve/reject 선택 함수 제공
  -> submit에서 reviewUseCase 호출
  -> 관련 query invalidate
```

이 hook의 return 값은 ReviewScreen이 그대로 UI에 연결할 값과 이벤트입니다.

```tsx
return {
  currentReview,
  selectedResult,
  feedback,
  rejectModalVisible,
  canSubmit,
  selectApprove,
  openRejectModal,
  submit,
};
```

## React Query Hook

`useQuery`는 서버 데이터를 읽습니다.

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
| `queryKey` | React Query 캐시 주소 |
| `queryFn` | 실제 데이터를 가져오는 함수 |
| `data` | 성공 데이터 |
| `isLoading` | 처음 불러오는 중 |
| `isError` | 실패 여부 |
| `refetch` | 다시 요청 |

같은 `queryKey`를 쓰면 같은 서버 상태로 취급됩니다.

## useMutation

`useMutation`은 서버 상태를 바꾸는 작업에 사용합니다.

로그인, 투두 생성, 리뷰 제출처럼 "쓰기" 작업에 어울립니다.

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
| `mutate()` | mutation 시작 |
| `isPending` | 진행 중 여부 |

화면에서는 보통 버튼에 연결합니다.

```tsx
onPress={() => demoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
```

## useQueryClient와 invalidateQueries

`useQueryClient`는 React Query의 전역 query client를 가져옵니다.

```tsx
const queryClient = useQueryClient();
```

데이터가 바뀐 뒤 기존 캐시를 최신화하고 싶을 때 `invalidateQueries`를 사용합니다.

```tsx
await queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
```

뜻:

```text
pending-reviews query는 낡았으니 다시 가져와야 한다고 표시한다.
```

`useReviewScreen`에서는 리뷰 제출 후 아래 query를 무효화합니다.

```tsx
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['pending-reviews'] }),
  queryClient.invalidateQueries({ queryKey: ['launch-flow'] }),
]);
```

리뷰 큐와 앱 시작 분기 모두 최신 상태가 되어야 하기 때문입니다.

## Zustand Store Hook

Zustand store도 hook처럼 사용합니다.

```tsx
const dateOffset = useMainStore((state) => state.dateOffset);
const movePast = useMainStore((state) => state.movePast);
```

`(state) => state.dateOffset`는 selector입니다.

뜻:

```text
mainStore 전체 state 중 dateOffset만 구독한다.
```

필요한 값만 selector로 꺼내면 불필요한 리렌더를 줄일 수 있습니다.

## Hook에서 파생 상태 만들기

기존 state나 query data로 계산할 수 있는 값은 별도 state로 만들지 않는 것이 좋습니다.

```tsx
const currentReview = pendingReviewsQuery.data?.[0] ?? null;

const canSubmit =
  selectedResult === 'APPROVE'
    ? !isSubmitting
    : selectedResult === 'REJECT'
      ? feedback.trim().length > 0 && !isSubmitting
      : false;
```

`currentReview`, `canSubmit`은 별도로 저장하지 않고 매 렌더링 때 계산합니다.

이런 값을 파생 상태라고 볼 수 있습니다.

## Hook output 읽는 법

Custom hook의 마지막 `return`은 매우 중요합니다.

```tsx
return {
  pendingReviewsQuery,
  currentReview,
  selectedResult,
  feedback,
  canSubmit,
  selectApprove,
  openRejectModal,
  submit,
};
```

이 객체는 화면 컴포넌트가 사용할 입력값과 이벤트 목록입니다.

화면에서 이렇게 꺼냅니다.

```tsx
const {
  currentReview,
  selectedResult,
  canSubmit,
  submit,
} = useReviewScreen();
```

Hook을 읽을 때는 처음부터 모든 내부 구현을 보려 하기보다, 먼저 return 객체를 보고 "이 hook이 화면에 무엇을 제공하는가"를 파악하면 좋습니다.

## Hook 파일 읽는 순서

Hook 파일은 아래 순서로 읽으면 좋습니다.

```text
1. import를 본다.
   -> 어떤 query, store, usecase를 쓰는지 확인

2. 상수와 helper를 본다.
   -> 화면 전용 계산 규칙 확인

3. hook 함수 안의 useState를 본다.
   -> local UI state 확인

4. query와 store selector를 본다.
   -> 서버 상태와 전역 상태 확인

5. useMemo로 만든 UseCase를 본다.
   -> 어떤 service 계층을 호출하는지 확인

6. useEffect/useFocusEffect를 본다.
   -> 화면 생명주기와 side effect 확인

7. 이벤트 함수들을 본다.
   -> 버튼이나 입력 이벤트가 무엇을 바꾸는지 확인

8. return 객체를 본다.
   -> Screen에 공개되는 값과 이벤트 확인
```

## Screen에서 Hook 읽는 법

Screen 파일에서는 hook 호출부를 먼저 봅니다.

```tsx
const {
  groupsQuery,
  todosQuery,
  currentGroup,
  filteredTodos,
  canGoPast,
  canGoFuture,
} = useMainScreen();
```

이 부분을 보면 화면이 어떤 데이터를 필요로 하는지 알 수 있습니다.

그다음 JSX에서 이 값들이 어디로 전달되는지 봅니다.

```tsx
<MainPanel
  filteredTodos={filteredTodos}
  canGoPast={canGoPast}
  canGoFuture={canGoFuture}
/>
```

이렇게 보면 화면 로직과 UI 연결이 분리되어 보입니다.

## 자주 헷갈리는 점

### useState vs Zustand

```text
한 화면 안에서만 필요하면 useState
여러 화면이 공유하면 Zustand
```

### useEffect vs useQuery

```text
서버 데이터를 읽는 작업이면 useQuery
렌더링 이후 외부 시스템과 동기화하는 작업이면 useEffect
```

서버 조회를 매번 `useEffect + useState`로 직접 만들 필요는 없습니다. Dogether RN에서는 서버 데이터 조회를 React Query로 처리합니다.

### useMemo는 상태 저장소가 아니다

`useMemo`는 계산 결과를 재사용하는 도구입니다. 사용자가 바꾸는 값은 `useState`나 store에 둡니다.

### custom hook은 화면이 아니다

custom hook은 JSX를 반환하지 않습니다. 화면이 쓸 값과 함수를 반환합니다.

## Dogether RN에서 자주 보는 Hook 패턴

### 화면 로직 hook

```text
useMainScreen
useOnboarding
useReviewScreen
useSettingsScreen
```

Screen이 사용할 상태와 이벤트를 정리합니다.

### 서버 query hook

```text
useGroupsQuery
useMyTodosQuery
useProfileQuery
usePendingReviewsQuery
```

서버 데이터를 읽습니다.

### Store hook

```text
useSessionStore
useMainStore
useReviewToastStore
```

앱 전역 UI 상태를 읽거나 바꿉니다.

### Navigation side effect

```tsx
router.replace('/main');
router.push('/certify');
```

Hook 안의 effect나 event handler에서 화면 이동을 처리합니다.

## 한 줄 요약

```text
Hook은 함수형 컴포넌트의 상태와 생명주기, 서버 데이터, 전역 store를 연결하는 장치이고,
Dogether RN에서는 Screen이 custom hook을 호출하고,
custom hook이 useState, useEffect, React Query, Zustand, UseCase를 조합해
화면이 바로 쓸 값과 이벤트를 반환한다.
```
