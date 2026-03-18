# dogether-RN

## 프로젝트 개요

- **프로젝트 기간:** 2025.03
- **형태:** iOS 네이티브([dogether-iOS](https://github.com/ujhong7/dogether-iOS)) 기반 React Native 재구현 학습 프로젝트
- **기술스택:** React Native · Expo · TypeScript · Expo Router · React Query · Zustand · MMKV · Axios · Zod

<br>

## 프로젝트 설명

같이하면 할 수 있다! 가족, 친구, 지인들과 함께하는 데일리 투두 챌린지 앱입니다.

iOS 네이티브로 먼저 개발한 서비스를 React Native로 재구현하며, iOS에서 익숙한 아키텍처 사고를 크로스플랫폼 환경에서 어떻게 표현하는지 직접 부딪히며 학습한 프로젝트입니다.
단순 포팅이 아니라 **RN 생태계에서 자연스러운 구조**를 찾아 재해석하는 데 초점을 맞췄습니다.

<br>

## 학습 목표 및 담당 파트

- iOS MVVM + Clean Architecture 사고를 RN 방식으로 재해석 (Repository + UseCase + Custom Hook)
- 서버 상태와 클라이언트 상태의 명확한 분리 (React Query / Zustand)
- 파일 기반 라우팅 구조 설계 및 화면 전환 정책 정리 (Expo Router)
- Mock / Dev / Prod 환경 분리 및 런타임 의존성 주입 구조 설계
- iOS 전용 코드베이스를 iOS · Android 동시 지원 구조로 전환
- 코드 가독성과 역할 분리 중심의 리팩토링 반복

<br>

## 아키텍처

### iOS MVVM + Clean Architecture → RN 번역

iOS 프로젝트에서는 `ViewController → ViewModel → UseCase → Repository(Protocol) → DataSource → NetworkManager` 흐름을 일관되게 적용했습니다. RN으로 재구현하면서 이 계층 구조를 그대로 복제하지 않고, **RN 생태계에서 자연스러운 방식**으로 재해석했습니다.

| iOS (MVVM + Clean Architecture) | React Native |
|----------------------------------|--------------|
| ViewController | Screen (`.tsx`) |
| ViewModel | Custom Hook (`useMainScreen`) |
| UseCase | UseCase (`services/usecases/`) |
| Repository Protocol | Repository Interface (`contracts/`) |
| DataSource (Impl) | Repository Impl (`impl/`) |
| DIManager | 팩토리 함수 (`repositories/index.ts`) |
| BehaviorRelay (RxRelay) 바인딩 | React Query + Zustand 구독 |

가장 큰 차이는 **ViewModel의 형태**입니다. iOS에서는 클래스 기반 ViewModel이 상태를 소유하고 바인딩을 관리했지만, RN에서는 Custom Hook이 그 역할을 합니다. Hook은 클래스가 아니라 함수이고, 렌더링마다 실행되며, 파생 상태를 계산해 화면에 반환합니다.

```
[iOS]
MainViewController → MainViewModel → GroupUseCase → GroupRepository(Protocol)
                                  ↘ BehaviorRelay 구독

[RN]
MainScreen → useMainScreen() → useGroupsQuery() → GroupUseCase → GroupRepository(Interface)
                             ↘ Zustand 구독
```

<br>

### 앱 전체 흐름

```
앱 실행
  │
  ├── SplashScreen
  │     └── 세션 확인 (MMKV)
  │           ├── 세션 없음 → OnboardingScreen (로그인)
  │           └── 세션 있음
  │                 └── 그룹 참여 여부 확인 (API)
  │                       ├── 미참여 → StartScreen (그룹 생성/참여)
  │                       └── 참여중 → MainScreen
  │
  ├── MainScreen
  │     ├── 그룹 선택 바텀시트
  │     ├── 날짜 이동 (dateOffset)
  │     ├── 투두 필터 (all / wait / approve / reject)
  │     └── 투두 항목 탭
  │           ├── 내 투두 → CertifyScreen (사진 인증)
  │           └── 타인 투두 → CertificationScreen (인증 상세 / 리뷰)
  │
  └── 기타 화면
        ├── StatisticsScreen (기간별 통계)
        ├── RankingScreen (그룹 랭킹)
        ├── GroupManagementScreen (그룹 관리)
        └── SettingsScreen (설정 / 로그아웃)
```

<br>

### 데이터 흐름

화면은 데이터를 어떻게 가져오는지 모르고, UseCase는 어느 구현체가 주입되는지 모릅니다. 각 계층은 인접 계층의 인터페이스에만 의존합니다.

```
Screen
  └── Custom Hook (useMainScreen)
        ├── React Query (useGroupsQuery, useMyTodosQuery)  ← 서버 상태
        │     └── UseCase (GroupUseCase)
        │           └── Repository Interface
        │                 ├── GroupRepositoryImpl  ← 실제 API
        │                 └── MockGroupRepository  ← Mock
        └── Zustand (useMainStore)                         ← 클라이언트 상태
              └── MMKV                                     ← 영속성
```

<br>

## 기술적 주요 성과

### Repository 패턴 + 런타임 의존성 주입으로 Mock 환경 분리

iOS DIManager 방식을 RN에 맞게 재해석해, 환경변수 하나로 실제 API ↔ Mock 구현체를 런타임에 교체하는 팩토리 구조를 설계했습니다.

```
Repository Interface (계약)
  ├── Impl  ← 실제 API 호출
  └── Mock  ← 개발/테스트용 더미 구현
```

```ts
export function createGroupRepository(): GroupRepository {
  if (env.useMockApi) return new MockGroupRepository();
  return new GroupRepositoryImpl();
}
```

UseCase는 어느 구현체가 주입되는지 모르고, 화면은 어떻게 데이터를 가져오는지 모릅니다. 각 계층이 인접 계층의 인터페이스에만 의존하는 구조 덕분에, `npm run start:mock` 하나로 서버 없이 전체 플로우를 실행할 수 있고 이후 실제 API 연동 시에도 화면 코드를 건드리지 않았습니다.

<br>

### 서버 상태 / 클라이언트 상태 책임 분리

초기에는 Zustand 하나로 서버 데이터까지 관리하려 했습니다. 그런데 API 응답을 Zustand에 담으면 로딩 상태, 에러 상태, 캐시 만료, 리패치 타이밍을 전부 직접 구현해야 해서 스토어가 빠르게 복잡해졌습니다.

React Query를 도입한 뒤 상태를 성격에 따라 세 계층으로 분리했습니다.

| 상태 종류 | 도구 | 예시 |
|-----------|------|------|
| 서버 상태 (원격 데이터) | React Query | 그룹 목록, 투두, 랭킹 |
| 전역 UI 상태 | Zustand | 선택된 그룹 ID, 날짜 오프셋, 필터 |
| 인증 세션 | Zustand + MMKV | 액세스 토큰, 로그인 타입 |
| 화면 로컬 상태 | useState | 바텀시트 열림 여부 |

분리 후 화면 코드는 상태를 구독하고 표현하는 역할에만 집중하게 됐고, 캐싱·로딩·리패치는 React Query가 자동으로 처리합니다.

<br>

### Custom Hook을 ViewModel로 — 계층 간 책임 분리

iOS에서 ViewModel이 파생 상태 계산과 UseCase 호출을 담당하듯, RN에서는 Custom Hook이 그 역할을 합니다. 화면 컴포넌트가 데이터 로직을 직접 알지 못하도록 계층을 분리했습니다.

```ts
// useMainScreen.ts — ViewModel 역할
export function useMainScreen() {
  const { data: groups } = useGroupsQuery();
  const { data: todos } = useMyTodosQuery();
  const { dateOffset, filter } = useMainStore();

  const currentGroup = groups?.find(...);
  const filteredTodos = todos?.filter(...);
  const formattedDate = formatDateByOffset(dateOffset);

  return { currentGroup, filteredTodos, formattedDate, ... };
}

// MainScreen.tsx — 화면은 훅이 주는 값만 사용
const { currentGroup, filteredTodos, formattedDate } = useMainScreen();
```

초기에는 `MainScreen`이 UseCase 인스턴스를 직접 생성하는 구조였는데, ViewController가 UseCase를 직접 만드는 것과 같아 화면이 의존성 조립 책임까지 지고 있었습니다. 이를 `useGroupSelection` 훅으로 분리해 화면은 훅이 제공하는 함수만 호출하도록 정리했습니다.

<br>

### variant 기반 에러 처리 전략

서버 에러를 단순 알림으로 처리하지 않고, 에러 성격에 따라 사용자가 취할 수 있는 다음 행동이 보이도록 설계했습니다.

```ts
export type AppError = {
  code: AppErrorCode;
  title: string;
  message: string;
  actionLabel?: string;
  variant: 'fullScreen' | 'alert';  // 에러 표시 방식 결정
};
```

- `fullScreen`: 화면 전체를 에러 상태로 교체 — 재시도가 필요한 네트워크 에러
- `alert`: 모달로 안내 후 로그인 화면으로 이동 — 인증 만료, 잘못된 요청 등

Axios 응답에서 서버 에러 코드(`ATF-*`, `CGF-*`)를 파싱해 미리 정의한 `AppError` 프리셋으로 변환하고, 화면은 `variant`만 보고 어떤 컴포넌트를 렌더링할지 결정합니다. iOS에서 NavigationCoordinator와 에러 처리를 연결하던 방식과 유사한 구조입니다.

<br>

### 역할 분리 중심 리팩토링

기능 구현 후 "처음 보는 사람이 구조를 파악할 수 있는가"를 기준으로 리팩토링을 반복했습니다.

**Before → After**

| 문제 | 개선 |
|------|------|
| 날짜 유틸 함수가 두 파일에 중복 | `dateUtils.ts`로 통합 |
| `styles.ts` 480줄 — 여러 컴포넌트 스타일이 혼재 | 컴포넌트별 StyleSheet로 분산 |
| `MainScreen`이 UseCase를 직접 생성 | `useGroupSelection` 훅으로 분리 |
| toast 로직(store 구독 + 타이머 + UI)이 화면에 산재 | `ReviewToast` 컴포넌트로 응집 |
| 스토리지 파일 4개가 `lib/` 루트에 혼재 | `lib/storage/` 서브폴더 + `index.ts` 재export |
| Repository 17개 파일이 flat 구조 | `impl/` `mock/` `mock/data/` 계층 분리 |

<br>

## 폴더 구조

```
dogether-RN/
├── app/                             # Expo Router 라우트 진입점
│   ├── _layout.tsx                  # 전체 Stack Navigator 설정 및 화면 등록
│   ├── index.tsx                    # 앱 시작 (splash → 인증 상태 분기)
│   ├── main.tsx                     # 메인 화면 → URL: /main
│   ├── onboarding.tsx               # 로그인 화면 → URL: /onboarding
│   ├── group-create.tsx             # 그룹 생성 → URL: /group-create
│   └── ...                          # 파일명 = URL 경로 (Expo Router 규칙)
│
└── src/
    ├── components/                  # 앱 전역 공통 컴포넌트
    │   ├── Screen.tsx               # 루트 컨테이너 (SafeArea 포함)
    │   ├── AppAlertModal.tsx        # 공통 에러 모달
    │   └── FullScreenErrorState.tsx # 전체 화면 에러 상태
    │
    ├── config/
    │   └── env.ts                   # 환경변수 파싱 및 런타임 env 객체
    │
    ├── hooks/                       # 전역 커스텀 훅 (ViewModel 역할)
    │   ├── useMainScreen.ts         # 메인 화면 전체 상태/로직
    │   ├── useGroupSelection.ts     # 그룹 선택 액션 (UseCase 주입 포함)
    │   └── useOnboarding.ts         # 로그인 플로우 로직
    │
    ├── lib/
    │   ├── storage/                 # MMKV 기반 로컬 저장소
    │   │   ├── storage.ts           # MMKV 인스턴스
    │   │   ├── storageKeys.ts       # 키 상수 정의
    │   │   ├── sessionStorage.ts    # 세션(토큰) 읽기/쓰기/삭제
    │   │   ├── selectedGroupStorage.ts  # 마지막 선택 그룹 ID 저장
    │   │   └── index.ts             # 전체 재export
    │   ├── dateUtils.ts             # 날짜 파싱/포맷/오프셋 유틸
    │   └── queryClient.ts           # React Query 클라이언트 설정
    │
    ├── models/                      # 도메인 모델 타입 정의
    │   ├── group.ts
    │   ├── todo.ts
    │   └── auth.ts
    │
    ├── queries/                     # React Query 훅 (서버 상태 조회)
    │   ├── useGroupsQuery.ts        # 그룹 목록 조회
    │   ├── useMyTodosQuery.ts       # 투두 목록 조회
    │   ├── useRankingQuery.ts       # 랭킹 조회
    │   └── useLaunchFlowQuery.ts    # 앱 시작 분기 결정 쿼리
    │
    ├── screens/                     # 화면별 UI
    │   ├── main/
    │   │   ├── components/
    │   │   │   ├── MainHeader.tsx   # 상단 헤더 (그룹명, 진행률)
    │   │   │   ├── MainPanel.tsx    # 투두 목록 패널
    │   │   │   ├── TodoRow.tsx      # 투두 항목 행
    │   │   │   ├── Illustrations.tsx # 빈 상태 일러스트
    │   │   │   └── ReviewToast.tsx  # 리뷰 완료 토스트
    │   │   ├── MainScreen.tsx       # 화면 본체 (조립 책임)
    │   │   ├── styles.ts            # 공유 스타일
    │   │   └── utils.ts             # 화면 전용 유틸 (진행률 계산 등)
    │   ├── groupCreate/             # 그룹 생성 화면
    │   ├── certify/                 # 인증하기 화면
    │   ├── statistics/              # 통계 화면
    │   └── shared/
    │       └── ComingSoonScreen.tsx # 준비 중 공용 화면
    │
    ├── services/
    │   ├── api/
    │   │   └── client.ts            # Axios 클라이언트 (인증 헤더 인터셉터 포함)
    │   ├── errors/
    │   │   └── appError.ts          # 서버 에러 → AppError 변환 로직
    │   ├── repositories/
    │   │   ├── contracts/           # Repository 인터페이스 (계약)
    │   │   │   ├── groupRepository.ts
    │   │   │   └── authRepository.ts
    │   │   ├── impl/                # 실제 API 구현체
    │   │   │   ├── groupRepositoryImpl.ts
    │   │   │   └── authRepositoryImpl.ts
    │   │   ├── mock/                # Mock 구현체
    │   │   │   ├── data/            # 더미 데이터
    │   │   │   │   ├── mockGroupData.ts
    │   │   │   │   └── mockTodoData.ts
    │   │   │   ├── mockGroupRepository.ts
    │   │   │   └── resetMockAppData.ts
    │   │   └── index.ts             # 팩토리 함수 (환경에 따라 구현체 선택)
    │   └── usecases/                # 비즈니스 로직 계층
    │       ├── groupUseCase.ts
    │       ├── authUseCase.ts
    │       └── reviewUseCase.ts
    │
    ├── stores/                      # Zustand 전역 상태
    │   ├── sessionStore.ts          # 인증 세션 (토큰, 로그인 타입)
    │   ├── mainStore.ts             # 메인 화면 UI 상태 (그룹 ID, 날짜, 필터)
    │   └── reviewToastStore.ts      # 리뷰 토스트 메시지 상태
    │
    └── theme/
        └── colors.ts                # 색상 토큰 (bg, surface, text, primary 등)
```

<br>

## 각 계층의 역할과 데이터 흐름

```
Screen (화면 조립, UI 표현)
  └── Custom Hook (파생 상태 계산, 핸들러 제공)
        └── React Query Hook (서버 상태 캐싱 및 관리)
              └── UseCase (비즈니스 로직)
                    └── Repository Interface
                          ├── Impl (실제 API)
                          └── Mock (더미 데이터)
```

화면은 어떻게 데이터를 가져오는지 모르고, UseCase는 어느 구현체가 주입되는지 모릅니다.
각 계층은 인접한 계층의 인터페이스에만 의존하도록 설계했습니다.

<br>

## iOS 개발자 시점에서 느낀 RN

### 라우팅 — Coordinator에서 파일 기반 라우팅으로

iOS에서는 화면 전환 책임을 Coordinator가 중앙에서 담당했습니다. 어떤 화면에서 어디로 이동할지, 어떤 방식으로 전환할지를 한 객체가 결정하는 구조였습니다.

Expo Router는 방향이 전혀 다릅니다. `app/` 폴더 안의 파일명이 곧 URL 경로가 되고, `router.push('/group-create')` 한 줄로 이동합니다. 처음에는 "전환 정책이 어디에 있지?"라는 의문이 들었습니다. Coordinator처럼 중앙에서 제어하는 객체가 없으니 낯설었습니다.

사용할수록 파일 기반 구조가 가진 장점이 보였습니다. 화면을 추가할 때 파일 하나만 만들면 되고, 어느 화면에서든 URL만 알면 이동할 수 있어 화면 간 결합도가 낮아집니다. 다만 전환 정책이 각 화면에 분산되는 만큼, `_layout.tsx`에서 스택에 등록된 화면을 명확히 관리하는 것이 중요하다는 것을 리팩토링 과정에서 배웠습니다 — 처음 작업할 때 화면 6개가 `_layout.tsx`에 등록되지 않아 런타임에서야 발견한 경험이 있었습니다.

<br>

### 상태 관리 — ViewModel의 역할이 분산된다

iOS에서는 ViewModel 하나가 네트워크 호출, 로딩 상태, 에러 상태, UI 상태를 모두 관리했습니다. RN에서 같은 방식으로 접근하면 Zustand 스토어 하나에 모든 것을 넣게 되는데, 서버 데이터의 캐시 만료나 백그라운드 리패치 같은 문제를 직접 구현해야 해서 복잡도가 빠르게 올라갔습니다.

React Query를 도입하고 역할을 나누면서 명확해졌습니다.

- **React Query**: 서버에서 오는 데이터 — 언제든 바뀔 수 있고, 캐시가 필요하고, 네트워크 상태에 따라 리패치가 필요한 것
- **Zustand**: 앱이 직접 소유하는 상태 — 선택된 그룹 ID, 날짜 오프셋, 필터값처럼 서버와 무관하게 앱이 직접 관리하는 것
- **useState**: 해당 화면 안에서만 의미 있는 것 — 바텀시트 열림 여부처럼 화면 밖에서 알 필요 없는 것

iOS의 ViewModel이 담당하던 일이 세 가지 도구로 분산되는 셈입니다. 처음에는 "굳이 나눠야 하나"라는 의문이 있었지만, 분리 후 각 계층의 코드가 단순해지고 화면 코드는 상태를 구독하고 표현하는 역할에만 집중할 수 있었습니다.

<br>

### 렌더링 — UIView 갱신과 다른 사고방식

UIKit에서는 데이터가 바뀌면 `tableView.reloadData()`나 `label.text = newValue`처럼 뷰를 직접 갱신했습니다. RN은 다릅니다. 상태가 바뀌면 컴포넌트 함수 전체가 다시 실행되고, React가 이전 결과와 비교해 바뀐 부분만 실제로 반영합니다.

이 차이를 이해하기 전에는 "왜 함수가 매번 다시 실행되는 거지?"라는 혼란이 있었습니다. 이해하고 나니 `useState`의 규칙(훅은 최상단에서만 호출)이 왜 존재하는지도 자연스럽게 이해됐습니다 — React는 호출 순서로 각 상태를 추적하기 때문에 조건문 안에서 훅을 쓰면 순서가 달라져 상태가 뒤섞입니다.

<br>

### UI 작성 — Storyboard/Xib 없이 JSX만으로

UIKit에서는 Storyboard나 Xib로 레이아웃을 잡거나, 코드로 뷰 계층을 직접 구성했습니다. RN은 JSX로만 UI를 작성합니다. 레이아웃은 Flexbox 기반이고, 스타일은 `StyleSheet.create({})`로 컴포넌트별로 정의합니다.

처음에는 Auto Layout에 익숙해서 Flexbox가 낯설었지만, 규칙이 단순하고 일관됩니다 — 기본 방향이 `column`, 자식은 부모 공간을 `flex` 비율로 나눠 가집니다. SwiftUI의 `VStack/HStack`과 개념적으로 유사해 적응이 빠른 편이었습니다. 다만 그림자, 특정 모서리 radius, 클리핑 처리에서 플랫폼별 동작 차이가 있어 별도 확인이 필요했습니다.

<br>

## 크로스플랫폼 개발, 직접 해보니

### iOS 개발자가 RN을 직접 써보니

iOS 네이티브를 먼저 경험한 상태에서 RN 개발을 시작했습니다. "비즈니스 로직 한 번으로 iOS/Android 동시 대응"이라는 말은 사실이었지만, 플랫폼과 맞닿는 경계에서는 반드시 분기가 생겼습니다.

**화면 생명주기 — viewDidAppear의 RN 버전**

그룹 참여 화면에 진입하면 초대 코드 입력 필드가 자동으로 포커스되고 키보드가 올라오도록 구현했습니다. iOS 네이티브였다면 `viewDidAppear`에 `becomeFirstResponder()`를 호출하면 끝입니다. RN에서는 `useFocusEffect`가 이에 해당하는데, 바로 `focus()`를 호출하면 iOS에서는 잘 동작하지만 Android에서는 화면 전환 애니메이션이 끝나기 전에 호출이 무시됩니다. `InteractionManager.runAfterInteractions()`으로 감싸서 애니메이션 완료 후 실행하도록 처리했습니다.

```tsx
// iOS: viewDidAppear + becomeFirstResponder() 에 해당
useFocusEffect(
  useCallback(() => {
    // Android는 화면 전환 애니메이션 중 focus()가 무시됨
    // InteractionManager로 애니메이션 완료 후 실행 보장
    const task = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
    return () => task.cancel();
  }, []),
);
```

**플랫폼별 처리가 필요했던 경계들**

| 기능 | iOS | Android |
|------|-----|---------|
| 화면 진입 시 키보드 | `useFocusEffect` + `focus()` 즉시 호출 | `InteractionManager`로 애니메이션 완료 후 호출 |
| 키보드 레이아웃 | `KeyboardAvoidingView behavior="padding"` | `behavior="height"` |
| 카카오 로그인 복귀 | 커스텀 URL 스킴 자동 처리 | `AndroidManifest.xml`에 `intent-filter` 등록 필요 |
| 이미지 피커 권한 | 단일 권한 요청 | OS 버전(API 33 기준)에 따라 요청 권한이 다름 |
| 그림자 스타일 | `shadow*` 속성 | `elevation` 속성 |

**앱 생명주기 — 백그라운드/포그라운드**

iOS에서는 `applicationDidBecomeActive` / `applicationDidEnterBackground`로 앱 상태 변화를 감지합니다. RN에서는 `AppState` API가 이에 대응하며, `'active'` / `'background'` / `'inactive'` 세 가지 상태를 구독할 수 있습니다. 구조는 동일하지만 Android는 `'inactive'` 상태 없이 `'active'` ↔ `'background'`로만 전환되는 차이가 있었습니다.

이 경험에서 느낀 것은, RN은 플랫폼을 추상화하지만 없애지는 않는다는 점입니다. iOS를 먼저 알고 있었기 때문에 "iOS에서는 이렇게 동작하는데 Android는 어디가 다를까"라는 방향으로 접근할 수 있었고, 원인 파악과 대응이 훨씬 빨랐습니다. 네이티브 경험이 크로스플랫폼 개발의 기반이 된다는 걸 직접 확인했습니다.

<br>

### 체감한 장점

**비즈니스 로직의 완전한 공유**
Repository, UseCase, 상태 관리, 에러 처리 로직은 iOS/Android를 구분하지 않고 동일하게 동작했습니다. iOS 앱 기준으로 설계한 아키텍처가 Android에서도 그대로 유효했고, 플랫폼 차이는 UI 경계(권한, 키보드, 딥링크)에서만 발생했습니다.

**개발 속도**
핫 리로드 덕분에 코드 수정 후 시뮬레이터에서 즉시 결과를 확인할 수 있었습니다. Xcode 빌드를 기다리는 시간이 없어 UI 작업 사이클이 훨씬 빨랐습니다.

**Android 지원 비용**
iOS 기준으로 완성된 앱에 Android 지원을 추가하는 비용이 네이티브 앱 두 개를 각각 만드는 것과 비교해 현저히 낮았습니다.

<br>

### 체감한 단점

**네이티브 레이어 디버깅의 어려움**
카카오 로그인, 이미지 피커처럼 네이티브 모듈과 연결되는 기능에서 문제가 생기면 JS 레벨 디버깅만으로는 원인을 찾기 어려웠습니다. 네이티브 로그를 함께 봐야 하는 경우가 있었고, iOS 네이티브 경험이 없었다면 원인 파악에 훨씬 오래 걸렸을 것입니다.

**라이브러리 호환성 관리**
Expo SDK 버전이 고정되어 있어 서드파티 라이브러리가 해당 버전을 지원하는지 매번 확인해야 했습니다. 네이티브에서 CocoaPods 버전 충돌을 겪는 것과 유사한 문제가 JS 생태계에서도 동일하게 존재했습니다.

**플랫폼 고유 UX의 한계**
iOS 고유의 인터랙션(스와이프 제스처, 네이티브 모달 전환 등)을 완전히 재현하는 데 추가 작업이 필요했고, 완성도 면에서 네이티브에 미치지 못하는 경우가 있었습니다.

<br>

## iOS 프로젝트와 비교

| | [dogether-iOS](https://github.com/ujhong7/dogether-iOS) | dogether-RN |
|--|------|------|
| 언어 | Swift | TypeScript |
| UI | UIKit | React Native |
| 라우팅 | Coordinator | Expo Router |
| 상태관리 | BehaviorRelay (RxRelay) | Zustand + React Query |
| 로컬 저장소 | UserDefaults | MMKV |
| 의존성 주입 | DIManager | 팩토리 함수 |
| 플랫폼 | iOS only | iOS + Android |
