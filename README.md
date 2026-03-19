# dogether-RN

## 프로젝트 개요

- **프로젝트 기간:** 2026.03
- **인원:** 개인 프로젝트
- **형태:** iOS 네이티브([dogether-iOS](https://github.com/dogether-project/dogether-iOS)) 기반 React Native 재구현 학습 프로젝트
- **기술스택:** React Native · Expo · TypeScript · Expo Router · React Query · Zustand · MMKV · Axios · Zod
- Claude Code · Codex를 활용한 AI 보조 개발 워크플로우 적용

<br>

## 프로젝트 설명

iOS 네이티브로 먼저 개발한 서비스를 React Native로 재구현하며, 기존 iOS 중심의 설계 방식을 RN 생태계에 맞게 다시 해석하고, 크로스플랫폼 환경에서 자연스러운 구조로 재구성해본 프로젝트입니다.   
단순 포팅이 아니라 화면 구조, 상태 관리, 환경 분리 방식을 RN답게 정리하는 데 초점을 맞췄습니다.

<br>

## 학습 목표 및 구현 포인트

- iOS MVVM + Clean Architecture 패턴을 RN 환경에 맞게 적용 (Repository + UseCase + Custom Hook)
- 서버 상태와 클라이언트 상태의 명확한 분리 (React Query / Zustand)
- 파일 기반 라우팅 구조 설계 및 화면 전환 정책 정리 (Expo Router)
- Mock / Dev / Prod 환경 분리와 구현체 전환 구조 설계
- iOS 중심 구조를 iOS · Android 동시 지원 가능한 형태로 재구성
- 가독성과 역할 분리를 기준으로 지속적으로 리팩토링

<br>

## 아키텍처

### iOS MVVM + Clean Architecture → RN

iOS 프로젝트에서는 `ViewController → ViewModel → UseCase → Repository(Protocol) → DataSource → NetworkManager` 흐름을 일관되게 적용했습니다.   
RN으로 재구현하면서 이 계층 구조를 그대로 복제하지 않고, **RN 생태계에서 자연스러운 방식**으로 재해석했습니다.

| iOS (MVVM + Clean Architecture) | React Native |
|----------------------------------|--------------|
| ViewController | Screen (`.tsx`) |
| ViewModel | Custom Hook (`useMainScreen`) |
| UseCase | UseCase (`services/usecases/`) |
| Repository Protocol | Repository Interface (`contracts/`) |
| DataSource (Impl) | Repository Impl (`impl/`) |
| DIManager | 팩토리 함수 (`repositories/index.ts`) |
| BehaviorRelay (RxRelay) 바인딩 | React Query + Zustand 구독 |

가장 큰 차이는 **ViewModel의 형태**입니다.   
iOS에서는 클래스 기반 ViewModel이 상태를 소유하고 바인딩을 관리했지만, RN에서는 Custom Hook이 그 역할을 합니다.   
Hook은 클래스가 아니라 함수이고, 렌더링마다 실행되며, 파생 상태를 계산해 화면에 반환합니다.

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

UseCase는 어느 구현체가 주입되는지 모르고, 화면은 어떻게 데이터를 가져오는지 모릅니다.   
각 계층이 인접 계층의 인터페이스에만 의존하는 구조 덕분에, `npm run start:mock` 하나로 서버 없이 전체 플로우를 실행할 수 있고 이후 실제 API 연동 시에도 화면 코드를 건드리지 않았습니다.

<br>

### 서버 상태 / 클라이언트 상태 책임 분리

초기에는 Zustand 하나로 서버 데이터까지 관리하려 했습니다.   
그런데 API 응답을 Zustand에 담으면 로딩 상태, 에러 상태, 캐시 만료, 리패치 타이밍을 전부 직접 구현해야 해서 스토어가 빠르게 복잡해졌습니다.

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

iOS에서 ViewModel이 파생 상태 계산과 UseCase 호출을 담당하듯, RN에서는 Custom Hook이 그 역할을 합니다.   
화면 컴포넌트가 데이터 로직을 직접 알지 못하도록 계층을 분리했습니다.

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

초기에는 `MainScreen`이 UseCase 인스턴스를 직접 생성하는 구조였는데, ViewController가 UseCase를 직접 만드는 것과 같아 화면이 의존성 조립 책임까지 지고 있었습니다.   
이를 `useGroupSelection` 훅으로 분리해 화면은 훅이 제공하는 함수만 호출하도록 정리했습니다.

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

Axios 응답에서 서버 에러 코드(`ATF-*`, `CGF-*`)를 파싱해 미리 정의한 `AppError` 프리셋으로 변환하고, 화면은 `variant`만 보고 어떤 컴포넌트를 렌더링할지 결정합니다.   
iOS에서 NavigationCoordinator와 에러 처리를 연결하던 방식과 유사한 구조입니다.

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

dogether-iOS에서는 Coordinator를 중심으로 화면 전환 흐름을 관리했습니다. 어떤 화면에서 어디로 이동할지, 어떤 방식으로 전환할지를 명시적으로 제어하는 구조였습니다.

React Native에서는 Expo Router를 사용하면서 접근 방식이 달라졌습니다. app/ 폴더의 파일 구조가 곧 라우트가 되고, router.push('/group-create')처럼 경로 기반으로 화면을 이동합니다. Coordinator처럼 전환 책임이 중앙에 모이지 않기 때문에, 화면 구조와 라우팅 흐름을 파일 계층 기준으로 정리하는 방식에 더 가깝습니다.

이 방식의 장점은 화면 구조가 폴더와 파일명만으로 드러난다는 점입니다. 반면 전환 흐름이 각 화면에 분산되기 쉬운 만큼, _layout.tsx에서 화면 계층과 네비게이션 구성을 일관되게 관리하는 것이 중요했습니다.

<br>

### 상태 관리 — 역할을 한 곳에 모으기보다 성격에 따라 분리

dogether-iOS에서는 MVVM + Clean Architecture 구조 안에서 ViewModel, UseCase, Repository가 각자 책임을 나눠 갖고 있었습니다. RN에서도 비슷하게 계층을 분리했지만, 상태는 역할에 따라 더 명확히 나누는 쪽이 자연스러웠습니다.

React Query: 서버에서 받아오는 데이터 상태
Zustand: 앱이 직접 관리하는 전역 UI 상태
useState: 화면 내부에서만 쓰는 로컬 상태
Custom Hook: 화면에 필요한 파생 상태와 핸들러 조합

즉 iOS에서 계층적으로 나뉘어 있던 책임이, RN에서는 상태의 성격에 따라 query / store / hook으로 더 세분화되는 느낌에 가깝습니다.   
이 구조로 정리한 뒤에는 화면 컴포넌트가 표현 책임에 더 집중할 수 있었고, 서버 상태와 UI 상태도 서로 다른 규칙으로 관리할 수 있었습니다.

<br>

### 렌더링 — 선언형 UI를 더 함수 중심으로 다루는 방식

UIKit에서는 뷰 계층을 직접 조립하고 갱신 흐름을 명시적으로 제어하는 경우가 많고, SwiftUI에서는 상태 변화에 따라 화면이 다시 그려지는 선언형 방식이 중심이 됩니다.   
React Native는 이 중 후자에 더 가까웠지만, 상태와 렌더링을 훅과 함수 단위로 다룬다는 점에서 또 다른 차이가 있었습니다.

상태가 바뀌면 컴포넌트 함수가 다시 실행되고, React가 이전 결과와 비교해 바뀐 부분만 실제 화면에 반영합니다. 이 구조를 이해하고 나니, 훅이 호출 순서에 의존해 상태를 추적한다는 점과 왜 조건문 안에서 훅을 사용할 수 없는지도 자연스럽게 연결됐습니다.

<br>

### UI 작성 — UIKit과 SwiftUI 사이, 그러나 결국은 Flexbox

dogether-iOS는 UIKit 기반으로 구현했지만, SwiftUI도 사용해본 경험이 있어서 RN의 선언형 UI 접근 자체가 완전히 낯설지는 않았습니다.   
다만 RN은 Apple 플랫폼의 레이아웃 시스템이 아니라, JSX와 Flexbox를 중심으로 화면을 구성한다는 점에서 차이가 분명했습니다.

스타일은 StyleSheet.create({})로 분리하고, 레이아웃은 Flexbox 규칙을 따릅니다.   
방향성과 배치 개념은 SwiftUI의 VStack/HStack과 비슷하게 느껴질 수 있지만, 실제로는 CSS Flexbox 모델을 정확히 이해하는 것이 더 중요했습니다.   
특히 부모-자식 간 공간 분배와 정렬 기준을 명확히 이해하고 나니 화면 구조를 훨씬 예측 가능하게 다룰 수 있었습니다.   
반면 그림자, 모서리 처리, 클리핑처럼 플랫폼별 차이가 드러나는 영역에서는 iOS와 Android를 각각 확인해야 했습니다.

<br>

## 크로스플랫폼 개발, 직접 해보니

### 체감한 장점

**공통 로직 재사용**  
Repository, UseCase, 상태 관리, 에러 처리 같은 핵심 로직은 하나의 코드베이스에서 공통으로 유지할 수 있었습니다. 화면 구조와 흐름을 한 번 설계하면 Android에서 추가 작업 없이 동일하게 동작했고, 플랫폼별로 따로 구현했다면 반복해야 했을 작업을 공유할 수 있었습니다. 플랫폼 차이는 주로 권한, 키보드, 로그인 복귀, 이미지 선택처럼 네이티브 경계에서만 발생했습니다.

**개발 속도**  
Fast Refresh 덕분에 단순 UI 수정은 재빌드 없이 빠르게 확인할 수 있었습니다. 화면 구조를 조정하거나 스타일을 다듬는 작업에서는 피드백 사이클이 짧아지는 장점이 분명했습니다.

<br>

### 체감한 단점

**네이티브 레이어 디버깅의 어려움**  
카카오 로그인, 이미지 피커처럼 네이티브 모듈과 연결되는 기능은 JS 레벨만으로 원인을 좁히기 어려웠습니다. 실제로는 Android 로그나 iOS 네이티브 동작까지 함께 봐야 하는 경우가 있었고, 플랫폼 동작을 이해하고 있는 것이 디버깅에 도움이 됐습니다.

**라이브러리 호환성 관리**  
Expo SDK 버전에 맞춰 서드파티 라이브러리 호환성을 확인해야 했습니다. 네이티브에서 CocoaPods나 패키지 버전 충돌을 관리하듯, RN에서도 SDK와 라이브러리 버전 조합을 계속 확인해야 했습니다.

**플랫폼 고유 UX 재현의 한계**  
플랫폼 고유의 인터랙션을 그대로 재현하려면 추가 작업이 필요했고, 일부 영역에서는 네이티브 수준의 디테일을 맞추기 위해 더 세밀한 조정이 필요했습니다.

---

## Android 인증 이미지 업로드 트러블슈팅

  ### 1. 상황
  
  같은 인증하기 플로우에서 iOS는 정상적으로 동작했지만, Android에서는 사진을 선택하거나 촬영한 뒤 마지막 `인증하기` 버튼을 누르면 업로드가 실패했습니다.  
  UI 상으로는 공통 화면과 공통 로직을 사용하고 있었기 때문에 처음에는 동일하게 동작할 것처럼 보였지만, 실제 업로드 단계에서 플랫폼 차이가 드러났습니다.
  
  ### 2. 문제
  
  초기에는 로컬 이미지 URI 처리 문제로 보였습니다.
  
  - iOS에서는 선택한 이미지가 비교적 단순한 파일 경로로 다뤄졌고 업로드가 정상 동작했습니다.
  - Android에서는 `content://...` 또는 `file://...` 형태의 URI가 들어왔고, 업로드 단계에서 이 로컬 이미지 경로가 그대로 네트워크 요청처럼 처리되거나, S3 presigned URL 업로드가 `403`으로 실패했습니다.
  
  실제 Android 로그에서는 아래와 같은 문제가 확인됐습니다.
  
  - `Expected URL scheme 'http' or 'https' but was 'file'`
  - 이후 업로드 경로를 바꾼 뒤에는 `S3 presigned PUT` 요청 자체는 갔지만 `403 Forbidden`
  
  즉 Android에서는 단순히 “파일 선택” 문제가 아니라,
  **로컬 URI 처리 방식과 업로드 요청 형식이 iOS와 다르게 동작하고 있었습니다.**
  
  ### 3. 해결 과정
  
  #### 1) Android 로컬 URI 정규화
  
  Android에서는 이미지가 `content://` 또는 `file://` URI로 들어올 수 있어, 먼저 앱 캐시 디렉터리로 파일을 복사한 뒤 업로드용 경로를 정규화했습니다.
  
  - 원본 URI를 그대로 사용하지 않고
  - Android에서는 항상 캐시 파일 경로로 변환해서 사용하도록 변경
  
  이 단계로 로컬 파일 경로가 네트워크 URL처럼 잘못 처리되는 문제를 먼저 제거했습니다.
  
  #### 2) 업로드 경로 분리
  
  이후에도 Android에서만 S3 업로드가 `403`으로 실패했습니다.  
  로그를 추가해 확인해보니, presigned URL 자체는 정상으로 발급되고 있었고, Android에서만 업로드 요청 형식이 달라지고 있었습니다.
  
  그래서 업로드 방식을 플랫폼별로 분리했습니다.
  
  - **iOS**
    - `expo-file-system`의 `uploadAsync` 사용
  - **Android**
    - 로컬 파일을 Base64로 읽은 뒤 바이트 배열로 변환
    - 그 바이트 데이터를 `fetch(..., { method: 'PUT', body })`로 직접 업로드
  
  즉 Android는 네이티브 업로드 API 대신, **파일 내용을 직접 읽어 바이트 단위로 PUT 업로드**하도록 변경했습니다.
  
  #### 3) Content-Type 고정
  
  추가로 dev 백엔드에서 발급하는 S3 presigned URL 조건을 확인하면서, Android 업로드 요청의 `Content-Type`도 서버가 기대하는 값에 맞춰 고정했습니다.
  
  - `Content-Type: image/png`
  
  이 부분이 presigned URL 검증 조건과 맞지 않으면, S3는 같은 URL이어도 `403`을 반환할 수 있습니다.
  
  #### 4) 디버깅 로그 추가
  
  문제를 빠르게 좁히기 위해 업로드 직전에 아래 정보가 보이도록 로그도 추가했습니다.
  
  - 원본 로컬 URI
  - 정규화된 업로드 URI
  - presigned URL host
  - 업로드 실패 시 HTTP status / response body
  
  이 로그를 통해
  - “로컬 URI 문제인지”
  - “presigned URL 발급 문제인지”
  - “업로드 요청 형식 문제인지”
  를 단계별로 나눠서 확인할 수 있었습니다.
  
  ### 4. 결과
  
  수정 후에는 Android에서도 인증하기 플로우가 iOS와 동일하게 동작했습니다.
  
  - 사진 선택 / 촬영 후 마지막 `인증하기` 제출 가능
  - Android에서만 발생하던 업로드 실패 해결
  - 공통 UI를 유지하면서도, **플랫폼별 파일 처리와 업로드 구현은 분기해서 대응**하는 구조로 정리
  
  이 경험을 통해 확인한 점은,
  React Native에서 화면과 비즈니스 로직은 상당 부분 공통으로 가져갈 수 있지만,  
  **이미지 선택, 로컬 파일 URI, 업로드 요청처럼 네이티브 경계에 가까운 기능은 플랫폼별 동작 차이를 반드시 고려해야 한다**는 것이었습니다.


---

### 느낀점

이 과정을 통해 느낀 점은, RN이 플랫폼 차이를 추상화해주긴 하지만 완전히 없애주지는 않는다는 것이었습니다. 공통 코드의 범위는 분명 넓어지지만, 네이티브 동작과 맞닿는 지점에서는 결국 각 플랫폼을 이해하고 있어야 안정적으로 대응할 수 있었습니다.

<br>
