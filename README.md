### **개요**

- 프로젝트 기간: 2026.03
- 인원: 개인 프로젝트
- 기술스택: **React Native** · **Expo** · **TypeScript** · **Expo Router** · **React Query** · **Zustand** · **MMKV** · **Axios**

---

### 서비스 설명

온보딩, 그룹 참여, 메인, 인증, 리뷰, 랭킹, 통계, 설정 등 Dogether의 주요 앱 플로우를 React Native로 재구현하며, 화면 구조·상태 관리·서버 통신 흐름을 RN 생태계에 맞게 재설계한 프로젝트

---

### 아키텍처 구조도

<img width="852" height="121" alt="스크린샷 2026-05-11 오후 3 30 38" src="https://github.com/user-attachments/assets/0ea4a616-5517-4cd8-91ef-f5ab938d8e44" />


---

### **기술적 주요성과**

- **Screen · Custom Hook · UseCase · Repository 계층 분리로 화면 복잡도 관리**
    - 화면 렌더링, 상태 조합, 비즈니스 로직 호출, 데이터 접근 책임을 계층별로 분리
    - Screen 컴포넌트는 UI 렌더링과 이벤트 연결에 집중하고, 서버 데이터 조회와 파생 상태 계산은 Custom Hook에서 처리
    - UseCase는 화면에서 필요한 기능 호출 단위를 제공하고, Repository는 실제 API 통신과 Mock 데이터 접근을 담당하도록 구성
    
- **Custom Hook 중심의 화면 상태와 사용자 액션 관리**
    - useMainScreen, useReviewScreen, useGroupSelection 등 화면 흐름 단위의 Custom Hook을 구성
    - 선택 그룹, 날짜 이동 가능 여부, 필터링된 투두 목록, 리뷰 제출 가능 여부처럼 화면에 필요한 파생 상태를 Hook에서 계산
    - 리뷰 제출, 그룹 선택, 날짜 이동, 필터 변경 등 사용자 액션 흐름을 Screen 밖으로 분리해 컴포넌트의 렌더링 책임을 명확화
    
- **React Query와 Zustand의 역할 분리로 상태 관리 흐름 정리**
    - 그룹 목록, 투두, 랭킹, 통계, 리뷰 대기 목록 등 서버 데이터는 React Query로 관리
    - 선택 그룹, 날짜 오프셋, 필터, bottom sheet 상태, 리뷰 완료 토스트 등 클라이언트 UI 상태는 Zustand로 관리
    - 투두 작성, 인증 제출, 리뷰 완료, 그룹 생성/참여 이후 관련 query를 invalidate해 서버 상태를 최신화
    - 로그인 세션과 마지막 선택 그룹처럼 앱 재실행 후에도 유지되어야 하는 값은 MMKV에 저장
    
- **Repository Interface와 도메인 모델 매핑으로 데이터 흐름 명확화**
    - TypeScript Interface로 Repository 계약을 정의하고 실제 API 구현체와 Mock 구현체가 같은 계약을 따르도록 구성
    - API 응답 필드명과 서버 상태값을 Repository 계층에서 앱 내부 도메인 모델로 변환
    - Screen과 Custom Hook은 API 응답 원본이 아니라 Group, Todo, Review, Ranking 같은 앱 모델에 의존하도록 구성
    - JoinGroupResult처럼 성공/실패 케이스를 union type으로 정의해 화면에서 처리해야 하는 분기를 타입으로 표현
    
- **공통 API 클라이언트와 AppError 모델로 서버 통신/에러 처리 표준화**
    - Axios 기반 공통 API 클라이언트에서 baseURL, timeout, JSON header, 인증 토큰 주입을 공통화
    - 서버 에러 코드를 앱 전용 AppError로 변환해 화면별 에러 처리 방식을 일관되게 구성
    - fullScreen / alert 에러 표현을 구분해 일반 서버 오류, 인증 오류, 그룹 참여 오류를 상황에 맞게 처리
    - Repository 계층에서 API 예외를 AppError로 변환해 Screen은 에러 표시 방식에 집중하도록 구성

---

### iOS에서 RN으로 전환하며 달라진 설계 기준

