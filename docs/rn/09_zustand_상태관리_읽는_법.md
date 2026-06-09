# Zustand 상태관리 읽는 법

이 문서는 Dogether RN 프로젝트에서 `Zustand` store를 읽는 방법을 정리한 문서입니다.

Zustand는 React Native 앱 안에서 여러 화면이 공유해야 하는 UI 상태를 담는 전역 상태 저장소입니다.

## 상태를 먼저 나누기

React Native 앱의 상태는 먼저 세 종류로 나누면 쉽습니다.

| 상태 종류 | 사용 도구 | 예시 |
| --- | --- | --- |
| 화면 안에서만 쓰는 상태 | `useState` | modal 열림, input focus, 임시 입력값 |
| 여러 화면이 공유하는 UI 상태 | Zustand | 세션, 선택 그룹, 인증 draft, 리뷰 toast |
| 서버에서 가져오는 데이터 | React Query | 그룹 목록, 투두 목록, 프로필, 랭킹 |

간단히:

```text
한 화면 안에서만 필요하면 useState
여러 화면이 공유하면 Zustand
서버에서 가져오면 React Query
```

## Zustand가 필요한 이유

React 컴포넌트는 부모가 자식에게 props를 내려줄 수 있습니다.

하지만 깊은 화면 구조에서 여러 곳이 같은 값을 필요로 하면 props 전달이 복잡해집니다.

```text
Screen
└── Section
    └── Card
        └── Button
```

맨 아래 `Button`이 로그인 세션이나 현재 선택 그룹을 알아야 한다고 해서 모든 중간 컴포넌트가 props를 받아 전달하면 코드가 지저분해집니다.

Zustand store는 화면 바깥에 있는 전역 상태 저장소입니다.

```text
Component
  -> useMainStore(selector)
  -> 필요한 상태만 읽기
```

## 이 프로젝트의 store 목록

`src/stores` 아래에 Zustand store가 있습니다.

| 파일 | 역할 |
| --- | --- |
| `sessionStore.ts` | 로그인 세션, 세션 복원, 로그아웃 |
| `mainStore.ts` | 메인 화면의 선택 그룹, 날짜 offset, 필터 |
| `startFlowStore.ts` | 그룹 생성/참여 완료 화면 payload |
| `certificationDraftStore.ts` | 인증 사진 화면과 내용 입력 화면 사이의 draft |
| `certificationViewerStore.ts` | 인증 상세 viewer context와 선택 index |
| `reviewToastStore.ts` | 리뷰 완료 toast 메시지 |

각 store는 특정 플로우의 UI 상태를 책임집니다.

## Zustand 기본 구조

Zustand store는 보통 세 부분으로 읽습니다.

```tsx
type MainState = {
  selectedGroupId: number | null;
  dateOffset: number;
  setSelectedGroupId: (groupId: number | null) => void;
};

export const useMainStore = create<MainState>((set) => ({
  selectedGroupId: null,
  dateOffset: 0,
  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
}));
```

읽는 순서:

```text
1. State type
   -> store가 어떤 값과 action을 가지는지 본다.

2. Initial state
   -> 처음 값이 무엇인지 본다.

3. Actions
   -> 어떤 함수가 상태를 어떻게 바꾸는지 본다.
```

## create

Zustand store는 `create`로 만듭니다.

```tsx
export const useMainStore = create<MainState>((set) => ({
  ...
}));
```

읽는 법:

```text
MainState 모양을 가진 store를 만들고,
그 store를 useMainStore라는 hook처럼 사용한다.
```

`set`은 Zustand가 넘겨주는 상태 변경 함수입니다.

```tsx
set({ selectedGroupId, dateOffset: 0 });
```

이렇게 호출하면 store 상태가 바뀌고, 해당 값을 구독하던 컴포넌트가 다시 렌더링됩니다.

## selector

컴포넌트에서는 selector로 필요한 값만 꺼냅니다.

```tsx
const dateOffset = useMainStore((state) => state.dateOffset);
const movePast = useMainStore((state) => state.movePast);
```

`(state) => state.dateOffset`는 전체 store state 중 `dateOffset`만 읽겠다는 뜻입니다.

좋은 패턴:

