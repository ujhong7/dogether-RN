# dogether-RN

## 프로젝트 개요

- **프로젝트 기간:** 2025.06 - 진행중
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

`npm run start:mock` 명령 하나로 서버 연동 없이 전체 플로우를 실행할 수 있어, 개발 초기부터 UI 검증이 가능한 환경을 구축했습니다.

<br>

### 서버 상태 / 클라이언트 상태 책임 분리

상태 종류에 따라 도구를 명확히 나눠 각 상태의 책임 범위를 좁혔습니다.

| 상태 종류 | 도구 | 예시 |
|-----------|------|------|
| 서버 상태 (API 응답) | React Query | 그룹 목록, 투두, 랭킹 |
| 전역 UI 상태 | Zustand | 선택된 그룹 ID, 날짜 오프셋, 필터 |
| 인증 세션 | Zustand + MMKV | 액세스 토큰, 로그인 타입 |
| 화면 로컬 상태 | useState | 바텀시트 열림 여부 |

React Query가 캐싱·로딩·에러·리패치를 자동으로 처리하므로, 화면 코드는 데이터를 구독하고 표현하는 역할에만 집중할 수 있었습니다.

<br>

### iOS 아키텍처 계층을 RN 방식으로 재해석

iOS에서 익숙한 계층 구조를 RN에서 자연스러운 방식으로 변환했습니다.

| iOS (MVVM + Clean) | React Native |
|--------------------|--------------|
| ViewController / View | Screen + 컴포넌트 |
| ViewModel | Custom Hook (`useMainScreen`) |
| UseCase | UseCase (`services/usecases`) |
| Repository Protocol | Repository Interface (`contracts/`) |
| Entity | Model (`models/`) |

ViewModel 역할을 하는 Custom Hook이 UseCase를 호출하고, 파생 상태와 핸들러를 화면에 제공하는 구조를 일관되게 적용했습니다.

<br>

### iOS → Android 크로스플랫폼 대응

단일 코드베이스에서 플랫폼 차이로 인해 발생한 문제들을 직접 해결했습니다.

**카카오 로그인 리다이렉트**
iOS는 커스텀 URL 스킴이 자동 처리되지만, Android는 `AndroidManifest.xml`에 `intent-filter`를 별도 등록해야 합니다. 로그인 완료 후 앱으로 돌아오지 못하는 문제를 이 과정에서 파악하고 수정했습니다.

**이미지 피커 권한 분기**
Android는 OS 버전(API 33 이상/미만)에 따라 요청해야 하는 권한이 다릅니다. expo-image-picker의 권한 요청 결과를 OS 버전 기준으로 분기 처리해 정상 동작을 확인했습니다.

**키보드 레이아웃**
iOS와 Android의 키보드 동작 차이로 인해 `KeyboardAvoidingView`의 `behavior` 값을 플랫폼별로 다르게 설정해야 했습니다.

```ts
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
```

<br>

### 코드 가독성 및 역할 분리 중심 리팩토링

기능 구현 이후, 처음 보는 사람도 구조를 파악할 수 있도록 리팩토링을 반복했습니다.

- 두 곳에 흩어진 날짜 유틸 함수를 `dateUtils.ts`로 통합해 중복 제거
- 480줄짜리 `styles.ts`를 컴포넌트별 StyleSheet로 분산해 파일 응집도 향상
- `MainScreen`이 직접 UseCase를 생성하던 구조를 `useGroupSelection` 훅으로 분리
- 스토리지 관련 파일을 `lib/storage/` 서브폴더로 그룹화하고 `index.ts`로 재export
- Repository를 `impl/` `mock/` `mock/data/` 계층으로 분리해 탐색 비용 감소
- toast UI + store 구독 + 타이머 로직을 `ReviewToast` 컴포넌트로 응집

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

## iOS 프로젝트와 비교

| | [dogether-iOS](https://github.com/ujhong7/dogether-iOS) | dogether-RN |
|--|------|------|
| 언어 | Swift | TypeScript |
| UI | UIKit | React Native |
| 라우팅 | Coordinator | Expo Router |
| 상태관리 | RxSwift + Combine | Zustand + React Query |
| 로컬 저장소 | UserDefaults | MMKV |
| 의존성 주입 | DIManager | 팩토리 함수 |
| 플랫폼 | iOS only | iOS + Android |
