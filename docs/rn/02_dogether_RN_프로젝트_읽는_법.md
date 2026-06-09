# Dogether RN 프로젝트 읽는 법

이 문서는 React Native를 처음 학습하는 사람이 `dogether-RN` 프로젝트를 어떤 순서로 읽으면 되는지 설명합니다.

Dogether는 함께 쓰는 데일리 투두 챌린지 앱입니다. 사용자는 로그인하고, 그룹에 참여하거나 만들고, 날짜별 투두를 작성하고, 인증과 리뷰 흐름을 거쳐 그룹 안에서 진행 상황을 확인합니다.

## 큰 그림

이 프로젝트는 Expo Router 기반의 `app` 폴더와, 실제 앱 코드를 담는 `src` 폴더를 나누어 사용합니다.

```text
app/
  _layout.tsx              앱 전체 route와 Provider 설정
  index.tsx                루트 route
  splash.tsx               스플래시 route
  main.tsx                 메인 route
  ...

src/
  components/              공통 UI 컴포넌트
  config/                  환경 설정
  hooks/                   화면 로직
  lib/                     query client, storage, 날짜 유틸
  models/                  앱 내부 데이터 타입
  queries/                 React Query hook
  screens/                 실제 화면
  services/                UseCase, Repository, API
  stores/                  Zustand 전역 상태
  theme/                   색상
```

iOS식으로 빗대면 `app/`은 Coordinator와 route table에 가깝고, `src/screens`는 ViewController와 View가 합쳐진 화면 레이어에 가깝습니다. `src/hooks`는 ViewModel, `src/services`는 UseCase/Repository 계층에 가깝습니다.

## 먼저 읽을 파일

처음에는 아래 순서로 읽으면 좋습니다.

| 순서 | 파일 | 보는 이유 |
| --- | --- | --- |
| 1 | `package.json` | 사용 기술과 실행 스크립트 확인 |
| 2 | `app/_layout.tsx` | 앱 전체 Provider와 Stack route 목록 확인 |
| 3 | `app/index.tsx` | 루트 route가 어디로 보내는지 확인 |
| 4 | `app/splash.tsx` | 스플래시 화면 연결 확인 |
| 5 | `src/screens/splash/SplashScreen.tsx` | 앱 시작 화면이 query 결과로 어떻게 이동하는지 확인 |
| 6 | `src/queries/useLaunchFlowQuery.ts` | 첫 화면 판단을 React Query로 실행하는 방식 확인 |
| 7 | `src/services/usecases/appLaunchUseCase.ts` | update/onboarding/start/review/main 분기 조건 확인 |
| 8 | `src/stores/sessionStore.ts` | 로그인 세션을 앱이 어떻게 들고 있는지 확인 |
| 9 | `app/main.tsx` | `/main` route와 실제 메인 화면 연결 확인 |
| 10 | `src/screens/main/MainScreen.tsx` | 메인 화면 UI 구조 확인 |
| 11 | `src/hooks/useMainScreen.ts` | 메인 화면의 상태, query, 파생값 확인 |
| 12 | `src/services/repositories/index.ts` | Mock/API 구현체 선택 방식 확인 |
| 13 | `src/services/api/client.ts` | API base URL, token header, timeout 확인 |

이 순서로 보면 "앱 시작 -> 세션 복원 -> 첫 화면 결정 -> 메인 화면 데이터 조회" 흐름이 한 번에 이어집니다.

## 전체 데이터 흐름

화면에서 데이터까지 내려가는 흐름은 대체로 다음과 같습니다.

```text
app route
  -> Screen
    -> Hook
      -> Query / Store
        -> UseCase
          -> Repository contract
            -> API Repository or Mock Repository
              -> apiClient / local storage
```

예를 들어 메인 화면의 투두 목록은 아래처럼 이어집니다.

```text
app/main.tsx
  -> MainScreen
    -> useMainScreen()
      -> useMyTodosQuery()
        -> ChallengeGroupUseCase
          -> ChallengeGroupRepository
            -> ChallengeGroupRepositoryImpl or MockChallengeGroupRepository
```

처음부터 모든 파일을 읽으려고 하면 복잡합니다. 한 화면을 정하고 위에서 아래로 한 줄기만 따라가는 것이 좋습니다.

## iOS 개념으로 비유