```tsx
const selectedGroupId = useMainStore((state) => state.selectedGroupId);
```

주의할 패턴:

```tsx
const mainStore = useMainStore();
```

store 전체를 구독하면 store 안의 어떤 값이 바뀌어도 컴포넌트가 다시 렌더링될 수 있습니다.

## state와 action

Store에는 값과 action이 같이 들어갑니다.

```tsx
type MainState = {
  selectedGroupId: number | null;
  dateOffset: number;
  filter: TodoFilter;
  setSelectedGroupId: (groupId: number | null) => void;
  movePast: () => void;
  moveFuture: () => void;
  setFilter: (filter: TodoFilter) => void;
};
```

| 종류 | 예시 | 의미 |
| --- | --- | --- |
| state | `selectedGroupId` | 현재 값 |
| state | `dateOffset` | 오늘 기준 날짜 위치 |
| action | `setSelectedGroupId` | 선택 그룹 변경 |
| action | `movePast` | 날짜를 과거로 이동 |
| action | `setFilter` | 필터 변경 |

화면에서는 state를 읽고 action을 이벤트에 연결합니다.

```tsx
const filter = useMainStore((state) => state.filter);
const setFilter = useMainStore((state) => state.setFilter);
```

## `set({ ... })`

가장 단순한 상태 변경은 객체를 바로 넘기는 방식입니다.

```tsx
set({ sheetExpanded });
```

뜻:

```text
sheetExpanded 값을 새 값으로 교체한다.
```

`reviewToastStore`는 단순한 store라 이 패턴만 사용합니다.

```tsx
export const useReviewToastStore = create<ReviewToastState>((set) => ({
  message: null,
  showCompletedToast: (message) => set({ message }),
  clearToast: () => set({ message: null }),
}));
```

## `set((state) => ...)`

현재 상태를 참고해서 다음 상태를 만들어야 하면 함수 형태를 씁니다.

```tsx
movePast: () => set((state) => ({ dateOffset: state.dateOffset - 1, filter: 'all' })),
```

읽는 법:

```text
현재 state를 받아서
dateOffset은 하나 줄이고
filter는 all로 초기화한다.
```

이전 값을 기준으로 업데이트할 때는 이 방식이 안전합니다.

## sessionStore

`sessionStore`는 로그인 세션을 관리합니다.

담당:

| 값/Action | 의미 |
| --- | --- |
| `hydrated` | MMKV에서 세션 복원이 끝났는지 |
| `accessToken` | API 인증 토큰 |
| `refreshToken` | 세션 갱신 토큰 |
| `userName` | 사용자 이름 |
| `loginType` | `apple`, `kakao`, `demo` |
| `hasCompletedStartFlow` | 그룹 시작 플로우 완료 여부 |
| `hydrate()` | 저장소에서 세션 복원 |
| `login()` | 로그인 성공 세션 저장 |
| `completeStartFlow()` | 그룹 생성/참여 플로우 완료 처리 |
| `logout()` | 세션 제거 |

앱 시작 시 흐름:

```text
SplashScreen
  -> useSessionStore((state) => state.hydrate)
  -> hydrate()
  -> MMKV readSession()
  -> Zustand state 갱신
  -> hydrated true
  -> useLaunchFlowQuery 실행 가능
```

`hydrated`가 false인 동안에는 저장소를 아직 다 읽지 않은 상태입니다. 이때는 로그인 여부를 단정하면 안 됩니다.

## sessionStore와 MMKV

`sessionStore`는 메모리 상태와 MMKV 저장소를 함께 다룹니다.

로그인:

```text
login(payload)
  -> saveSession(session)
  -> set(session)
```

로그아웃:

```text
logout()
  -> clearSession()
  -> set(accessToken: null, ...)
```

즉 `sessionStore`는 앱 실행 중 빠르게 읽는 메모리 상태이고, MMKV는 앱을 껐다 켜도 남는 영구 저장소입니다.

## mainStore

`mainStore`는 메인 화면에서 오래 유지해야 하는 UI 상태를 관리합니다.

```tsx
type MainState = {
  selectedGroupId: number | null;
  dateOffset: number;
  filter: TodoFilter;
  sheetExpanded: boolean;
};
```

