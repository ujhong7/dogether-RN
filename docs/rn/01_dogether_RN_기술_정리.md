# Dogether RN 기술 정리

이 문서는 Dogether React Native 프로젝트를 처음 보는 사람이 기술 스택과 구조를 빠르게 이해할 수 있도록 정리한 문서입니다.

Flutter 문서가 Flutter/Dart 관점에서 프로젝트를 설명했다면, 이 문서는 React Native, TypeScript, Expo 기반 앱을 읽기 위한 출발점입니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Dogether RN |
| 서비스 성격 | 함께하는 데일리 투두 챌린지 앱 |
| 핵심 기능 | 로그인, 그룹 생성/참여/관리, 날짜별 투두 작성, 투두 인증, 리뷰, 랭킹, 통계, 마이페이지 |
| 개발 목적 | iOS/Flutter 개발 경험을 React Native 기반 크로스플랫폼 앱 개발 역량으로 확장 |
| 앱 버전 | `1.0.0` |

## 기술 스택

| 항목 | 선택 기술 |
| --- | --- |
| 언어 | TypeScript |
| UI 프레임워크 | React Native |
| 실행/개발 도구 | Expo |
| 라우팅 | Expo Router |
| 화면 작성 방식 | React 함수형 컴포넌트, JSX/TSX |
| 서버 상태 관리 | TanStack React Query |
| 전역 UI 상태 관리 | Zustand |
| 폼 처리 | React Hook Form, Zod |
| 네트워크 | Axios 기반 커스텀 `apiClient` |
| 로컬 저장소 | react-native-mmkv |
| 이미지 선택/파일 처리 | expo-image-picker, expo-file-system |
| 소셜 로그인 | Kakao Login, Apple Authentication |
| 스타일링 | React Native `StyleSheet` |
| 타입 체크 | TypeScript |

## 큰 구조

이 프로젝트는 Expo Router의 `app` 폴더와, 실제 기능 코드를 담는 `src` 폴더를 나누어 사용합니다.

```text
app/
  _layout.tsx              앱 공통 Provider와 Stack route 설정
  index.tsx                앱 최초 진입 route
  main.tsx                 메인 화면 route
  onboarding.tsx           온보딩 화면 route
  ...

src/
  components/              여러 화면에서 쓰는 공통 UI
  config/                  실행 환경 설정
  hooks/                   화면 로직을 담는 custom hook
  lib/                     query client, storage, 날짜 유틸
  models/                  앱 내부 데이터 타입
  queries/                 React Query hook
  screens/                 실제 화면 컴포넌트
  services/                API, UseCase, Repository
  stores/                  Zustand 전역 상태
  theme/                   색상 등 디자인 토큰
```

iOS로 비유하면 `app` 폴더는 Coordinator 또는 route table에 가깝고, `src/screens`는 ViewController와 View가 합쳐진 화면 레이어에 가깝습니다.

## 앱 실행 흐름

앱이 실행되면 Expo Router가 `app/_layout.tsx`를 먼저 거치고, `app/index.tsx`에서 시작 흐름을 판단합니다.

```text
expo-router/entry
  -> app/_layout.tsx
  -> QueryClientProvider
  -> Stack route 등록
  -> app/index.tsx
  -> useLaunchFlowQuery()
  -> AppLaunchUseCase
  -> update / onboarding / start / review / main
```

처음 읽을 때는 아래 순서가 좋습니다.

| 순서 | 파일 | 보는 이유 |
| --- | --- | --- |
| 1 | `app/_layout.tsx` | 앱 전체 Provider와 route 목록 확인 |
| 2 | `app/index.tsx` | 앱이 처음 켜졌을 때 어디로 이동하는지 확인 |
| 3 | `src/queries/useLaunchFlowQuery.ts` | 첫 화면 결정을 비동기 query로 처리하는 방식 확인 |
| 4 | `src/services/usecases/appLaunchUseCase.ts` | update/onboarding/start/review/main 분기 조건 확인 |
| 5 | `src/config/env.ts` | mock/dev/prod 환경값 확인 |