| iOS에서 익숙한 개념 | RN 프로젝트에서 가까운 위치 | 예시 |
| --- | --- | --- |
| AppDelegate / SceneDelegate 일부 | `app/_layout.tsx` | 전역 Provider, Stack 설정 |
| Coordinator route table | `app/*.tsx` | `app/main.tsx`, `app/splash.tsx` |
| ViewController + View | `src/screens/**Screen.tsx` | `MainScreen`, `OnboardingScreen` |
| ViewModel | `src/hooks/use...ts` | `useMainScreen`, `useOnboarding` |
| 서버 상태 ViewModel | `src/queries/use...Query.ts` | `useGroupsQuery`, `useMyTodosQuery` |
| Singleton/shared UI state | `src/stores/*Store.ts` | `sessionStore`, `mainStore` |
| UseCase | `src/services/usecases/*UseCase.ts` | `AppLaunchUseCase` |
| Repository protocol | `src/services/repositories/contracts/*.ts` | `GroupRepository` |
| Repository 구현체 | `src/services/repositories/impl/*.ts` | `GroupRepositoryImpl` |
| Mock 구현체 | `src/services/repositories/mock/*.ts` | `MockGroupRepository` |
| URLSession wrapper | `src/services/api/client.ts` | `apiClient` |
| API path builder | `src/services/api/endpoints/*.ts` | `groupsEndpoints` |
| UserDefaults wrapper | `src/lib/storage/*.ts` | `sessionStorage`, `selectedGroupStorage` |

## `app` 폴더 읽는 법

Expo Router에서는 `app` 폴더의 파일 이름이 route가 됩니다.

```text
app/index.tsx          -> /
app/splash.tsx         -> /splash
app/onboarding.tsx     -> /onboarding
app/main.tsx           -> /main
app/group-create.tsx   -> /group-create
app/todo-write.tsx     -> /todo-write
```

`app/*.tsx` 파일에는 보통 화면 구현을 길게 쓰지 않습니다. 실제 화면은 `src/screens`에 두고, route 파일은 화면을 연결만 합니다.

```tsx
import { MainScreen } from '../src/screens/main';

export default MainScreen;
```

이렇게 나누면 라우팅 구조와 화면 구현을 분리해서 관리할 수 있습니다.

## `_layout.tsx` 읽는 법

`app/_layout.tsx`는 `app` 폴더 안 화면들이 공통으로 거치는 부모 레이아웃입니다.

여기서 확인할 것은 세 가지입니다.

| 볼 것 | 의미 |
| --- | --- |
| `QueryClientProvider` | React Query가 앱 전체에서 서버 상태를 공유할 수 있게 함 |
| `StatusBar` | 앱 전체 상태바 스타일 |
| `Stack.Screen` 목록 | 앱에서 사용할 route 목록 |

```text
RootLayout
  -> QueryClientProvider
  -> StatusBar
  -> Stack
    -> index
    -> splash
    -> onboarding
    -> main
    -> ...
```

iOS로 비유하면 앱 시작 시 전역 의존성을 주입하고, Coordinator가 사용할 화면 목록을 등록하는 위치에 가깝습니다.

## 앱 시작 흐름 읽는 법

앱 시작 흐름은 가장 먼저 따라가면 좋은 줄기입니다.

```text
app/index.tsx
  -> Redirect href="/splash"
  -> app/splash.tsx
  -> SplashScreen
  -> useLaunchFlowQuery()
  -> AppLaunchUseCase.decideNextRoute()
```

`app/index.tsx`는 루트 경로 `/`로 들어왔을 때 바로 `/splash`로 보냅니다.

`useLaunchFlowQuery()`는 세션 저장소가 복원된 뒤 실행됩니다. 아직 MMKV에서 세션을 읽기 전이면 로그인 여부를 알 수 없으므로 query를 잠시 멈춥니다.

```text
hydrated === false
  -> query 실행 안 함

hydrated === true
  -> AppLaunchUseCase 실행
```

`AppLaunchUseCase`의 분기 순서는 다음과 같습니다.

1. 강제 업데이트가 필요하면 `update`
2. 로그인 세션이 없으면 `onboarding`
3. 참여한 그룹이 없으면 `start`
4. 처리할 리뷰가 있으면 `review`
5. 그 외에는 `main`

이 흐름은 iOS 앱에서 launch coordinator가 앱 상태를 보고 첫 화면을 고르는 구조와 비슷합니다.

## 화면 하나를 읽는 순서

화면 하나를 읽을 때는 아래 순서가 좋습니다.