| 상태 | 의미 |
| --- | --- |
| `selectedGroupId` | 현재 보고 있는 그룹 |
| `dateOffset` | 오늘 기준 날짜 이동값. `0`은 오늘, `-1`은 어제 |
| `filter` | 전체/대기/승인/거절 필터 |
| `sheetExpanded` | 메인 패널 확장 여부 |

메인 화면에서 서버 데이터는 React Query가 담당합니다.

```text
그룹 목록 -> useGroupsQuery
투두 목록 -> useMyTodosQuery
선택 그룹 id -> mainStore
날짜 offset -> mainStore
필터 -> mainStore
```

## mainStore의 상태 초기화

그룹을 바꾸면 날짜와 필터도 초기화합니다.

```tsx
setSelectedGroupId: (selectedGroupId) => {
  saveLastSelectedGroupId(selectedGroupId);
  set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
},
```

읽는 법:

```text
선택 그룹을 저장소에 저장하고,
메인 화면 UI 상태를 오늘/전체 필터/접힘 상태로 초기화한다.
```

이렇게 하지 않으면 이전 그룹에서 보던 날짜나 필터가 새 그룹에도 섞일 수 있습니다.

## certificationDraftStore

`certificationDraftStore`는 인증 작성 중간 상태를 저장합니다.

인증 작성은 두 route로 나뉩니다.

```text
/certify
  -> 사진 선택

/certify-content
  -> 인증 내용 입력
```

두 화면이 같은 draft를 공유해야 하므로 Zustand store를 사용합니다.

```tsx
type CertificationDraft = {
  todoId: number | null;
  groupId: number | null;
  date: string;
  todoContent: string;
  imageUri: string | null;
  content: string;
};
```

흐름:

```text
TodoRow
  -> router.push('/certify', params)
  -> CertificationImageScreen
  -> startDraft()
  -> setImageUri()
  -> router.push('/certify-content')
  -> CertificationContentScreen
  -> setContent()
  -> certifyTodo()
  -> clearDraft()
```

## draft를 불변하게 업데이트하기

draft 안의 일부 필드만 바꿀 때는 기존 draft를 복사한 뒤 필요한 값만 바꿉니다.

```tsx
setImageUri: (imageUri) =>
  set((state) => ({
    draft: {
      ...state.draft,
      imageUri,
    },
  })),
```

`...state.draft`는 기존 draft 값을 펼쳐 복사한다는 뜻입니다.

```text
기존 todoId/groupId/date/content는 유지하고
imageUri만 새 값으로 바꾼다.
```

React/RN에서는 객체를 직접 수정하기보다 새 객체로 교체하는 패턴이 중요합니다.

## certificationViewerStore

`certificationViewerStore`는 인증 상세 화면이 어떤 인증 목록을 보여줄지 저장합니다.

```tsx
type CertificationViewerContext = {
  source: 'mine' | 'ranking';
  title: string;
  groupId: number | null;
  date: string;
  todoIds: number[];
  todos: Todo[];
};
```

예를 들어 메인 화면에서 내 인증 상세를 열면:

```text
TodoRow
  -> openViewer({
       source: 'mine',
       title: '내 인증 정보',
       groupId,
       date,
       todoIds,
       selectedIndex
     })
  -> router.push('/certification')
```

인증 상세 화면은 route params가 아니라 viewer store의 context를 보고 어떤 데이터를 보여줄지 판단합니다.

## startFlowStore

`startFlowStore`는 그룹 생성/참여 완료 화면에 필요한 payload를 저장합니다.

```tsx
type CompletePayload = {
  kind: 'create' | 'join';
  targetGroupId: number;
  groupName: string;
  joinCode: string;
  durationLabel?: string;
  memberCountLabel?: string;
  startDateLabel?: string;
  endDateLabel?: string;
};
```

흐름:

```text
그룹 생성 or 참여 성공
  -> setCompletePayload(...)
  -> router.push('/complete')
  -> CompleteScreen에서 payload 표시
  -> 홈으로 가기
  -> clearCompletePayload()
```

`/complete`에 payload 없이 들어오면 잘못된 진입이므로 `/start`로 돌려보냅니다.

## reviewToastStore

`reviewToastStore`는 리뷰 완료 toast 메시지를 저장합니다.

