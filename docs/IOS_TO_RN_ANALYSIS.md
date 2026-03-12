# Dogether iOS -> RN Analysis

## 목표
- iOS 앱 구현을 그대로 복제하지 않는다.
- 사용자 관점의 기능/동작을 유지하고, RN 생태계에 맞게 재설계한다.
- 취업 포트폴리오에서 "iOS 경험을 RN으로 확장"했다는 점을 명확히 보여준다.

## iOS 앱 핵심 동작
- 앱 시작 분기: 강제 업데이트 -> 온보딩(로그인) -> 그룹 참여 여부에 따라 Start/Main 이동
- 메인: 그룹 선택, 날짜 이동, 투두 목록/인증 상태 조회, 필터, 인증 화면 이동
- 그룹: 생성/참여/탈퇴, 랭킹 조회, 마지막 선택 그룹 저장
- 마이페이지: 프로필/통계/인증 리스트 진입
- 설정: 로그아웃/탈퇴
- 부가: 딥링크 초대코드 진입, 푸시 대응, S3 presigned 업로드

## iOS 기술 특징(요약)
- 구조: Data / Domain / Presentation 분리 + UseCase
- UI: UIKit + SnapKit
- 상태/바인딩: RxSwift(Relay)
- 네트워크: Endpoint Router + Repository + DataSource
- 외부 SDK: Firebase, ChottuLink, Lottie, Kingfisher

## RN 변환 원칙
- 라우팅: expo-router
- 서버 상태: React Query
- 앱 상태: Zustand
- 세션 저장: MMKV
- 네트워크: axios
- 폼/검증: React Hook Form + Zod (확장 여지)

## RN에서 구현한 대응 기능
- Splash 분기 로직 구현 (update/onboarding/start/main)
- Onboarding 로그인(학습용 demo login + API 스텁 연동)
- Main/Ranking/My/Settings 화면 및 기본 API 흐름
- 그룹/투두/랭킹/프로필 조회를 Repository + UseCase로 분리

## 포트폴리오 메시지
- 같은 서비스 흐름을 iOS와 RN에서 모두 구현했다.
- iOS의 계층형 사고는 유지하되, RN 도구(React Query/Zustand/Router)에 맞춰 최적화했다.
- 단순 화면 복제가 아니라 "플랫폼별 적합한 구현"을 수행했다.