| 순서 | 볼 파일 | 질문 |
| --- | --- | --- |
| 1 | `app/화면이름.tsx` | 이 route가 어떤 Screen에 연결되는가? |
| 2 | `src/screens/...Screen.tsx` | 사용자가 보는 UI 구조는 어떤가? |
| 3 | `src/screens/.../styles.ts` | 화면의 레이아웃과 색상은 어디에 있는가? |
| 4 | `src/hooks/use...ts` | 화면 로직과 이벤트 핸들러는 어디에 있는가? |
| 5 | `src/queries/use...Query.ts` | 서버에서 읽는 데이터는 무엇인가? |
| 6 | `src/stores/*Store.ts` | 앱이 들고 있는 UI 상태는 무엇인가? |
| 7 | `src/services/usecases/*UseCase.ts` | 비즈니스 흐름은 어디에 모여 있는가? |
| 8 | `src/services/repositories/*` | 실제 API와 mock 구현은 어떻게 나뉘는가? |

이 순서로 읽으면 JSX 안에서 길을 잃지 않고, 화면이 필요한 값이 어디서 오는지 따라갈 수 있습니다.

## 메인 화면 읽는 법

메인 화면은 Dogether의 중심 화면입니다.

```text
app/main.tsx
  -> src/screens/main/MainScreen.tsx
  -> src/hooks/useMainScreen.ts
  -> src/queries/useGroupsQuery.ts
  -> src/queries/useMyTodosQuery.ts
  -> src/stores/mainStore.ts
```

`MainScreen`은 화면을 그리는 역할을 합니다.

주로 확인할 것은 다음입니다.

| 위치 | 담당 |
| --- | --- |
| `useMainScreen()` 반환값 | 화면에 필요한 데이터와 파생 상태 |
| `MainHeader` | 그룹 이름, 진행률, 상단 정보 |
| `MainPanel` | 날짜 이동, 필터, 투두 목록, CTA |
| `GroupSelectBottomSheet` | 그룹 선택 |
| `ReviewToast` | 리뷰 처리 후 안내 toast |

`useMainScreen`은 메인 화면의 ViewModel처럼 보면 됩니다.

```text
useMainScreen()
  -> useMainStore()로 선택 그룹, 날짜 offset, 필터 읽기
  -> useGroupsQuery()로 그룹 목록 읽기
  -> 현재 선택된 그룹 계산
  -> useMyTodosQuery()로 날짜별 투두 읽기
  -> 필터에 맞는 투두 목록 계산
  -> MainScreen이 바로 쓸 값 반환
```

메인 화면을 읽을 때 중요한 질문은 이것입니다.

```text
이 값은 서버에서 온 값인가?
아니면 앱이 들고 있는 UI 상태인가?
```

그룹 목록과 투두 목록은 React Query가 관리합니다. 선택 그룹, 날짜 offset, 필터는 Zustand store가 관리합니다.

## 상태 위치 찾는 법

상태는 크게 세 곳에 있습니다.

| 상태 종류 | 위치 | 예시 |
| --- | --- | --- |
| 화면 안에서만 쓰는 상태 | `useState` | modal 열림 여부, 입력값 |
| 여러 화면이 공유하는 UI 상태 | `src/stores` | 세션, 선택 그룹, 날짜 offset |
| 서버에서 가져오는 상태 | `src/queries` | 그룹 목록, 투두 목록, 프로필 |

읽을 때는 아래 기준으로 찾으면 됩니다.

```text
버튼 눌렀을 때 잠깐 바뀌는 값 -> Screen의 useState
다른 화면에서도 알아야 하는 값 -> Zustand store
API에서 가져오는 값 -> React Query
```

## 서버 데이터 흐름 읽는 법

서버 조회는 보통 아래처럼 흐릅니다.

```text
Screen
  -> useSomethingQuery()
    -> SomethingUseCase
      -> SomethingRepository
        -> apiClient.get/post/delete(...)
```

`queryKey`는 React Query cache의 주소입니다. 같은 `queryKey`를 쓰는 화면은 같은 서버 상태를 공유할 수 있습니다.

예를 들어 그룹 목록 query는 "그룹 목록"이라는 서버 상태를 읽습니다. 화면이 바뀌어도 같은 query key를 사용하면 캐시된 값을 재사용할 수 있습니다.

## Mock/API 전환 읽는 법

Mock과 실제 API 구현체는 `src/services/repositories/index.ts`에서 선택됩니다.

```text
src/config/env.ts
  -> env.useMockGroups
  -> src/services/repositories/index.ts
  -> MockGroupRepository or GroupRepositoryImpl
```

예를 들어 그룹 repository는 아래처럼 선택됩니다.

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

이 구조 덕분에 화면과 UseCase는 mock인지 실제 API인지 몰라도 됩니다. 서버 연동 전에는 mock으로 화면을 개발하고, 준비된 기능부터 실제 API로 바꿀 수 있습니다.