## 화면 작성 방식

React Native 화면은 보통 `Screen`, `Hook`, `StyleSheet`로 나뉩니다.

```text
src/screens/main/
  MainScreen.tsx           실제 JSX 화면
  styles.ts                화면 스타일
  utils.ts                 화면 전용 계산 함수
  components/              메인 화면 전용 하위 컴포넌트

src/hooks/useMainScreen.ts 화면 상태와 이벤트 핸들러
```

흐름은 대체로 다음과 같습니다.

```text
app/main.tsx
  -> MainScreen
    -> useMainScreen()
      -> useGroupsQuery()
      -> useMyTodosQuery()
      -> useMainStore()
```

화면 파일은 사용자가 보는 JSX 구조에 집중하고, 복잡한 상태 계산과 이벤트 처리는 `src/hooks/use...ts`로 분리합니다.

## 라우팅

라우팅은 Expo Router를 사용합니다.

Expo Router에서는 `app` 폴더의 파일 이름이 곧 route가 됩니다.

| 파일 | route |
| --- | --- |
| `app/index.tsx` | `/` |
| `app/splash.tsx` | `/splash` |
| `app/main.tsx` | `/main` |
| `app/group-create.tsx` | `/group-create` |
| `app/certify-content.tsx` | `/certify-content` |

`app/_layout.tsx`는 공통 부모 레이아웃입니다. 여기서 `Stack`을 만들고, 모든 화면의 기본 옵션을 설정합니다.

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="main" />
  <Stack.Screen name="settings" />
</Stack>
```

화면 이동은 보통 Expo Router의 `router.push`, `router.replace`, `router.back`으로 처리합니다.

## 상태 관리

React Native 앱에서는 상태를 세 종류로 나누면 읽기 쉽습니다.

| 상태 종류 | 사용 기술 | 예시 |
| --- | --- | --- |
| 화면 내부 UI 상태 | `useState` | input 값, modal 열림 여부, step index |
| 전역 UI 상태 | Zustand | 로그인 세션, 선택 그룹, 날짜 offset, 인증 draft |
| 서버/비동기 데이터 상태 | React Query | 그룹 목록, 투두 목록, 프로필, 랭킹 |

간단히 정리하면 다음과 같습니다.

```text
이 화면 안에서만 쓰면 useState
여러 화면이 공유하면 Zustand store
서버에서 가져오면 React Query
```

## React Query

React Query는 서버에서 가져오는 데이터와 그 상태를 관리합니다.

이 프로젝트의 query hook은 `src/queries`에 있습니다.

```text
src/queries/
  useGroupsQuery.ts
  useMyTodosQuery.ts
  useProfileQuery.ts
  useRankingQuery.ts
  useStatisticsQuery.ts
```

React Query가 관리하는 것은 단순히 데이터만이 아닙니다.

| 값 | 의미 |
| --- | --- |
| `data` | 성공했을 때 받은 데이터 |
| `isLoading` | 처음 불러오는 중인지 여부 |
| `isFetching` | 다시 불러오는 중인지 여부 |
| `error` | 실패했을 때의 에러 |
| `refetch()` | 수동 새로고침 |

전역 설정은 `src/lib/queryClient.ts`에 있습니다.

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});
```

`staleTime`은 데이터를 얼마 동안 신선한 값으로 볼지 정하는 설정입니다. 이 프로젝트에서는 30초 동안 같은 query key의 데이터를 재사용할 수 있습니다.

## Zustand

Zustand는 앱 안에서 공유해야 하는 UI 상태를 담는 전역 store입니다.

이 프로젝트의 store는 `src/stores`에 있습니다.

```text
src/stores/
  sessionStore.ts
  mainStore.ts
  startFlowStore.ts
  certificationDraftStore.ts
  certificationViewerStore.ts
  reviewToastStore.ts
```

