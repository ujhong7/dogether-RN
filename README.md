# Dogether RN

iOS에서 구현한 Dogether의 핵심 동작을 RN에 맞는 방식으로 재구성한 학습/포트폴리오 프로젝트입니다.

## 왜 이렇게 구성했는가
- 동일 기능 유지: Splash 분기, 로그인, Start/Main/Ranking/My/Settings 흐름 유지
- 구현 방식 변환: UIKit + Rx 중심 구조를 RN 친화 스택으로 전환
- 취업 포인트: iOS 중심 경험을 RN으로 확장한 증거

## 기술 스택
- Expo + TypeScript + expo-router
- React Query (서버 상태)
- Zustand (클라이언트 상태)
- MMKV (세션 저장)
- axios (네트워크)

## 구조
- `app/`: 라우팅 및 화면
- `src/data`: API/Repository 구현
- `src/domain`: Entity/Repository interface/UseCase
- `src/features`: 화면 단위 훅
- `src/store`: Zustand 상태
- `docs/IOS_TO_RN_ANALYSIS.md`: iOS 분석 및 RN 변환 기준

## 실행
```bash
npm install
npm run ios
```
