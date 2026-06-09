# RN 렌더링과 OTA 업데이트 읽는 법

이 문서는 React Native가 iOS/Android에서 화면을 어떻게 그리고, 왜 앱스토어 업데이트 없이 OTA 업데이트를 할 수 있는지 이해하기 위한 문서입니다.

React Native를 처음 보면 "JavaScript로 앱을 만든다"는 말 때문에 헷갈릴 수 있습니다.

정확히는 다음에 가깝습니다.

```txt
JavaScript가 화면의 설계도와 변경 지시를 만든다
-> React Native가 이를 네이티브 UI 명령으로 바꾼다
-> iOS/Android가 실제 화면을 그린다
```

즉 JavaScript가 직접 픽셀을 칠하는 것이 아니라, JavaScript가 네이티브 화면을 구성하라고 지시하는 구조입니다.

---

## 1. React Native 화면은 누가 그릴까?

예를 들어 이런 코드가 있다고 해봅니다.

```tsx
<View>
  <Text>안녕</Text>
  <Pressable onPress={handlePress}>
    <Text>버튼</Text>
  </Pressable>
</View>
```

웹이라면 `div`, `span`, `button` 같은 DOM으로 이어질 것 같지만, React Native에서는 다릅니다.

React Native의 `View`, `Text`, `Pressable`은 HTML 태그가 아닙니다.

iOS에서는 대략 다음처럼 네이티브 UI로 매핑됩니다.

```txt
View
-> UIView 계열 네이티브 뷰

Text
-> 네이티브 텍스트 뷰

ScrollView
-> UIScrollView

Pressable
-> 터치 이벤트를 처리하는 RN 컴포넌트 + 네이티브 터치 시스템
```

Android에서는 같은 React Native 컴포넌트가 Android 네이티브 뷰로 매핑됩니다.

```txt
View
-> android.view.View 계열

Text
-> TextView 계열

ScrollView
-> Android ScrollView 계열
```

그래서 React Native 앱은 웹뷰 앱과 다릅니다.

React Native는 HTML을 WebView 안에 띄우는 방식이 아니라, JavaScript가 네이티브 UI를 만들고 업데이트하게 하는 방식입니다.

---

## 2. 렌더링 흐름

React Native의 화면 렌더링 흐름은 크게 이렇게 볼 수 있습니다.

```txt
1. JS 엔진이 React 코드를 실행
2. React가 컴포넌트 트리를 계산
3. React Native가 변경 사항을 네이티브 UI 명령으로 변환
4. iOS/Android가 실제 화면을 렌더링
```

조금 더 풀면 다음과 같습니다.

```txt
App.tsx / Screen.tsx 실행
-> React component 함수 실행
-> JSX 반환
-> React가 UI tree 계산
-> 이전 tree와 비교
-> 변경된 부분만 React Native에 전달
-> 네이티브 뷰 생성/수정/삭제
-> UIKit 또는 Android View System이 화면을 그림
```

여기서 중요한 점은 다음입니다.

```txt
JS가 "무엇을 보여줄지" 결정한다.
Native가 "실제로 어떻게 그릴지" 처리한다.
```

iOS 개발 관점으로 비유하면 다음과 비슷합니다.

```txt
Swift 코드에서 UIView를 만들고 속성을 바꾼다
-> UIKit이 실제 화면을 그린다
```

React Native에서는 이 "UIView를 만들고 속성을 바꾸는 지시"를 JavaScript가 한다고 생각하면 됩니다.

---

## 3. JavaScript 엔진

React Native 앱 안에는 JavaScript를 실행하는 엔진이 들어 있습니다.

요즘 React Native에서는 보통 Hermes를 많이 사용합니다.

```txt
React Native 앱 바이너리
-> 네이티브 코드
-> JS 엔진
-> JS bundle
```

JS 엔진은 앱 안에 포함된 JavaScript bundle을 실행합니다.

```txt
JS bundle
-> App.tsx
-> route 파일
-> screen
-> hook
-> store
-> repository
```

이 프로젝트의 경우 다음 파일들이 JS bundle에 들어가는 앱 로직입니다.

```txt
App.tsx
app/_layout.tsx
app/main.tsx
src/screens/main/MainScreen.tsx
src/hooks/useMainScreen.ts
src/stores/mainStore.ts
src/services/usecases/groupUseCase.ts
```

이 파일들은 빌드될 때 하나의 JS bundle 또는 bytecode 형태로 묶입니다.

---

## 4. 예전 Bridge와 New Architecture

React Native를 설명할 때 "Bridge"라는 말을 자주 봅니다.

예전 구조에서는 JS와 Native가 Bridge를 통해 메시지를 주고받는 느낌이 강했습니다.

```txt
JS Thread
-> Bridge
-> Native Thread
```

예를 들어 JS가 이런 식으로 말합니다.