## 네트워크 흐름 읽는 법

네트워크의 공통 진입점은 `src/services/api/client.ts`입니다.

여기서 확인할 것은 다음입니다.

| 항목 | 의미 |
| --- | --- |
| `baseURL` | API 서버 주소 |
| `timeout` | 요청 제한 시간 |
| `Content-Type` | JSON 요청 기본 헤더 |
| request interceptor | 요청 직전 access token을 붙이는 지점 |

흐름은 다음과 같습니다.

```text
Repository Impl
  -> apiClient
  -> request interceptor
  -> storage에서 access token 읽기
  -> Authorization header 추가
  -> 서버 요청
```

서버 요청이 실패했을 때 화면에서 어떤 UI를 보여주는지는 `src/services/errors`와 각 Screen의 error state를 같이 보면 됩니다.

## 로컬 저장소 읽는 법

로컬 저장소는 `src/lib/storage`에 있습니다.

```text
src/lib/storage/
  storage.ts
  storageKeys.ts
  sessionStorage.ts
  selectedGroupStorage.ts
```

`storage.ts`는 MMKV 인스턴스를 만들고, `sessionStorage.ts`는 access token 같은 로그인 정보를 저장합니다.

React Native에서는 브라우저의 `localStorage` 대신 MMKV 같은 네이티브 저장소를 사용합니다. iOS의 `UserDefaults` wrapper와 비슷한 감각으로 읽으면 됩니다.

## 기능별 추천 읽기 순서

앱 시작 흐름을 본 뒤에는 관심 있는 기능 하나를 골라 읽으면 좋습니다.

| 기능 | 추천 읽기 순서 |
| --- | --- |
| 온보딩/로그인 | `app/onboarding.tsx` -> `OnboardingScreen` -> `useOnboarding` -> `authUseCase` -> `authRepository` |
| 메인 화면 | `app/main.tsx` -> `MainScreen` -> `useMainScreen` -> `useGroupsQuery/useMyTodosQuery` -> `mainStore` |
| 그룹 생성 | `app/group-create.tsx` -> `GroupCreateScreen` -> step components -> `groupUseCase` |
| 투두 작성 | `app/todo-write.tsx` -> `TodoWriteScreen` -> `todoWrite` components -> `challengeGroupUseCase` |
| 인증 작성 | `app/certify.tsx` -> `CertificationImageScreen` -> image picker/upload 흐름 |
| 리뷰 | `app/review.tsx` -> `ReviewScreen` -> `useReviewScreen` -> `reviewUseCase` |
| 랭킹/통계 | `app/ranking.tsx`, `app/statistics.tsx` -> query hook -> `userUseCase` |

모든 기능을 같은 깊이로 읽을 필요는 없습니다. 한 기능을 끝까지 따라가면 나머지 기능도 비슷한 패턴으로 읽을 수 있습니다.

## 코드 읽을 때 스스로 물어볼 질문

```text
1. 이 파일은 route, screen, hook, query, store, service 중 어디에 속하나?
2. 이 화면은 어떤 hook에서 값을 받나?
3. 이 값은 useState, Zustand, React Query 중 어디에 있나?
4. API 호출은 query에서 시작하나, usecase에서 시작하나?
5. UseCase는 어떤 Repository interface에 의존하나?
6. 지금 실행 환경에서는 Mock 구현체를 쓰나, API 구현체를 쓰나?
7. 에러가 나면 이 화면은 alert를 띄우나, full screen error를 보여주나?
```

이 질문을 반복하면 처음 보는 화면도 구조를 빠르게 파악할 수 있습니다.

## 처음 읽는 사람을 위한 추천 루트

가장 추천하는 첫 번째 루트는 아래입니다.

```text
package.json
  -> app/_layout.tsx
  -> app/index.tsx
  -> app/splash.tsx
  -> SplashScreen
  -> useLaunchFlowQuery
  -> AppLaunchUseCase
  -> sessionStore
  -> app/main.tsx
  -> MainScreen
  -> useMainScreen
  -> useGroupsQuery / useMyTodosQuery
  -> repositories/index.ts
  -> api/client.ts
```

이 루트 하나만 읽어도 Dogether RN의 기본 구조를 대부분 이해할 수 있습니다.

## 한 줄 요약

```text
route는 app에서 보고,
화면은 screens에서 보고,
화면 로직은 hooks에서 보고,
서버 상태는 queries에서 보고,
전역 UI 상태는 stores에서 보고,
데이터 출처는 services에서 따라가면 된다.
```
