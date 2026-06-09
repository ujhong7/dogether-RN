# Expo Router 화면이동 읽는 법

이 문서는 Dogether RN 프로젝트에서 화면 이동과 라우팅 구조를 읽는 방법을 정리한 문서입니다.

Dogether RN은 `Expo Router`를 사용합니다. Expo Router는 `app` 폴더의 파일 구조를 기반으로 route를 자동으로 만드는 파일 기반 라우터입니다.

## Expo Router를 읽는 기본 감각

iOS에서는 보통 `UINavigationController`, `UITabBarController`, `present`, `Coordinator`로 화면 이동을 관리합니다.

Expo Router에서는 `app` 폴더의 파일 이름이 route가 됩니다.

```text
app/
  index.tsx          -> /
  splash.tsx         -> /splash
  onboarding.tsx     -> /onboarding
  main.tsx           -> /main
  group-create.tsx   -> /group-create
  todo-write.tsx     -> /todo-write
```

즉 `app/main.tsx` 파일이 있으면 `/main` route가 생깁니다.

## 이 프로젝트의 route 구조

Dogether RN의 주요 route는 다음과 같습니다.

| 파일 | route | 역할 |
| --- | --- | --- |
| `app/index.tsx` | `/` | 루트 진입점 |
| `app/splash.tsx` | `/splash` | 앱 시작 분기 |
| `app/update.tsx` | `/update` | 강제 업데이트 |
| `app/onboarding.tsx` | `/onboarding` | 로그인/온보딩 |
| `app/start.tsx` | `/start` | 그룹이 없는 사용자의 시작 화면 |
| `app/group-add.tsx` | `/group-add` | 그룹 생성/참여 선택 |
| `app/group-create.tsx` | `/group-create` | 그룹 생성 |
| `app/group-join.tsx` | `/group-join` | 그룹 참여 |
| `app/complete.tsx` | `/complete` | 그룹 생성/참여 완료 |
| `app/main.tsx` | `/main` | 메인 |
| `app/ranking.tsx` | `/ranking` | 랭킹 |
| `app/statistics.tsx` | `/statistics` | 통계 |
| `app/my.tsx` | `/my` | 마이페이지 |
| `app/settings.tsx` | `/settings` | 설정 |
| `app/todo-write.tsx` | `/todo-write` | 투두 작성 |
| `app/review.tsx` | `/review` | 리뷰 |
| `app/certification-list.tsx` | `/certification-list` | 인증 목록 |
| `app/certification.tsx` | `/certification` | 인증 상세 |
| `app/certify.tsx` | `/certify` | 인증 사진 선택 |
| `app/certify-content.tsx` | `/certify-content` | 인증 내용 입력 |

처음에는 `app` 폴더만 봐도 앱에 어떤 화면이 있는지 대략 알 수 있습니다.

## `app` 파일과 `src/screens` 파일

Dogether RN에서는 route 파일과 실제 화면 구현을 분리합니다.

예:

```tsx
// app/main.tsx
import { MainScreen } from '../src/screens/main';

export default MainScreen;
```

실제 화면은 `src/screens/main/MainScreen.tsx`에 있습니다.

```text
app/main.tsx
  -> /main route를 만든다

src/screens/main/MainScreen.tsx
  -> 실제 메인 화면 UI와 로직을 가진다
```

이렇게 나누면 `app` 폴더는 라우팅 지도처럼 읽을 수 있고, 화면 구현은 `src/screens`에서 따로 관리할 수 있습니다.

## `_layout.tsx`

`app/_layout.tsx`는 `app` 폴더 안 화면들이 공통으로 거치는 부모 레이아웃입니다.

```tsx
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="main" />
      </Stack>
    </QueryClientProvider>
  );
}
```

구조:

```text
RootLayout
└── QueryClientProvider
    ├── StatusBar
    └── Stack
        ├── index
        ├── splash
        ├── onboarding
        ├── main
        └── ...
```

iOS로 비유하면 `UINavigationController`를 만들고, 앱 전체 의존성을 주입하는 위치에 가깝습니다.

## Stack

`Stack`은 화면을 스택으로 쌓는 네비게이션 방식입니다.

iOS의 `UINavigationController`와 비슷합니다.

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="splash" />
  <Stack.Screen name="main" />