```txt
"UIView 하나 만들고"
"배경색은 파란색이고"
"텍스트는 안녕이고"
"여기에 터치 이벤트 달아줘"
```

그러면 Native 쪽이 실제 뷰를 만들고 업데이트합니다.

요즘 React Native New Architecture에서는 JSI, Fabric, TurboModules 같은 구조가 들어오면서 JS와 Native 사이의 연결이 더 직접적이고 효율적으로 바뀌었습니다.

하지만 큰 개념은 여전히 같습니다.

```txt
React/JS가 UI 상태를 계산한다.
React Native 런타임이 Native UI와 연결한다.
Native가 실제 화면을 그린다.
```

---

## 5. 그러면 OTA 업데이트는 왜 가능할까?

iOS 앱을 App Store에 올릴 때 앱 안에는 크게 두 종류가 들어갑니다.

```txt
1. 네이티브 바이너리
2. JavaScript bundle과 asset
```

네이티브 바이너리는 이런 것들을 포함합니다.

```txt
Swift / Objective-C / C++ 코드
네이티브 모듈
iOS 권한 설정
Info.plist
Entitlements
앱 아이콘, launch screen
RN 런타임
JS 엔진
```

JavaScript bundle에는 이런 것들이 들어갑니다.

```txt
React component
screen
hook
store
비즈니스 로직
스타일
API 호출 로직
일부 이미지 asset
```

OTA 업데이트는 이 중에서 JavaScript bundle과 asset을 서버에서 새로 받아 교체하는 방식입니다.

```txt
앱 실행
-> OTA 서버에 새 JS bundle 있는지 확인
-> 있으면 다운로드
-> 다음 실행 또는 즉시 reload 때 새 bundle 사용
```

그래서 앱스토어 업데이트 없이도 일부 코드를 바꿀 수 있습니다.

---

## 6. OTA로 가능한 것

대체로 다음 변경은 OTA로 가능합니다.

```txt
문구 수정
스타일 수정
화면 레이아웃 수정
React component 로직 수정
hook 로직 수정
API 호출 파라미터 수정
버그 수정
일부 이미지 asset 교체
```

예를 들어 이 프로젝트에서는 다음 같은 변경이 OTA 대상이 될 수 있습니다.

```txt
src/screens/main/MainScreen.tsx 수정
src/hooks/useMainScreen.ts 수정
src/screens/todoWrite/TodoWriteScreen.tsx 수정
src/services/repositories/impl/groupRepositoryImpl.ts 수정
src/theme/colors.ts 수정
```

이런 파일들은 JavaScript bundle에 포함되는 영역입니다.

앱에 이미 들어 있는 네이티브 기능만 사용한다면, JS 수정만으로 동작을 바꿀 수 있습니다.

---

## 7. OTA로 어려운 것

반대로 다음 변경은 보통 새 앱 빌드와 심사가 필요합니다.

```txt
새 native module 추가
iOS 권한 추가
Info.plist 변경
Entitlements 변경
Swift / Objective-C 코드 변경
Android native code 변경
RN/Expo SDK native runtime 변경
앱 아이콘 변경
앱의 핵심 목적을 바꾸는 기능 추가
```

예를 들어 카메라 기능이 아예 없는 앱에 OTA로 카메라 기능을 갑자기 추가하는 것은 어렵습니다.

이유는 간단합니다.

```txt
JS는 이미 앱 바이너리에 포함된 네이티브 기능만 호출할 수 있다.
```

앱 바이너리에 카메라 native module이나 권한 설정이 없으면, JavaScript만 바꿔서는 iOS 카메라 권한과 네이티브 기능을 새로 만들 수 없습니다.

---

## 8. iOS 앱 업데이트와 OTA의 차이

일반 앱스토어 업데이트는 앱 전체 바이너리를 다시 배포합니다.

```txt
코드 수정
-> iOS 빌드
-> App Store Connect 업로드
-> Apple 심사
-> 사용자 업데이트
-> 새 바이너리 실행
```

OTA 업데이트는 이미 설치된 바이너리 위에서 JS bundle만 바꿉니다.

```txt
JS 코드 수정
-> JS bundle 생성
-> OTA 서버 업로드
-> 앱이 다운로드
-> 새 JS bundle 실행
```

비유하면 다음과 같습니다.

```txt
앱스토어 업데이트
= 게임기 본체와 게임팩을 통째로 바꾸는 것

OTA 업데이트
= 이미 있는 게임기에서 게임팩 패치만 받는 것
```

게임팩 패치로 맵, 문구, 규칙은 바꿀 수 있습니다.

하지만 게임기에 없던 센서를 새로 붙일 수는 없습니다.

---

## 9. CodePush란?

CodePush는 React Native/Cordova 앱에서 JS bundle과 asset을 OTA로 배포하기 위한 서비스/도구로 많이 쓰였습니다.