#### **1. ViewModel 중심 구조에서 Custom Hook 기반 화면 로직 분리로 전환**

- **기존 iOS 구조**
    - ViewController와 ViewModel을 분리해 화면 상태, 사용자 액션, 서버 데이터 요청 흐름 관리
    - RxSwift/RxRelay 기반 상태 스트림을 통해 ViewModel의 상태 변경을 ViewController에 바인딩
    - ViewController는 UI 이벤트 전달, 상태 구독, 화면 전환 요청에 집중
    - 화면별 ViewModel을 기준으로 해당 화면의 상태 가공과 주요 비즈니스 흐름을 관리
    
- **RN에서의 접근**
    - RN의 함수형 컴포넌트 구조에 맞춰 핵심 화면 로직을 Custom Hook으로 분리
    - useMainScreen, useReviewScreen, useGroupSelection 등 화면 흐름 단위로 상태 조회, 파생 데이터 계산, 주요 액션을 관리
    - Screen 컴포넌트는 Hook이 반환한 값과 액션을 사용해 UI 렌더링과 사용자 이벤트 연결에 집중
    - 반복적으로 커질 수 있는 조건 분기, 데이터 가공, 액션 처리 흐름을 Screen 밖으로 분리해 컴포넌트 복잡도 감소
    
- **전환하며 느낀 차이**
    - iOS는 ViewModel이 상태를 보관하고 ViewController가 변경을 구독하는 흐름이었다면, RN은 Hook에서 반환한 값의 변경이 컴포넌트 렌더링 흐름과 직접 연결됨
    - ViewModel처럼 화면 단위 객체를 두는 방식보다, 화면에서 필요한 로직을 Hook 단위로 조합하는 방식이 RN의 함수형 컴포넌트 구조에 더 자연스러웠음
    - 화면에 필요한 데이터 가공, 선택값 처리, 액션 흐름을 Hook에서 정리하고 Screen은 렌더링 구조를 명확히 드러내는 방향으로 전환
    - ViewModel 단위가 아니라 화면 흐름과 상태 사용 범위를 기준으로 로직 분리 기준을 재정립
    

#### **2. RxSwift 상태 스트림에서 React Query / Zustand 역할 분리로 전환**

- **기존 iOS 구조**
    - ViewModel에서 API 응답, 로딩, 에러, UI 상태를 함께 가공해 화면 상태로 관리
    - BehaviorRelay 기반 상태 변경을 ViewController에 전달하고, ViewController는 이를 구독해 화면 업데이트
    - 서버 데이터와 화면 전용 상태가 ViewModel 안에서 함께 관리되는 구조
    - 화면 갱신이 필요한 값들을 ViewData 형태로 묶어 ViewController에 전달
    
- **RN에서의 접근**
    - 상태의 성격을 기준으로 서버 상태와 클라이언트 UI 상태를 분리
    - 그룹 목록, 투두, 랭킹, 통계, 리뷰 대기 목록, 인증 목록 등 원격 데이터는 React Query로 관리
    - 선택 그룹, 날짜 오프셋, 필터, bottom sheet 확장 여부, 리뷰 토스트 등 화면 중심 상태는 Zustand Store로 관리
    - 세션 정보와 마지막 선택 그룹처럼 앱을 다시 실행해도 유지되어야 하는 값은 MMKV에 저장
    - 서버 상태는 캐싱/로딩/에러/리패치 흐름을 포함해 쿼리 단위로 관리하고, 앱이 직접 소유하는 UI 상태는 별도 Store에서 관리
    
- **전환하며 느낀 차이**
    - iOS에서는 서버 응답을 ViewData에 반영해 화면 상태로 전달했다면, RN에서는 React Query의 쿼리 키와 캐시를 기준으로 서버 상태를 관리하고 필요 시 리패치/무효화하는 방식으로 전환
    - Zustand는 서버 응답 저장소가 아니라 선택값, 필터, 토스트처럼 앱이 직접 변경하고 유지해야 하는 UI 상태 관리에 적합했음
    - 같은 화면에서 사용하는 값이라도 서버에서 온 데이터인지, 사용자의 화면 조작으로 생긴 상태인지에 따라 관리 위치를 다르게 설계하게 됨
    