예를 들어 메인 화면의 선택 그룹, 날짜 이동값, 필터는 서버에서 가져오는 데이터가 아니라 앱이 들고 있는 UI 상태입니다. 이런 값은 React Query보다 Zustand가 더 자연스럽습니다.

```text
React Query: 서버에서 가져온 데이터
Zustand: 앱이 현재 어떤 UI 상태인지
```

## UseCase와 Repository

화면은 API를 직접 호출하지 않습니다.

대신 아래 흐름을 따릅니다.

```text
Screen
  -> Hook
    -> Query / Store
      -> UseCase
        -> Repository contract
          -> API Repository or Mock Repository
            -> apiClient / mock data
```

관련 파일은 아래처럼 나뉩니다.

| 위치 | 역할 |
| --- | --- |
| `src/services/usecases` | 화면이 원하는 비즈니스 흐름 |
| `src/services/repositories/contracts` | Repository 인터페이스 |
| `src/services/repositories/impl` | 실제 API 구현체 |
| `src/services/repositories/mock` | 개발용 mock 구현체 |
| `src/services/repositories/index.ts` | 환경값에 따라 구현체 선택 |

iOS로 비유하면 `contracts`는 Swift protocol, `impl`은 실제 networking 구현체, `mock`은 Preview/Test용 fake 구현체에 가깝습니다.

## 네트워크 구조

네트워크는 Axios를 직접 화면에서 사용하지 않고 `src/services/api/client.ts`의 `apiClient`로 감쌉니다.

`apiClient`가 담당하는 일은 다음과 같습니다.

- `env.apiBaseUrl`을 기준으로 base URL 설정
- JSON 요청 헤더 설정
- 요청 timeout 설정
- 저장된 access token을 `Authorization: Bearer ...` 헤더로 자동 첨부

```text
Repository Impl
  -> apiClient.get/post/put/delete
    -> Axios request interceptor
      -> MMKV에서 access token 읽기
      -> Authorization header 추가
```

Repository 구현체는 endpoint 호출과 응답 mapping에 집중하고, 인증 헤더 같은 공통 처리는 client 계층에서 처리합니다.

## 로컬 저장소

로컬 저장소는 `react-native-mmkv`를 사용합니다.

관련 파일은 `src/lib/storage`에 있습니다.

```text
src/lib/storage/
  storage.ts                MMKV 인스턴스 생성
  storageKeys.ts            저장 key 모음
  sessionStorage.ts         로그인 세션 저장/복원
  selectedGroupStorage.ts   마지막 선택 그룹 저장
  index.ts                  storage 관련 export
```

iOS의 `UserDefaults`처럼 작은 key-value 데이터를 저장하는 역할입니다. 다만 React Native에서는 브라우저의 `localStorage`가 아니라 네이티브 저장소를 사용합니다.

## 환경 설정과 Mock 전환

환경 설정은 `src/config/env.ts`에서 관리합니다.

Expo에서는 JavaScript bundle에서 읽을 환경 변수에 `EXPO_PUBLIC_` 접두사를 붙입니다.

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_API_BASE_URL
EXPO_PUBLIC_USE_MOCK_API
EXPO_PUBLIC_USE_MOCK_AUTH
EXPO_PUBLIC_USE_MOCK_GROUPS
EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS
EXPO_PUBLIC_USE_MOCK_USER
EXPO_PUBLIC_USE_MOCK_REVIEW
```

실행 스크립트는 `package.json`에 있습니다.

```bash
npm run start:mock
npm run start:dev
npm run start:prod
npm run ios:mock
npm run ios:dev
npm run android:mock
npm run android:dev
```

Repository 선택은 `src/services/repositories/index.ts`에서 이루어집니다.

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

이 구조 덕분에 화면과 UseCase는 실제 API인지 mock 데이터인지 몰라도 됩니다.

## UI와 스타일

UI는 React Native 기본 컴포넌트와 `StyleSheet`를 사용합니다.

| 항목 | 예시 |
| --- | --- |
| 기본 레이아웃 | `View`, `ScrollView`, `SafeAreaView` |
| 텍스트 | `Text` |
| 터치 | `Pressable`, `TouchableOpacity` |
| 이미지 | `Image` |
| 스타일 | `StyleSheet.create(...)` |
| 공통 색상 | `src/theme/colors.ts` |

화면별 스타일은 보통 각 화면 폴더의 `styles.ts`에 있습니다.

```text
src/screens/main/
  MainScreen.tsx
  styles.ts