```tsx
type ReviewToastState = {
  message: string | null;
  showCompletedToast: (message: string) => void;
  clearToast: () => void;
};
```

리뷰가 끝나면:

```text
useReviewScreen
  -> showCompletedToast('완료, 검사가 완료되었어요')
  -> router.replace('/main')
  -> MainScreen
  -> ReviewToast
  -> message 표시
```

toast처럼 화면 이동 후 잠깐 보여줘야 하는 UI 상태는 store에 두면 편합니다.

## Zustand와 React Query 역할 구분

가장 중요한 기준입니다.

| 질문 | 답 |
| --- | --- |
| 서버에서 다시 받아올 수 있는 데이터인가? | React Query |
| 앱이 현재 보고 있는 조건인가? | Zustand |
| 여러 화면 단계에서 이어져야 하는 draft인가? | Zustand |
| API 성공 후 최신화해야 하는 목록인가? | React Query invalidate |

예:

```text
그룹 목록 -> React Query
현재 선택한 그룹 id -> Zustand

투두 목록 -> React Query
날짜 offset과 필터 -> Zustand

인증 API 결과 -> React Query invalidate
인증 작성 중인 imageUri/content -> Zustand
```

## 화면에서 store 읽는 법

화면이나 hook에서는 필요한 값만 selector로 꺼냅니다.

```tsx
const selectedGroupId = useMainStore((state) => state.selectedGroupId);
const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
```

읽는 순서:

```text
1. 어떤 store를 쓰는지 본다.
2. selector가 어떤 값을 꺼내는지 본다.
3. state인지 action인지 구분한다.
4. action이 어디서 호출되는지 본다.
```

예:

```tsx
const logout = useSessionStore((state) => state.logout);
```

이 값은 상태가 아니라 action입니다. 버튼이나 에러 처리에서 호출됩니다.

## Store 파일 읽는 순서

처음 보는 store는 아래 순서로 읽으면 좋습니다.

```text
1. 파일 이름을 본다.
   -> 어떤 플로우의 상태인지 추측

2. type State를 본다.
   -> state와 action 목록 확인

3. initial state를 본다.
   -> 처음 값 확인

4. create(...) 안을 본다.
   -> action이 상태를 어떻게 바꾸는지 확인

5. storage를 읽고 쓰는지 본다.
   -> MMKV와 연결된 영구 상태인지 확인

6. 사용처를 검색한다.
   -> 어떤 화면/hook에서 읽고 쓰는지 확인
```

## Store 사용처 찾는 법

store가 어디서 쓰이는지 찾으려면 store hook 이름을 검색합니다.

```bash
rg "useMainStore"
rg "useSessionStore"
rg "useCertificationDraftStore"
```

보통 다음 위치에서 사용됩니다.

```text
src/screens
src/hooks
src/components
```

store action이 언제 호출되는지 찾으면 플로우가 보입니다.

## 자주 헷갈리는 점

### Zustand는 서버 캐시가 아니다

서버에서 가져온 목록 데이터를 Zustand에 오래 담아두기보다 React Query로 관리합니다.

### Store는 화면 밖에 있다

컴포넌트가 unmount되어도 Zustand store 값은 자동으로 사라지지 않습니다. 그래서 draft나 payload는 필요할 때 `clearDraft`, `clearCompletePayload`로 정리해야 합니다.

### 저장소와 store는 다르다

```text
Zustand store -> 앱 실행 중 메모리 상태
MMKV storage -> 앱을 껐다 켜도 남는 영구 저장소
```

`sessionStore`와 `mainStore` 일부 상태는 MMKV와 동기화됩니다.

### selector는 구독이다

```tsx
useMainStore((state) => state.filter)
```

이 컴포넌트는 `filter` 변화를 구독합니다. `filter`가 바뀌면 다시 렌더링됩니다.

## 한 줄 요약

```text
Zustand는 여러 화면이 공유해야 하는 UI 상태를 담는 store이고,
Dogether RN에서는 sessionStore가 로그인 세션,
mainStore가 메인 화면 조건,
certificationDraftStore가 인증 작성 중간값,
certificationViewerStore가 인증 상세 context,
startFlowStore와 reviewToastStore가 화면 이동 후 필요한 임시 상태를 담당한다.
```
