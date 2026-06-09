# Expo와 RN CLI 차이 읽는 법

이 문서는 React Native를 시작할 때 자주 나오는 두 가지 선택지인 `Expo`와 `React Native CLI`의 차이를 이해하기 위한 문서입니다.

처음에는 "RN에는 Expo랑 CLI 두 방법이 있다" 정도로 들리기 쉽습니다.

조금 더 정확히 말하면 다음에 가깝습니다.

```text
Expo
-> React Native 앱을 더 쉽게 만들고 빌드하고 배포하게 해주는 프레임워크/도구 모음

React Native CLI
-> Expo 같은 프레임워크 없이 iOS/Android 네이티브 프로젝트를 직접 관리하는 방식
```

Dogether RN은 `Expo` 기반 프로젝트입니다.

---

## 1. React Native 자체와 실행 도구는 다르다

React Native는 앱 화면을 만드는 핵심 기술입니다.

```text
React Native
-> View, Text, Pressable 같은 컴포넌트
-> JavaScript/TypeScript로 화면과 로직 작성
-> iOS/Android 네이티브 UI로 연결
```

반면 Expo나 CLI는 React Native 앱을 만들고 실행하고 빌드하는 개발 방식에 가깝습니다.

```text
React Native = 앱을 만드는 엔진
Expo / CLI = 그 엔진을 어떻게 굴릴지 정하는 개발 환경
```

iOS로 비유하면 React Native는 UIKit/SwiftUI에 가깝고, Expo/CLI 선택은 Xcode 프로젝트와 빌드 설정을 얼마나 직접 만질지에 대한 선택에 가깝습니다.

---

## 2. Expo란?

Expo는 React Native 위에 얹어진 프레임워크이자 도구 모음입니다.

Expo를 쓰면 앱 실행, 라우팅, 이미지 선택, 파일 시스템, 권한, OTA 업데이트, 빌드 서비스 같은 것들을 더 정리된 방식으로 사용할 수 있습니다.

이 프로젝트도 Expo 기반이라 아래 기술들이 자연스럽게 같이 쓰입니다.

```text
Expo
Expo Router
expo-image-picker
expo-file-system
expo-apple-authentication
EAS / OTA 업데이트 개념
```

Expo 프로젝트에서는 보통 아래 명령으로 개발 서버를 띄웁니다.

```bash
npx expo start
```

그리고 iOS/Android 네이티브 프로젝트가 필요할 때는 Expo가 `ios/`, `android/` 폴더를 생성해줄 수 있습니다.

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

즉 Expo를 쓴다고 해서 네이티브 코드를 전혀 못 쓰는 것은 아닙니다.

요즘 Expo는 `prebuild`, `development build`, `config plugin` 같은 흐름을 통해 네이티브 설정이 필요한 앱도 다룰 수 있습니다.

---

## 3. Expo Go와 Development Build

Expo를 이해할 때 `Expo Go`와 `Development Build`를 나눠야 합니다.

| 항목 | 의미 |
| --- | --- |
| Expo Go | Expo가 미리 만들어 둔 테스트용 앱 |
| Development Build | 우리 프로젝트의 네이티브 의존성과 설정을 포함해 만든 개발용 앱 |

처음 React Native를 배울 때는 Expo Go가 편합니다.

```text
npx expo start
-> QR 스캔
-> Expo Go에서 앱 확인
```

하지만 Expo Go에는 모든 네이티브 모듈이 들어 있는 것이 아닙니다.

예를 들어 프로젝트가 특정 네이티브 SDK, 커스텀 네이티브 모듈, 별도 iOS/Android 설정을 필요로 하면 Expo Go만으로는 부족할 수 있습니다.

그때는 Development Build를 만듭니다.

```text
내 프로젝트 전용 개발 앱
-> 내가 설치한 네이티브 라이브러리 포함
-> Expo 개발 편의성은 유지
-> 실제 앱에 가까운 환경에서 테스트
```

Dogether RN처럼 Kakao 로그인, MMKV, 이미지/파일 처리처럼 네이티브 기능과 가까운 라이브러리를 쓰는 프로젝트에서는 Expo Go보다 Development Build 감각이 더 중요합니다.