```

React Native의 layout은 CSS와 비슷하지만, 기본 축이 column인 Flexbox라는 점이 중요합니다.

## 주요 기능 모듈

| 모듈 | 역할 |
| --- | --- |
| `onboarding` | 앱 첫 진입, 로그인 시작 |
| `splash` | 앱 실행 중 초기 화면 |
| `start` | 그룹이 없는 사용자의 시작 흐름 |
| `groupCreate` | 그룹 생성 멀티스텝 폼 |
| `groupJoin` | 그룹 참여 |
| `groupManagement` | 그룹 관리와 탈퇴 |
| `main` | 날짜별 투두 목록, 그룹 선택, 필터 |
| `todoWrite` | 투두 작성 |
| `certify` | 투두 인증 이미지/내용 작성 |
| `certificationList` | 인증 목록 |
| `certification` | 인증 상세 |
| `review` | 대기 리뷰 승인/거절 |
| `ranking` | 그룹 랭킹 |
| `statistics` | 통계 |
| `my` | 마이페이지 |
| `settings` | 설정 |

## 기술적 주요 포인트

### 1. Expo Router 기반 파일 라우팅

`app` 폴더의 파일 구조만 봐도 앱의 화면 목록과 route를 파악할 수 있습니다. 화면 컴포넌트는 `src/screens`에 두고, `app/*.tsx`는 route와 screen을 연결하는 얇은 어댑터로 사용합니다.

### 2. React Query와 Zustand 역할 분리

서버에서 가져오는 데이터는 React Query가 맡고, 앱이 들고 있어야 하는 UI 상태는 Zustand가 맡습니다. 이 분리 덕분에 "이 데이터는 서버 상태인가, 화면 상태인가"를 기준으로 코드를 찾기 쉽습니다.

### 3. UseCase와 Repository 계층 분리

화면이 API 구현체에 직접 의존하지 않도록 UseCase와 Repository contract를 둡니다. API 구현과 mock 구현을 갈아끼울 수 있어 서버 개발 상태와 무관하게 화면 흐름을 개발하고 검증할 수 있습니다.

### 4. Axios Client로 네트워크 공통 관심사 처리

base URL, timeout, Authorization header 같은 공통 처리를 `apiClient`에 모았습니다. Repository에서는 어떤 endpoint를 호출하고 응답을 어떻게 앱 모델로 바꿀지에 집중할 수 있습니다.

### 5. MMKV 기반 세션 저장

로그인 토큰과 마지막 선택 그룹 같은 작은 영속 상태는 MMKV wrapper를 통해 저장합니다. 저장 key를 한곳에 모아두어 문자열 key가 프로젝트 곳곳에 흩어지는 것을 줄였습니다.

### 6. Mock/API 전환 가능한 실행 환경

`mock`, `dev`, `prod` 실행 환경을 나누고, feature별 mock flag를 제공합니다. 그래서 서버 연동이 끝나지 않은 기능은 mock으로 유지하면서 준비된 기능만 실제 API로 붙일 수 있습니다.

## 처음 읽는 사람을 위한 한 줄 요약

```text
app 폴더에서 화면 route를 보고,
src/screens에서 UI를 보고,
src/hooks에서 화면 로직을 보고,
src/queries와 src/stores에서 상태를 보고,
src/services에서 실제 데이터 흐름을 따라가면 된다.
```