</Stack>
```

`headerShown: false`는 Expo Router 기본 navigation header를 숨깁니다. 이 프로젝트는 각 화면에서 직접 헤더 UI를 만들기 때문에 기본 헤더를 숨깁니다.

특정 화면만 옵션을 줄 수도 있습니다.

```tsx
<Stack.Screen name="review" options={{ gestureEnabled: false }} />
```

`review` 화면은 검사 완료 전까지 빠져나가면 안 되므로 iOS swipe back gesture를 막습니다.

## 기본 화면 이동

화면 이동은 `expo-router`의 `router`를 사용합니다.

```tsx
import { router } from 'expo-router';
```

자주 쓰는 메서드는 다음과 같습니다.

| 메서드 | 의미 | iOS에 빗대면 |
| --- | --- | --- |
| `router.push('/path')` | 새 화면을 스택에 push | `navigationController.pushViewController` |
| `router.replace('/path')` | 현재 화면을 다른 화면으로 교체 | root/현재 화면 교체 |
| `router.back()` | 뒤로가기 | `popViewController` |

예:

```tsx
router.push('/group-add');
router.replace('/main');
router.back();
```

## push

`push`는 새 화면을 스택에 쌓습니다.

```tsx
router.push('/todo-write');
```

사용자가 뒤로가면 이전 화면으로 돌아올 수 있습니다.

프로젝트 예시:

```tsx
<Pressable style={styles.primaryAction} onPress={() => router.push('/todo-write')}>
  <Text>투두 작성하기</Text>
</Pressable>
```

메인 화면에서 투두 작성 화면으로 이동할 때는 자연스럽게 뒤로 돌아올 수 있어야 하므로 `push`가 어울립니다.

## replace

`replace`는 현재 화면을 목적지 화면으로 교체합니다.

```tsx
router.replace('/main');
```

뒤로가기로 이전 화면에 돌아오면 안 되는 흐름에서 사용합니다.

예:

| 상황 | 이유 |
| --- | --- |
| 로그인 성공 후 `/splash`로 이동 | 온보딩으로 뒤로가기 방지 |
| 스플래시에서 첫 화면 결정 | 스플래시로 뒤로가기 방지 |
| 인증 제출 성공 후 `/main` 이동 | 인증 작성 화면으로 뒤로가기 방지 |
| 그룹 생성 완료 후 `/main` 이동 | 완료 화면 재진입 방지 |

프로젝트 예시:

```tsx
router.replace('/splash');
router.replace('/main');
router.replace('/onboarding');
```

## back

`back`은 이전 화면으로 돌아갑니다.

```tsx
router.back();
```

주로 화면 상단 뒤로가기 버튼에서 사용합니다.

만약 이전 화면으로 돌아가면 안 되는 플로우라면 `replace`를 사용하거나, `gestureEnabled: false` 같은 옵션으로 이동을 제한합니다.

## Redirect

`Redirect`는 화면을 렌더링하지 않고 바로 다른 route로 보냅니다.

`app/index.tsx`에서 사용합니다.

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}
```

뜻:

```text
/ 로 들어오면 화면을 그리지 않고 /splash로 보낸다.
```

앱의 루트 경로를 스플래시로 연결하는 역할입니다.

## 앱 시작 화면 이동 흐름

앱이 켜질 때 흐름은 다음과 같습니다.

```text
/
  -> app/index.tsx
  -> Redirect /splash
  -> SplashScreen
  -> useLaunchFlowQuery()
  -> AppLaunchUseCase.decideNextRoute()
  -> router.replace(...)
```

`SplashScreen`은 `useLaunchFlowQuery` 결과에 따라 다음 화면으로 이동합니다.

```tsx
if (data === 'update') {
  router.replace('/update');
  return;
}

if (data === 'review') {
  router.replace('/review');
  return;
}

if (data === 'onboarding') {
  router.replace('/onboarding');
  return;
}

if (data === 'start') {
  router.replace('/start');
  return;
}

router.replace('/main');
```

분기 순서:

1. 강제 업데이트가 필요하면 `/update`
2. 처리할 리뷰가 있으면 `/review`
3. 로그인하지 않았으면 `/onboarding`
4. 참여한 그룹이 없으면 `/start`
5. 그 외에는 `/main`