흐름은 대략 이렇습니다.

```txt
개발자가 JS 수정
-> CodePush release
-> 서버에 bundle 업로드
-> 앱이 업데이트 확인
-> 새 bundle 다운로드
-> 앱 reload 또는 다음 실행 때 반영
```

앱 안에는 CodePush 클라이언트 코드가 들어 있습니다.

이 클라이언트가 서버에 물어봅니다.

```txt
"내 앱 버전에서 받을 수 있는 새 JS bundle이 있나요?"
```

서버가 새 bundle을 알려주면 앱이 다운로드합니다.

---

## 10. 2026년 기준 CodePush 주의점

예전 Microsoft App Center CodePush 서비스는 2025년 3월 31일에 종료되었습니다.

그래서 2026년 기준으로는 "CodePush"라는 말을 OTA 업데이트 전체를 가리키는 관용어처럼 쓰는 경우가 많습니다.

실제로 선택지는 보통 다음 중 하나입니다.

```txt
Expo / EAS Update
CodePush 호환 self-hosted 서버
상용 CodePush 대체 서비스
직접 만든 OTA 업데이트 시스템
```

Expo 프로젝트라면 EAS Update를 많이 검토합니다.

bare React Native 프로젝트라면 CodePush 호환 서버나 대체 서비스를 쓰기도 합니다.

---

## 11. Apple 심사와 OTA

iOS에서는 OTA로 아무 코드나 바꿔도 되는 것이 아닙니다.

Apple은 앱 심사를 우회하거나 앱의 핵심 목적을 바꾸는 업데이트를 제한합니다.

안전한 OTA 사용 범위는 보통 다음과 같습니다.

```txt
버그 수정
문구 수정
기존 기능의 UI 개선
기존 기능 범위 안의 로직 수정
이미 심사된 native capability 안에서의 JS 수정
```

위험한 OTA 사용은 다음과 같습니다.

```txt
심사 때 없던 핵심 기능을 몰래 추가
앱 목적을 완전히 변경
스토어/결제 정책을 우회
별도 앱스토어처럼 동작
네이티브 권한을 새로 요구하는 기능 추가
```

핵심은 이 문장입니다.

```txt
OTA는 앱 심사를 우회하기 위한 장치가 아니라,
이미 심사된 앱의 JS 영역을 빠르게 수정하기 위한 장치다.
```

---

## 12. 이 프로젝트에 대입해 보기

Dogether RN 프로젝트에서 OTA로 바꿀 수 있을 가능성이 높은 것:

```txt
메인 화면 문구
투두 작성 화면 UI
인증 화면 validation
리뷰 화면 분기
React Query key 수정
API 요청 파라미터 수정
Zustand 상태 로직 수정
색상, 간격, 일부 스타일
```

OTA로 바꾸기 어려운 것:

```txt
카카오 로그인 native SDK 추가/변경
Apple Sign In native capability 추가
카메라/사진 권한 설정 변경
MMKV native library 추가/제거
Expo SDK native 모듈 변경
iOS bundle identifier 변경
앱 아이콘 변경
푸시 알림 entitlement 추가
```

예를 들어 `src/hooks/useMainScreen.ts`의 날짜 계산 버그를 고치는 것은 OTA로 가능할 수 있습니다.

하지만 `expo-image-picker`를 처음 추가하거나 iOS 사진 권한 문구를 바꾸는 것은 새 바이너리가 필요할 가능성이 큽니다.

---

## 13. 정리

React Native 렌더링을 한 문장으로 정리하면 다음입니다.

```txt
JavaScript가 화면 상태와 구조를 계산하고,
React Native가 이를 네이티브 UI 명령으로 변환하며,
iOS/Android가 실제 화면을 그린다.
```

OTA 업데이트를 한 문장으로 정리하면 다음입니다.

```txt
이미 설치된 네이티브 앱 위에서 JS bundle과 asset만 교체하는 업데이트 방식이다.
```

따라서 React Native 앱은 JavaScript 수정만으로 화면과 로직을 빠르게 바꿀 수 있습니다.

하지만 네이티브 기능, 권한, 앱의 핵심 목적이 바뀌는 수정은 여전히 새 앱 빌드와 심사가 필요합니다.

---

## 14. 기억할 것

```txt
JS가 화면을 직접 그리는 것은 아니다.
JS는 네이티브 UI에 "이렇게 그려라"라고 지시한다.
```

```txt
OTA는 JS bundle을 교체하는 것이다.
앱 바이너리를 교체하는 것이 아니다.
```

```txt
이미 앱 안에 들어 있는 native capability만 JS에서 사용할 수 있다.
```

```txt
심사를 우회하기 위한 OTA는 위험하다.
기존 기능의 빠른 수정 용도로 써야 안전하다.
```