---

## 4. React Native CLI란?

React Native CLI 방식은 Expo 같은 프레임워크에 기대지 않고 React Native 프로젝트를 직접 구성하는 방식입니다.

보통 아래처럼 프로젝트를 만들고, 처음부터 `ios/`, `android/` 폴더를 직접 관리합니다.

```bash
npx @react-native-community/cli init MyApp
```

이 방식에서는 Xcode 프로젝트, Gradle 설정, Podfile, native dependency 연결을 개발자가 더 직접 만집니다.

```text
ios/
  MyApp.xcodeproj
  Podfile
  AppDelegate

android/
  build.gradle
  MainActivity
  AndroidManifest.xml
```

iOS 개발자 입장에서는 익숙한 부분도 있습니다.

```text
Xcode 설정을 직접 본다
Info.plist를 직접 수정한다
Podfile을 직접 관리한다
Swift/Objective-C 코드를 바로 추가한다
```

대신 초기 설정, 네이티브 라이브러리 연결, 빌드 오류 해결을 직접 감당해야 하는 일이 많아집니다.

---

## 5. Expo와 CLI 비교

| 기준 | Expo | RN CLI |
| --- | --- | --- |
| 시작 난이도 | 낮음 | 높음 |
| 기본 개발 경험 | 빠르게 실행하고 확인하기 좋음 | 네이티브 환경 설정을 먼저 맞춰야 함 |
| iOS/Android 폴더 | 기본적으로 숨기거나 생성해서 사용 | 처음부터 직접 관리 |
| 네이티브 설정 | app config, prebuild, config plugin 중심 | Xcode/Gradle 파일 직접 수정 |
| 네이티브 코드 자유도 | 충분히 가능하지만 Expo 방식 이해 필요 | 가장 직접적 |
| OTA 업데이트 | Expo Updates/EAS 흐름이 잘 준비되어 있음 | 별도 도구와 구성이 필요 |
| 초보자 학습 | RN 개념에 집중하기 쉬움 | 네이티브 빌드 지식도 같이 필요 |
| 대규모 커스텀 네이티브 앱 | 가능하지만 설계가 중요 | 직접 제어하기 쉬움 |

짧게 말하면 다음과 같습니다.

```text
Expo
-> 앱 기능 개발에 빨리 들어가고 싶을 때 좋다.

RN CLI
-> 네이티브 프로젝트를 처음부터 직접 통제해야 할 때 좋다.
```

---

## 6. 요즘은 둘의 경계가 예전보다 흐려졌다

예전에는 이렇게 단순하게 말하는 경우가 많았습니다.

```text
Expo = 쉽지만 네이티브 제약이 많다
CLI = 어렵지만 자유롭다
```

이 설명은 완전히 틀리지는 않지만, 요즘 기준으로는 조금 오래된 감각입니다.

Expo에서도 `prebuild`를 통해 `ios/`, `android/` 폴더를 만들 수 있고, Development Build를 통해 프로젝트 전용 네이티브 런타임을 사용할 수 있습니다.

```text
Expo 프로젝트
-> app.json / app.config.js로 네이티브 설정 표현
-> npx expo prebuild
-> ios/ android/ 생성
-> npx expo run:ios / run:android
```

그래서 요즘에는 Expo를 "초보자용 제한된 도구"라기보다, React Native 앱을 만들기 위한 프레임워크로 보는 것이 더 정확합니다.

React Native 공식 문서에서도 새 프로젝트를 만들 때 Expo 같은 React Native 프레임워크를 사용하는 흐름을 먼저 안내합니다.

---

## 7. Dogether RN은 어느 쪽인가?

Dogether RN은 Expo 기반입니다.

`package.json`과 프로젝트 구조를 보면 다음 특징이 보입니다.

```text
app/
  _layout.tsx
  index.tsx
  main.tsx

src/
  screens/
  hooks/
  queries/
  services/

app.json 또는 app.config 계열 설정
Expo Router 사용
Expo SDK 패키지 사용
```