`replace`를 쓰기 때문에 사용자가 뒤로가기로 스플래시에 돌아오지 않습니다.

## 로그인 후 이동

온보딩 화면에서 로그인에 성공하면 `/splash`로 이동합니다.

```tsx
onPress={() => demoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
```

로그인 후 바로 `/main`으로 가지 않고 `/splash`로 보내는 이유는, 스플래시에서 앱 상태를 다시 판단하기 위해서입니다.

```text
로그인 성공
  -> session store 저장
  -> /splash
  -> update/group/review 상태 확인
  -> 알맞은 첫 화면으로 이동
```

## route params 전달

화면 이동할 때 값을 같이 넘길 수 있습니다.

`TodoRow`에서 인증 사진 화면으로 이동할 때 params를 넘깁니다.

```tsx
router.push({
  pathname: '/certify',
  params: {
    todoId: String(todo.id),
    groupId: String(currentGroupId),
    date: queryDate,
    content: todo.content,
  },
});
```

이동 대상 화면에서는 `useLocalSearchParams`로 읽습니다.

```tsx
const params = useLocalSearchParams<{
  todoId?: string;
  groupId?: string;
  date?: string;
  content?: string;
}>();
```

읽는 법:

| param | 의미 |
| --- | --- |
| `todoId` | 인증할 투두 id |
| `groupId` | 현재 그룹 id |
| `date` | 인증할 날짜 |
| `content` | 투두 내용 |

route param은 문자열로 전달됩니다. 그래서 숫자로 써야 하는 값은 `Number(...)`로 바꿉니다.

```tsx
startDraft({
  todoId: Number(params.todoId),
  groupId: Number(params.groupId),
  date: params.date,
  todoContent: params.content,
});
```

## params와 store를 같이 쓰는 흐름

인증 작성은 두 화면으로 나뉩니다.

```text
/certify
  -> 인증 사진 선택

/certify-content
  -> 인증 내용 입력
```

첫 화면 `/certify`는 route params를 받아 인증 draft store를 시작합니다.

```text
TodoRow
  -> router.push('/certify', params)
  -> CertificationImageScreen
  -> useLocalSearchParams()
  -> certificationDraftStore.startDraft()
```

두 번째 화면 `/certify-content`는 route params를 다시 받지 않고, store에 저장된 draft를 이어받습니다.

```text
CertificationImageScreen
  -> setImageUri()
  -> router.push('/certify-content')
  -> CertificationContentScreen
  -> draft store에서 todoId/groupId/date/imageUri 읽기
```

화면이 여러 단계로 나뉘고 중간 입력값을 유지해야 할 때는 route params만 쓰기보다 store를 함께 사용합니다.

## query invalidate 후 이동

서버 상태가 바뀐 뒤 화면을 이동할 때는 React Query cache를 무효화하는 코드가 같이 나올 수 있습니다.

인증 제출 예:

```tsx
await challengeGroupUseCase.certifyTodo(...);
await queryClient.invalidateQueries({ queryKey: ['todos'] });
await queryClient.invalidateQueries({ queryKey: ['certification-list'] });
await queryClient.invalidateQueries({ queryKey: ['statistics'] });
clearDraft();
router.replace('/main');
```

읽는 순서:

```text
1. 인증 API 호출
2. 투두/인증목록/통계 query 무효화
3. draft 정리
4. 메인 화면으로 replace
```

화면 이동만 보는 것이 아니라, 이동 전에 어떤 데이터를 최신화하는지도 같이 봐야 합니다.

## 완료 화면 이동 흐름

그룹 생성/참여 완료 후에는 `/complete` 화면을 거칩니다.

`CompleteScreen`은 store에 저장된 완료 payload를 사용합니다.

```text
group create or join
  -> startFlowStore에 completePayload 저장
  -> /complete
  -> 홈으로 가기
  -> selectedGroupId 저장
  -> groups/todos query invalidate
  -> completeStartFlow
  -> router.replace('/main')
```

만약 `/complete`에 필요한 payload가 없으면 `/start`로 돌려보냅니다.

```tsx
useEffect(() => {
  if (!payload && !isLeavingToMain) {
    router.replace('/start');
  }
}, [isLeavingToMain, payload]);
```

