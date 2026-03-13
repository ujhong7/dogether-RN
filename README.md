# Dogether RN

`dogether-iOS`를 기반으로 핵심 플로우를 React Native로 다시 구현한 학습 프로젝트입니다.  
단순 포팅보다, iOS에서 익숙한 구조를 RN스럽게 다시 해석하는 데 초점을 맞췄습니다.

## 프로젝트 목표

- iOS 버전의 핵심 사용자 흐름을 RN으로 재구현
- RN에서 자주 쓰는 `Screen + hooks + queries + stores + services/repositories` 구조 익히기
- 서버 연동 전 단계에서 mock 데이터와 로컬 저장소로 전체 플로우 검증

## 사용 기술 스택

- `React Native`
- `Expo`
- `TypeScript`
- `expo-router`
- `@tanstack/react-query`
- `zustand`
- `react-native-mmkv`
- `axios`
- `expo-image-picker`

## 현재 아키텍처

이 프로젝트는 전형적인 iOS식 `MVVM + Clean Architecture`를 그대로 복제하지 않고, RN에서 많이 쓰는 구조로 다시 정리했습니다.

### 폴더 구조

```text
app/
  라우팅 엔트리

src/
  components/     공통 UI
  config/         환경 설정
  hooks/          화면 로직 훅
  lib/            query client, storage 같은 공통 유틸
  models/         앱 모델 타입
  queries/        React Query 훅
  screens/        화면 단위 구현
  services/
    api/          axios client, endpoints
    repositories/ 실제/mock repository 구현
    usecases/     도메인 행동 단위
  stores/         zustand 전역 상태
  theme/          색상, 공통 디자인 토큰
  types/          API 응답 등 공통 타입
```

## 각 계층의 역할

### `app`

- `expo-router`가 읽는 라우트 엔트리 폴더
- 가능한 얇게 유지
- 실제 화면 구현은 `src/screens`에서 담당

예:

- `app/main.tsx` -> `/main`
- `app/group-create.tsx` -> `/group-create`

### `screens`

- 화면 레이아웃과 화면 조립 책임
- 각 화면 아래에 `components`, `styles`, `utils`를 같이 둠

예:

- `src/screens/main`
- `src/screens/groupCreate`
- `src/screens/certify`

### `hooks`

- 화면에 필요한 파생 상태와 UI 로직
- RN에서 `ViewModel`에 가장 가까운 역할

예:

- `src/hooks/useMainScreen.ts`
- `src/hooks/useOnboarding.ts`

### `queries`

- 서버 상태 혹은 비동기 조회를 React Query 훅으로 분리
- 화면에서 직접 `useQuery`를 크게 쓰지 않고, 조회 책임을 분리

예:

- `src/queries/useLaunchFlowQuery.ts`
- `src/queries/useGroupsQuery.ts`
- `src/queries/useMyTodosQuery.ts`
- `src/queries/useProfileQuery.ts`
- `src/queries/useRankingQuery.ts`

### `stores`

- 화면 간 공유되는 전역 상태
- 세션, 메인 화면 필터/선택 그룹, 인증 작성 draft 같은 상태를 관리

예:

- `src/stores/sessionStore.ts`
- `src/stores/mainStore.ts`
- `src/stores/certificationDraftStore.ts`

### `services/repositories`

- 실제 API 호출 구현체와 mock 구현체를 제공
- 현재는 mock 중심으로 동작
- 이후 서버 연결 시 repository 내부 구현만 바꾸는 식으로 확장 가능

예:

- `src/services/repositories/groupRepositoryImpl.ts`
- `src/services/repositories/mockGroupRepository.ts`
- `src/services/repositories/index.ts`

### `services/usecases`

- 화면이 직접 repository 세부사항을 몰라도 되게 중간 행동 단위를 제공
- iOS의 UseCase 개념을 RN에서도 유지한 부분

예:

- `src/services/usecases/groupUseCase.ts`
- `src/services/usecases/challengeGroupUseCase.ts`
- `src/services/usecases/appLaunchUseCase.ts`

## iOS 구조와 RN 구조 매핑

### iOS에서의 사고방식

- `ViewController / View`
- `ViewModel`
- `UseCase`
- `Repository`
- `Entity`

### RN에서의 현재 대응

- `Screen / screen components`
- `hooks`
- `services/usecases`
- `services/repositories`
- `models`

즉, iOS의 계층 의도는 살리고, RN에서 더 자연스러운 방식으로 표현한 구조입니다.

## 상태 관리 방식

현재는 **실제 서버 API를 메인 데이터 소스로 쓰지 않고**, mock 데이터와 로컬 저장소 기반으로 동작합니다.

### 로컬 저장

- `MMKV`를 사용해서 세션, mock 그룹, mock 투두 데이터를 저장
- 앱 재실행 후에도 일부 상태가 유지됨

### 조회 흐름

- 화면 -> `queries`
- `queries` -> `usecases`
- `usecases` -> `repositories`
- `repositories` -> mock 또는 API 구현

## 현재 구현된 주요 플로우

- 온보딩 / 데모 로그인
- 시작 화면
- 그룹 생성
- 초대 코드 가입
- 완료 후 메인 진입
- 메인 화면
- 그룹 선택 바텀시트
- 투두 작성 / 추가
- 인증하기
- 인증 상세 보기
- 랭킹 화면

## 왜 이렇게 리팩터링했는가

이번 RN 버전은 단순히 "동작만 하는 포팅본"이 아니라,

- RN에서 어떤 위치에 어떤 책임을 두는지
- iOS의 MVVM/Clean 사고를 RN에서 어떻게 번역하는지
- 화면 로직과 데이터 로직을 어떻게 분리하는지

를 공부하기 좋은 형태로 정리하는 것이 목적이었습니다.

## 실행 방법

```bash
npm install
npx expo run:ios --device "iPhone 15"
```

### 환경별 실행

현재 프로젝트는 `mock / dev / prod` 환경을 `EXPO_PUBLIC_*` 기반으로 분리합니다.

- `npm run start:mock`
- `npm run start:dev`
- `npm run start:prod`
- `npm run ios:mock`
- `npm run ios:dev`
- `npm run ios:prod`

핵심 런타임 환경값은 [`/Users/yujaehong/Desktop/dogether-RN/src/config/env.ts`](/Users/yujaehong/Desktop/dogether-RN/src/config/env.ts) 에서 읽습니다.

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_USE_MOCK_API`
- `EXPO_PUBLIC_APP_VERSION`
- `EXPO_PUBLIC_APP_STORE_URL`

예시 값은 [`/Users/yujaehong/Desktop/dogether-RN/.env.example`](/Users/yujaehong/Desktop/dogether-RN/.env.example) 에 정리했습니다.

### 환경 분리 방식

이 프로젝트는 iOS의 DIManager처럼 거대한 단일 객체를 두기보다,

- `app.config.ts` 에서 앱 설정을 환경별로 분기하고
- `src/config/env.ts` 에서 런타임 환경 객체를 만들고
- `src/services/repositories/index.ts` 에서 mock / real repository를 선택하는

RN 스타일의 `config + factory` 구조를 사용합니다.

## 참고 문서

- `docs/IOS_TO_RN_ANALYSIS.md`
- 원본 iOS 프로젝트: `../dogehter-iOS`