특히 `app` 폴더 기반 라우팅은 Expo Router의 특징입니다.

```text
app/main.tsx
-> /main route
```

따라서 이 프로젝트를 읽을 때는 아래 감각이 좋습니다.

```text
React Native로 화면을 만든다.
Expo가 실행/빌드/라우팅/업데이트 흐름을 도와준다.
필요하면 Expo prebuild나 development build로 네이티브 영역까지 내려간다.
```

---

## 8. 언제 Expo를 선택할까?

Expo는 이런 경우에 잘 맞습니다.

| 상황 | 이유 |
| --- | --- |
| 빠르게 앱을 만들고 싶다 | 초기 설정이 적고 실행이 쉽다 |
| RN 학습이 목적이다 | Xcode/Gradle보다 화면과 상태 관리에 집중할 수 있다 |
| OTA 업데이트가 필요하다 | Expo Updates/EAS 흐름을 사용할 수 있다 |
| 라우팅을 파일 기반으로 쓰고 싶다 | Expo Router를 바로 사용할 수 있다 |
| 일반적인 모바일 기능이 많다 | Expo SDK가 권한, 이미지, 파일, 알림 등을 제공한다 |

대부분의 신규 React Native 앱은 Expo로 시작해도 충분합니다.

---

## 9. 언제 RN CLI를 선택할까?

RN CLI 방식은 이런 경우에 고려할 수 있습니다.

| 상황 | 이유 |
| --- | --- |
| 기존 iOS/Android 앱에 RN을 부분 도입한다 | 네이티브 앱 구조가 이미 존재한다 |
| 네이티브 설정을 매우 세밀하게 통제해야 한다 | Xcode/Gradle을 직접 관리하는 편이 명확할 수 있다 |
| 회사에 기존 RN CLI 인프라가 있다 | 빌드/배포/운영 방식이 이미 정해져 있을 수 있다 |
| Expo 방식과 맞지 않는 특수한 네이티브 요구사항이 있다 | 직접 제어가 더 단순할 수 있다 |

다만 "네이티브 기능을 써야 하니까 무조건 CLI"라고 생각할 필요는 없습니다.

Expo Development Build로 해결되는 경우가 많습니다.

---

## 10. 처음 공부할 때의 추천 순서

처음에는 아래 순서로 이해하면 덜 헷갈립니다.

```text
1. React Native 컴포넌트와 JSX를 이해한다.
2. Expo가 개발 서버, 빌드, 라우팅을 도와준다는 점을 이해한다.
3. Expo Go와 Development Build 차이를 이해한다.
4. prebuild가 ios/android 폴더를 만들어주는 흐름을 이해한다.
5. 필요할 때 RN CLI 방식과 비교한다.
```

Dogether RN을 읽는 목적이라면 CLI를 깊게 파기보다, Expo 기반 프로젝트가 어떻게 구성되는지 먼저 보는 것이 좋습니다.

이 프로젝트에서는 특히 아래 문서들과 같이 읽으면 좋습니다.

| 문서 | 같이 보면 좋은 이유 |
| --- | --- |
| `01_dogether_RN_기술_정리.md` | 이 프로젝트가 Expo 기반임을 전체적으로 확인 |
| `02_dogether_RN_프로젝트_읽는_법.md` | `app` 폴더와 `src` 폴더 구조 이해 |
| `07_expo_router_화면이동_읽는_법.md` | Expo Router가 route를 만드는 방식 이해 |
| `21_RN_렌더링과_OTA_업데이트_읽는_법.md` | Expo OTA 업데이트와 JS bundle 감각 이해 |

---

## 한 줄 정리

```text
React Native는 앱을 만드는 기술이고,
Expo는 그 RN 앱을 편하게 개발/빌드/배포하게 해주는 프레임워크이며,
RN CLI는 Expo 없이 네이티브 프로젝트를 직접 관리하는 방식이다.
```

Dogether RN은 Expo 기반이므로, 처음에는 `Expo = 이 프로젝트의 실행 환경과 개발 방식`이라고 잡고 읽으면 됩니다.