이런 코드는 잘못된 경로 진입을 막는 guard 역할입니다.

## 뒤로가기 제한

리뷰 화면은 사용자가 리뷰를 끝내기 전까지 빠져나가면 안 됩니다.

그래서 두 가지 방식으로 막습니다.

### 1. iOS gesture 제한

`app/_layout.tsx`에서 `review` route 옵션을 줍니다.

```tsx
<Stack.Screen name="review" options={{ gestureEnabled: false }} />
```

### 2. Android hardware back 제한

`useReviewScreen`에서 `BackHandler`를 등록합니다.

```tsx
useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []),
);
```

`true`를 반환하면 Android 뒤로가기 이벤트를 처리한 것으로 보고 기본 뒤로가기를 막습니다.

## useFocusEffect

`useFocusEffect`는 화면이 포커스될 때 실행되는 effect입니다.

```tsx
useFocusEffect(
  useCallback(() => {
    // 화면에 포커스될 때 실행

    return () => {
      // 화면이 포커스를 잃을 때 실행
    };
  }, []),
);
```

iOS의 `viewWillAppear`, `viewWillDisappear`와 비슷한 감각으로 읽을 수 있습니다.

Dogether RN에서는 리뷰 화면의 Android back 제한에 사용합니다.

## 화면 이동 코드를 읽는 순서

화면 이동 코드를 볼 때는 아래 순서로 읽으면 좋습니다.

```text
1. app/*.tsx 파일을 본다.
   -> 이 route가 어떤 Screen에 연결되는지 확인

2. _layout.tsx에서 Stack.Screen 옵션을 본다.
   -> header, gesture 같은 네비게이션 옵션 확인

3. Screen 안에서 router.push/replace/back을 검색한다.
   -> 사용자가 어떤 행동을 하면 어디로 가는지 확인

4. route params를 넘기는지 확인한다.
   -> router.push({ pathname, params }) 찾기

5. 이동 대상에서 useLocalSearchParams를 찾는다.
   -> params를 어떻게 읽고 타입 변환하는지 확인

6. 이동 전에 store/query를 갱신하는지 확인한다.
   -> setSelectedGroupId, clearDraft, invalidateQueries 등 확인

7. 뒤로가기 제한이 있는지 확인한다.
   -> gestureEnabled, BackHandler, useFocusEffect 확인
```

## 자주 헷갈리는 점

### `app/main.tsx`에는 왜 코드가 거의 없나?

`app/main.tsx`는 route 진입점입니다. 실제 화면 구현은 `src/screens/main/MainScreen.tsx`에 있습니다.

### `replace`와 `push`는 언제 다르게 쓰나?

```text
돌아올 수 있어야 하면 push
돌아오면 안 되면 replace
```

### params는 왜 string으로 바꾸나?

route params는 URL/search params 성격이라 문자열로 다루는 것이 안전합니다. 숫자가 필요하면 이동 대상에서 `Number(...)`로 바꿉니다.

### 왜 로그인 후 main이 아니라 splash로 가나?

스플래시가 update, group, review 상태를 다시 판단하는 launch coordinator 역할을 하기 때문입니다.

### route params와 Zustand store는 어떻게 나누나?

```text
한 번 이동할 때 필요한 작은 값 -> route params
여러 화면 단계에서 이어져야 하는 draft -> Zustand store
```

## Dogether RN의 주요 이동 흐름

### 앱 시작

```text
/ -> /splash -> /update or /onboarding or /start or /review or /main
```

### 로그인

```text
/onboarding -> /splash -> /start or /review or /main
```

### 그룹 생성/참여

```text
/start -> /group-add -> /group-create or /group-join -> /complete -> /main
```

### 투두 작성

```text
/main -> /todo-write -> /main
```

### 인증

```text
/main -> /certify -> /certify-content -> /main
```

### 리뷰

```text
/splash -> /review -> /main or /start
```

## 한 줄 요약

```text
Expo Router에서는 app 폴더의 파일이 route가 되고,
_layout.tsx가 Stack과 공통 설정을 만들고,
router.push는 돌아올 수 있는 이동,
router.replace는 돌아오면 안 되는 이동,
useLocalSearchParams는 route params를 읽는 도구다.
```