#### **3. Coordinator 기반 화면 전환에서 Expo Router 기반 라우팅으로 전환**

- **기존 iOS 구조**
    - NavigationCoordinator가 화면 생성과 전환 책임을 담당
    - push, pop, root 화면 교체, popup, modal, error 화면, 딥링크 대응 등 화면 전환 정책을 Coordinator에서 관리
    - 각 ViewController는 직접 다음 화면을 생성해 전환하기보다 Coordinator를 통해 화면 이동 요청
    - 화면 이동 시 필요한 데이터는 ViewController 인스턴스에 ViewData 형태로 전달
    
- **RN에서의 접근**
    - Expo Router의 파일 기반 라우팅으로 화면 경로와 사용자 플로우 구성
    - 온보딩, 그룹 생성/참여, 메인, 리뷰, 랭킹, 통계, 설정, 인증 화면을 route 단위로 분리
    - 화면 이동은 View 인스턴스 생성이 아니라 router.push, router.replace, router.back 같은 navigation action 중심으로 처리
    - 앱 실행 시 세션 여부, 강제 업데이트 여부, 참여 그룹 여부, 대기 리뷰 여부를 기준으로 초기 진입 화면 결정
    - 초기 진입 판단 로직은 AppLaunchUseCase로 분리해 화면 컴포넌트와 라우팅 조건 판단 책임을 분리
    
- **전환하며 느낀 차이**
    - iOS Coordinator는 화면 생성과 전환 정책을 코드에서 중앙 관리하는 구조였다면, Expo Router는 파일 구조를 기준으로 화면 경로가 먼저 드러나는 구조였음
    - iOS에서는 ViewController 인스턴스를 생성하고 필요한 데이터를 주입해 이동했다면, RN에서는 route 경로와 navigation action을 기준으로 화면 흐름을 구성
    - 초기 진입처럼 조건이 많은 라우팅은 Screen 내부에 직접 분기하기보다 UseCase로 분리해 판단 기준을 명확히 관리
    - 파일 기반 라우팅을 사용하면서 전체 화면 목록과 플로우를 프로젝트 구조만으로도 파악하기 쉬웠음
    

#### **4. DTO 기반 데이터 변환 흐름을 TypeScript 타입 기반 모델 매핑으로 전환**

- **기존 iOS 구조**
    - Repository/DataSource에서 비동기 API 요청을 수행하고 Decodable Response DTO로 서버 응답 수신
    - UseCase 또는 Repository에서 Response DTO를 앱 내부에서 사용할 Entity, ViewData 형태로 변환
    - ViewModel은 변환된 Entity/ViewData를 기반으로 화면 상태를 구성
    - Swift의 Decodable, struct, enum을 활용해 서버 응답과 앱 내부 모델을 타입으로 구분
    
- **RN에서의 접근**
    - Repository 구현체에서 비동기 API 요청을 수행하고 API 응답 타입으로 서버 응답 수신
    - Repository 계층에서 서버 응답 필드와 상태값을 앱 내부 model 타입으로 변환
    - UseCase와 Hook은 변환된 도메인 모델을 사용해 화면에 필요한 데이터 흐름 구성
    - TypeScript의 type, interface, union type을 활용해 API 응답 구조와 앱 내부 모델의 차이를 명시
    
- **전환하며 느낀 차이**
    - iOS에서는 Decodable DTO를 통해 서버 응답을 받고 Entity/ViewData로 변환하는 흐름이었다면, RN에서는 TypeScript 타입을 기준으로 API 응답과 앱 내부 모델을 구분해 매핑
    - Swift는 런타임 디코딩 단계에서 응답 구조를 모델로 변환하는 성격이 강했고, TypeScript는 컴파일 타임 타입 정의를 통해 데이터 사용 형태를 점검하는 방식에 가까웠음
    - RN에서는 서버 응답의 필드명, enum 값, nullable 값을 Repository 매핑 계층에서 정리해 Hook과 Screen이 일관된 모델만 다루도록 구성
    - 결과적으로 화면 로직은 API 응답 원본보다 앱 내부 모델에 의존하게 되어, 서버 응답 구조 변경 시 수정 범위를 Repository 계층으로 줄일 수 있었음
