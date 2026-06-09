# 로컬저장소 MMKV 읽는 법

이 문서는 Dogether RN 프로젝트에서 `react-native-mmkv`를 어떻게 쓰는지 읽기 위한 문서입니다.

처음 보면 MMKV는 단순한 저장소처럼 보이지만, 이 프로젝트에서는 앱 시작, 로그인 유지, API 인증 헤더, 마지막 선택 그룹, mock 데이터 유지까지 여러 흐름과 연결되어 있습니다.

---

## 1. 이 문서를 읽기 전에

먼저 용어를 나눠서 보면 좋습니다.

| 용어 | 의미 |
| --- | --- |
| MMKV | 앱 안에 값을 저장하는 빠른 key-value 저장소 |
| key-value | `accessToken`이라는 key에 토큰 문자열 value를 저장하는 방식 |
| storage wrapper | MMKV 인스턴스를 프로젝트에서 쓰기 좋게 감싼 파일 |
| session storage | 로그인 세션을 MMKV에 저장하고 읽는 함수들 |
| Zustand store | 화면에서 쓰기 좋은 메모리 상태 |
| hydrate | 앱 시작 때 로컬 저장소 값을 메모리 상태로 복원하는 작업 |

iOS로 비유하면 `UserDefaults`에 가까운 역할입니다.

다만 Dogether RN에서는 직접 `storage.set(...)`을 아무 데서나 호출하기보다, 도메인별 helper 함수를 만들어 사용합니다.

---

## 2. 관련 파일 위치

로컬 저장소 관련 파일은 주로 여기에 있습니다.

```txt
src/lib/storage/
  index.ts
  storage.ts
  storageKeys.ts
  sessionStorage.ts
  selectedGroupStorage.ts
```

저장소를 사용하는 대표 파일은 다음과 같습니다.

```txt
src/stores/sessionStore.ts
src/stores/mainStore.ts
src/services/api/client.ts
src/services/repositories/mock/data/mockGroupData.ts
src/services/repositories/mock/data/mockTodoData.ts
src/services/repositories/mock/data/mockReviewData.ts
```

처음 읽을 때는 아래 순서가 좋습니다.

```txt
storage.ts
-> storageKeys.ts
-> sessionStorage.ts
-> sessionStore.ts
-> selectedGroupStorage.ts
-> mainStore.ts
-> api/client.ts
```

---

## 3. 한 줄로 보는 전체 구조

이 프로젝트의 로컬 저장소 흐름은 이렇게 볼 수 있습니다.

```txt
MMKV
-> src/lib/storage helper
-> Zustand store 또는 apiClient
-> 화면/네트워크 흐름
```

조금 더 구체적으로 쓰면 이렇습니다.

```txt
앱 실행
-> SplashScreen
-> useSessionStore.hydrate()
-> readSession()
-> MMKV에서 accessToken/userName/loginType 읽기
-> Zustand 세션 상태 복원
-> useLaunchFlowQuery
-> 첫 화면 결정
```

API 요청 때는 조금 다릅니다.

```txt
Repository에서 apiClient 호출
-> axios request interceptor
-> MMKV에서 accessToken 직접 읽기
-> Authorization: Bearer ...
-> 서버 요청
```

중요한 점은 이것입니다.

```txt
화면에서 로그인 여부를 볼 때는 Zustand를 주로 본다.
API 요청에 토큰을 붙일 때는 MMKV를 직접 읽는다.
```

---

## 4. MMKV 인스턴스 만들기

파일:

```txt
src/lib/storage/storage.ts
```

코드:

```ts
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'dogether-storage' });
```

이 파일은 프로젝트 전체에서 사용할 MMKV 저장소 인스턴스를 하나 만듭니다.

읽는 포인트는 두 가지입니다.

| 코드 | 의미 |
| --- | --- |
| `createMMKV(...)` | MMKV 저장소를 만든다 |
| `{ id: 'dogether-storage' }` | 이 앱에서 사용할 저장소 이름을 정한다 |

이후 다른 파일들은 새 MMKV를 만들지 않고 이 `storage`를 import해서 사용합니다.

```ts
import { storage } from '../lib/storage';
```

---

## 5. 왜 storage.ts를 따로 둘까?

어디서든 직접 이렇게 써도 동작은 합니다.

```ts
createMMKV({ id: 'dogether-storage' })
```

하지만 그렇게 하면 문제가 생깁니다.

| 방식 | 문제 |
| --- | --- |
| 여러 파일에서 직접 `createMMKV` 호출 | 저장소 설정이 흩어진다 |
| key 문자열을 직접 입력 | 오타가 나도 컴파일러가 잡기 어렵다 |
| 객체 구조를 각자 저장 | 나중에 구조를 바꾸기 어렵다 |

그래서 이 프로젝트는 저장소를 다음처럼 나눕니다.

```txt
storage.ts
-> 진짜 MMKV 인스턴스

storageKeys.ts
-> 저장소 key 이름 모음

sessionStorage.ts
-> 로그인 세션 저장/조회/삭제 함수

selectedGroupStorage.ts
-> 마지막 선택 그룹 저장/조회/삭제 함수
```

---

## 6. storageKeys.ts 읽기

파일:

```txt
src/lib/storage/storageKeys.ts
```

코드:

```ts
export const storageKeys = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userName: 'userName',
  loginType: 'loginType',
  appleUserIdentifier: 'appleUserIdentifier',
  hasCompletedStartFlow: 'hasCompletedStartFlow',
  lastAccessVersion: 'lastAccessVersion',
  lastSelectedGroupId: 'lastSelectedGroupId',
};
```

이 파일은 저장소 key를 한곳에 모아둔 파일입니다.

예를 들어 아래 두 코드는 의미가 같습니다.

```ts
storage.getString('accessToken');
```

```ts
storage.getString(storageKeys.accessToken);
```

하지만 프로젝트에서는 두 번째 방식을 씁니다.

이유는 단순합니다.

```txt
문자열 key를 여기저기 직접 쓰면 오타와 중복이 생기기 쉽다.
```

예를 들어 누군가 실수로 이렇게 쓰면:

```ts
storage.getString('acessToken');
```

`accessToken`의 오타지만 TypeScript는 단순 문자열이라 잘 모를 수 있습니다.

반대로 이렇게 쓰면:

```ts
storageKeys.acessToken
```

`storageKeys`에 없는 프로퍼티라 에디터나 TypeScript가 빨리 잡아줍니다.

---

## 7. 저장소 key 종류

현재 프로젝트의 key는 이런 역할을 합니다.

| key | 저장하는 값 | 쓰임 |
| --- | --- | --- |
| `accessToken` | 서버 인증 access token | API 요청 Authorization header |
| `refreshToken` | refresh token | 세션 모델 일부 |
| `userName` | 사용자 이름 | 세션 복원 |
| `loginType` | 카카오/애플 등 로그인 타입 | 세션 복원 |
| `appleUserIdentifier` | 애플 로그인 식별자 | 애플 로그인 세션 유지 |
| `hasCompletedStartFlow` | 시작 플로우 완료 여부 | 앱 시작 라우팅 판단 |
| `lastAccessVersion` | 마지막 접근 버전 | 버전/업데이트 흐름용 key |
| `lastSelectedGroupId` | 마지막으로 선택한 그룹 id | 메인 화면 그룹 선택 복원 |

여기서 가장 자주 보게 될 값은 네 가지입니다.

```txt
accessToken
userName
loginType
hasCompletedStartFlow
```

이 네 가지는 앱 시작 때 로그인 상태를 판단하는 데 중요합니다.

---

## 8. MMKV 기본 사용법

MMKV는 값 타입에 따라 읽는 함수가 다릅니다.

| 저장할 값 | 저장 | 읽기 |
| --- | --- | --- |
| 문자열 | `storage.set(key, stringValue)` | `storage.getString(key)` |
| 숫자 | `storage.set(key, numberValue)` | `storage.getNumber(key)` |
| boolean | `storage.set(key, booleanValue)` | `storage.getBoolean(key)` |

삭제할 때는 공통으로 `remove`를 씁니다.

```ts
storage.remove(storageKeys.accessToken);
```

이 프로젝트 예시는 다음과 같습니다.

```ts
storage.set(storageKeys.accessToken, payload.accessToken);
storage.getString(storageKeys.accessToken);
storage.remove(storageKeys.accessToken);
```

숫자 예시는 마지막 선택 그룹입니다.

```ts
storage.set(storageKeys.lastSelectedGroupId, groupId);
storage.getNumber(storageKeys.lastSelectedGroupId);
```

boolean 예시는 시작 플로우 완료 여부입니다.

```ts
storage.set(storageKeys.hasCompletedStartFlow, payload.hasCompletedStartFlow);
storage.getBoolean(storageKeys.hasCompletedStartFlow);
```

---

## 9. sessionStorage.ts 역할

파일:

```txt
src/lib/storage/sessionStorage.ts
```

이 파일은 로그인 세션을 MMKV에 저장하고, 읽고, 삭제합니다.

핵심 함수는 세 개입니다.

```ts
saveSession(payload)
readSession()
clearSession()
```

각 함수의 역할은 다음과 같습니다.

| 함수 | 역할 |
| --- | --- |
| `saveSession` | 로그인 성공 또는 시작 플로우 완료 시 세션을 저장 |
| `readSession` | 앱 시작 때 저장된 세션을 읽음 |
| `clearSession` | 로그아웃 또는 세션 오류 시 저장된 세션을 삭제 |

---

## 10. saveSession 읽기

코드:

```ts
export function saveSession(payload: AuthSession) {
  storage.set(storageKeys.accessToken, payload.accessToken);
  if (payload.refreshToken) {
    storage.set(storageKeys.refreshToken, payload.refreshToken);
  } else {
    storage.remove(storageKeys.refreshToken);
  }
  storage.set(storageKeys.userName, payload.userName);
  storage.set(storageKeys.loginType, payload.loginType);
  if (payload.appleUserIdentifier) {
    storage.set(storageKeys.appleUserIdentifier, payload.appleUserIdentifier);
  } else {
    storage.remove(storageKeys.appleUserIdentifier);
  }
  storage.set(storageKeys.hasCompletedStartFlow, payload.hasCompletedStartFlow);
}
```

이 함수는 `AuthSession` 객체를 받아서 MMKV에 저장합니다.

여기서 중요한 점은 객체 하나를 통째로 저장하지 않는다는 것입니다.

```txt
AuthSession 객체 전체
-> accessToken, refreshToken, userName, loginType ...
-> key별로 나누어 저장
```

즉 이런 느낌입니다.

```txt
accessToken = "abc..."
refreshToken = "def..."
userName = "유저"
loginType = "kakao"
hasCompletedStartFlow = false
```

주석에도 이 의도가 적혀 있습니다.

```ts
// MMKV는 key-value 저장소입니다. 객체를 통째로 저장하기보다 필요한 필드를 key별로 저장합니다.
```

---

## 11. optional 값 저장 방식

`refreshToken`과 `appleUserIdentifier`는 있을 수도 있고 없을 수도 있습니다.

그래서 코드가 이렇게 되어 있습니다.

```ts
if (payload.refreshToken) {
  storage.set(storageKeys.refreshToken, payload.refreshToken);
} else {
  storage.remove(storageKeys.refreshToken);
}
```

이 뜻은 다음과 같습니다.

```txt
값이 있으면 저장한다.
값이 없으면 이전에 저장된 값을 지운다.
```

이게 중요합니다.

예를 들어 이전 로그인에는 `refreshToken`이 있었는데, 새 로그인에는 없다면 기존 값이 남아 있으면 안 됩니다.

그래서 값이 없을 때도 아무것도 안 하는 것이 아니라 `remove`를 호출합니다.

---

## 12. readSession 읽기

코드:

```ts
export function readSession() {
  const accessToken = storage.getString(storageKeys.accessToken);
  const refreshToken = storage.getString(storageKeys.refreshToken);
  const userName = storage.getString(storageKeys.userName);
  const loginType = storage.getString(storageKeys.loginType) as AuthSession['loginType'] | undefined;
  const appleUserIdentifier = storage.getString(storageKeys.appleUserIdentifier);
  const hasCompletedStartFlow = storage.getBoolean(storageKeys.hasCompletedStartFlow) ?? false;

  if (!accessToken || !userName || !loginType) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    userName,
    loginType,
    appleUserIdentifier,
    hasCompletedStartFlow,
  } as AuthSession;
}
```

이 함수는 MMKV에 흩어져 저장된 값을 다시 `AuthSession` 모양으로 조립합니다.

흐름은 이렇습니다.

```txt
accessToken 읽기
refreshToken 읽기
userName 읽기
loginType 읽기
appleUserIdentifier 읽기
hasCompletedStartFlow 읽기
-> 필수 값 검사
-> AuthSession 반환
```

---

## 13. 필수 값 검사

`readSession`에서 가장 중요한 코드는 이 부분입니다.

```ts
if (!accessToken || !userName || !loginType) {
  return null;
}
```

이 뜻은 다음과 같습니다.

```txt
accessToken, userName, loginType 중 하나라도 없으면
정상 로그인 세션으로 보지 않는다.
```

즉 MMKV에 값이 일부만 남아 있는 깨진 상태일 수 있습니다.

예를 들어:

```txt
accessToken 있음
userName 없음
loginType 있음
```

이런 상태에서 억지로 로그인 상태로 처리하면 앱이 이상하게 동작할 수 있습니다.

그래서 필수 값이 모두 있을 때만 세션을 반환합니다.

---

## 14. hasCompletedStartFlow 기본값

코드:

```ts
const hasCompletedStartFlow = storage.getBoolean(storageKeys.hasCompletedStartFlow) ?? false;
```

`getBoolean(...)`은 값이 없으면 `undefined`를 반환할 수 있습니다.

그래서 `?? false`를 붙여 기본값을 정합니다.

읽는 법:

```txt
저장된 hasCompletedStartFlow가 있으면 그 값을 쓰고,
없으면 false로 본다.
```

이 값은 앱 시작 라우팅에서 중요합니다.

| 값 | 의미 |
| --- | --- |
| `false` | 로그인은 했지만 시작 그룹 생성/참여 플로우를 끝내지 않았을 수 있음 |
| `true` | 시작 플로우를 끝냈으므로 메인 진입 가능 |

---

## 15. clearSession 읽기

코드:

```ts
export function clearSession() {
  storage.remove(storageKeys.accessToken);
  storage.remove(storageKeys.refreshToken);
  storage.remove(storageKeys.userName);
  storage.remove(storageKeys.loginType);
  storage.remove(storageKeys.appleUserIdentifier);
  storage.remove(storageKeys.hasCompletedStartFlow);
  clearLastSelectedGroupId();
}
```

이 함수는 로그인 세션 값을 전부 삭제합니다.

그리고 마지막 줄이 중요합니다.

```ts
clearLastSelectedGroupId();
```

즉 로그아웃할 때 선택 그룹도 함께 지웁니다.

이유는 간단합니다.

```txt
사용자 A가 마지막으로 그룹 101을 선택함
-> 로그아웃
-> 사용자 B가 로그인
-> 그룹 101 선택값이 남아 있으면 안 됨
```

그래서 세션을 지울 때 세션성 UI 데이터도 같이 정리합니다.

---

## 16. sessionStorage와 sessionStore의 관계

파일:

```txt
src/stores/sessionStore.ts
```

`sessionStorage.ts`는 MMKV를 직접 다룹니다.

`sessionStore.ts`는 화면에서 쓰는 Zustand 상태를 다룹니다.

둘의 관계는 이렇게 보면 됩니다.

```txt
sessionStorage
-> 디스크/네이티브 저장소에 가까운 영구 저장

sessionStore
-> 앱 실행 중 화면들이 구독하는 메모리 상태
```

즉:

```txt
MMKV에 저장되어 있다고 해서 화면이 자동으로 다시 그려지는 것은 아니다.
Zustand 상태가 바뀌어야 화면이 반응한다.
```

그래서 로그인할 때는 둘 다 갱신합니다.

---

## 17. hydrate란?

`hydrate`는 저장소에 있던 값을 앱 메모리 상태로 옮기는 작업입니다.

파일:

```txt
src/stores/sessionStore.ts
```

코드:

```ts
hydrate: () => {
  const session = readSession();
  if (!session) {
    set({
      hydrated: true,
      accessToken: null,
      refreshToken: null,
      userName: null,
      loginType: null,
      appleUserIdentifier: null,
      hasCompletedStartFlow: false,
    });
    return;
  }

  set({
    hydrated: true,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? null,
    userName: session.userName,
    loginType: session.loginType,
    appleUserIdentifier: session.appleUserIdentifier ?? null,
    hasCompletedStartFlow: session.hasCompletedStartFlow,
  });
}
```

읽는 순서:

```txt
readSession() 호출
-> 세션이 없으면 비로그인 상태로 set
-> 세션이 있으면 Zustand 상태에 복원
-> 두 경우 모두 hydrated: true
```

`hydrated`는 아주 중요한 값입니다.

---

## 18. hydrated가 필요한 이유

앱이 켜진 직후에는 아직 MMKV에서 세션을 읽기 전입니다.

이 순간을 잘못 처리하면 이런 문제가 생깁니다.

```txt
앱 시작
-> 아직 세션을 읽기 전
-> accessToken이 null처럼 보임
-> 앱이 로그아웃 상태라고 착각
-> 온보딩으로 이동
-> 뒤늦게 세션 복원
```

그래서 이 프로젝트는 `hydrated`를 둡니다.

```ts
hydrated: false
```

초기값은 `false`입니다.

그리고 `hydrate()`가 끝나면:

```ts
hydrated: true
```

로 바꿉니다.

읽는 법:

```txt
hydrated가 false면 아직 로그인 여부를 판단하면 안 된다.
hydrated가 true가 된 뒤 accessToken 유무를 봐야 한다.
```

---

## 19. SplashScreen에서 hydrate 호출

파일:

```txt
src/screens/splash/SplashScreen.tsx
```

코드:

```ts
const hydrate = useSessionStore((state) => state.hydrate);

useEffect(() => {
  hydrate();
}, [hydrate]);
```

이 뜻은:

```txt
SplashScreen이 처음 나타난 뒤
세션 store의 hydrate 함수를 호출한다.
```

즉 앱 시작 직후 세션 복원은 SplashScreen에서 시작됩니다.

---

## 20. launch-flow query와 hydrated

파일:

```txt
src/queries/useLaunchFlowQuery.ts
```

관련 흐름:

```txt
SplashScreen
-> hydrate()
-> useLaunchFlowQuery()
-> AppLaunchUseCase
-> 첫 화면 결정
```

`useLaunchFlowQuery`는 `hydrated`가 끝난 뒤에만 실행되어야 합니다.

이유:

```txt
세션 복원 전에는 로그인 여부를 알 수 없기 때문
```

그래서 12번 앱 생명주기 문서에서도 강조한 것처럼:

```txt
앱 시작 판단은 hydrate 이후에 해야 한다.
```

---

## 21. login 액션 읽기

파일:

```txt
src/stores/sessionStore.ts
```

코드:

```ts
login: (payload) => {
  const session = { ...payload, hasCompletedStartFlow: false as const };
  saveSession(session);
  set(session);
}
```

로그인 성공 시 두 가지 일을 합니다.

```txt
1. saveSession(session)
   -> MMKV에 저장

2. set(session)
   -> Zustand 메모리 상태 갱신
```

왜 둘 다 할까요?

| 작업 | 이유 |
| --- | --- |
| `saveSession` | 앱을 껐다 켜도 로그인 상태 유지 |
| `set` | 현재 실행 중인 화면들이 즉시 상태 변경을 알 수 있음 |

둘 중 하나만 하면 부족합니다.

---

## 22. completeStartFlow 액션 읽기

코드:

```ts
completeStartFlow: () =>
  set((state) => {
    if (!state.accessToken || !state.userName || !state.loginType) {
      return state;
    }

    const session = {
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      userName: state.userName,
      loginType: state.loginType,
      appleUserIdentifier: state.appleUserIdentifier,
      hasCompletedStartFlow: true,
    };
    saveSession(session);
    return session;
  })
```

이 함수는 시작 플로우를 끝냈을 때 호출됩니다.

핵심은 이 값입니다.

```ts
hasCompletedStartFlow: true
```

즉:

```txt
이 사용자는 그룹 생성/참여 같은 시작 플로우를 끝냈다.
다음 앱 실행 때 바로 메인으로 갈 수 있다.
```

이 값도 MMKV에 저장해야 앱을 껐다 켜도 유지됩니다.

그래서 `saveSession(session)`이 다시 호출됩니다.

---

## 23. logout 액션 읽기

코드:

```ts
logout: () => {
  clearSession();
  set({
    accessToken: null,
    refreshToken: null,
    userName: null,
    loginType: null,
    appleUserIdentifier: null,
    hasCompletedStartFlow: false,
  });
}
```

로그아웃도 두 가지 일을 합니다.

```txt
1. clearSession()
   -> MMKV에서 세션 삭제

2. set(...)
   -> Zustand 메모리 상태도 비로그인으로 변경
```

로그인과 같은 원리입니다.

| 작업 | 이유 |
| --- | --- |
| `clearSession` | 앱 재실행 후에도 로그아웃 상태 유지 |
| `set` | 현재 화면에서 즉시 로그아웃 상태 반영 |

---

## 24. selectedGroupStorage.ts 역할

파일:

```txt
src/lib/storage/selectedGroupStorage.ts
```

이 파일은 사용자가 마지막으로 선택한 그룹 id를 저장합니다.

함수는 세 개입니다.

```ts
readLastSelectedGroupId()
saveLastSelectedGroupId(groupId)
clearLastSelectedGroupId()
```

역할:

| 함수 | 역할 |
| --- | --- |
| `readLastSelectedGroupId` | 마지막 선택 그룹 id 읽기 |
| `saveLastSelectedGroupId` | 선택 그룹 id 저장 |
| `clearLastSelectedGroupId` | 선택 그룹 id 삭제 |

---

## 25. 마지막 선택 그룹 읽기

코드:

```ts
export function readLastSelectedGroupId() {
  return storage.getNumber(storageKeys.lastSelectedGroupId) ?? null;
}
```

읽는 법:

```txt
lastSelectedGroupId라는 key로 숫자를 읽는다.
저장된 값이 없으면 null을 반환한다.
```

여기서 `0`이 아니라 `null`을 쓰는 이유는 그룹 id가 숫자이기 때문입니다.

```txt
number = 어떤 그룹이 선택되어 있음
null = 선택된 그룹이 없음
```

---

## 26. 마지막 선택 그룹 저장

코드:

```ts
export function saveLastSelectedGroupId(groupId: number | null) {
  if (groupId === null) {
    storage.remove(storageKeys.lastSelectedGroupId);
    return;
  }

  storage.set(storageKeys.lastSelectedGroupId, groupId);
}
```

읽는 법:

```txt
groupId가 null이면 저장된 선택 그룹을 지운다.
groupId가 number면 그 값을 저장한다.
```

`null`을 저장하지 않고 remove하는 이유는 저장소에는 "값이 없음" 상태가 더 자연스럽기 때문입니다.

---

## 27. mainStore와 선택 그룹 저장

파일:

```txt
src/stores/mainStore.ts
```

코드:

```ts
export const useMainStore = create<MainState>((set) => ({
  selectedGroupId: readLastSelectedGroupId(),
  dateOffset: 0,
  filter: 'all',
  sheetExpanded: false,
  setSelectedGroupId: (selectedGroupId) => {
    saveLastSelectedGroupId(selectedGroupId);
    set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
  },
  ...
}));
```

여기서 초기값이 중요합니다.

```ts
selectedGroupId: readLastSelectedGroupId()
```

앱이 켜지고 store가 만들어질 때 MMKV에서 마지막 선택 그룹을 읽어옵니다.

그룹을 바꿀 때는:

```ts
saveLastSelectedGroupId(selectedGroupId);
set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
```

두 가지를 함께 합니다.

```txt
1. MMKV에 선택 그룹 저장
2. Zustand 상태 갱신
```

---

## 28. 선택 그룹을 바꾸면 UI 상태도 초기화된다

`setSelectedGroupId`는 그룹 id만 바꾸지 않습니다.

```ts
set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
```

같이 초기화하는 값:

| 값 | 초기화 이유 |
| --- | --- |
| `dateOffset: 0` | 새 그룹은 오늘 날짜부터 보여주기 |
| `filter: 'all'` | 이전 그룹에서 선택한 필터를 섞지 않기 |
| `sheetExpanded: false` | 이전 그룹의 시트 펼침 상태를 섞지 않기 |

즉 선택 그룹 저장은 단순 persistence만이 아니라 메인 화면 UX와도 연결됩니다.

---

## 29. API client가 MMKV를 직접 읽는 이유

파일:

```txt
src/services/api/client.ts
```

코드:

```ts
function readAccessToken() {
  return storage.getString(storageKeys.accessToken);
}
```

그리고 request interceptor에서:

```ts
function applyAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const accessToken = readAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}
```

이 뜻은:

```txt
API 요청이 나가기 직전에
MMKV에서 accessToken을 읽고
Authorization header에 붙인다.
```

---

## 30. 왜 Zustand에서 토큰을 읽지 않을까?

API client는 React 컴포넌트 밖에 있는 일반 TypeScript 모듈입니다.

React hook처럼 이렇게 쓰기 어렵습니다.

```ts
const accessToken = useSessionStore((state) => state.accessToken);
```

hook은 React 컴포넌트나 custom hook 안에서 써야 하기 때문입니다.

그래서 `apiClient`는 MMKV에서 직접 최신 토큰을 읽습니다.

장점도 있습니다.

```txt
요청 직전에 저장소를 읽기 때문에
로그인/로그아웃 이후 최신 토큰 상태를 반영하기 쉽다.
```

---

## 31. Authorization header 흐름

전체 흐름:

```txt
로그인 성공
-> sessionStore.login()
-> saveSession()
-> MMKV에 accessToken 저장

나중에 API 요청
-> repository에서 apiClient.get/post/delete 호출
-> apiClient request interceptor 실행
-> MMKV에서 accessToken 읽기
-> Authorization header 추가
-> 서버 요청
```

코드로 보면:

```ts
config.headers.Authorization = `Bearer ${accessToken}`;
```

서버에는 이런 header가 붙습니다.

```txt
Authorization: Bearer 토큰값
```

---

## 32. storage/index.ts 읽기

파일:

```txt
src/lib/storage/index.ts
```

코드:

```ts
export { storage } from './storage';
export { storageKeys } from './storageKeys';
export { saveSession, readSession, clearSession } from './sessionStorage';
export { readLastSelectedGroupId, saveLastSelectedGroupId, clearLastSelectedGroupId } from './selectedGroupStorage';
```

이 파일은 barrel export입니다.

즉 여러 storage 파일에서 export한 것을 한곳에서 다시 export합니다.

덕분에 다른 파일에서는 이렇게 짧게 import할 수 있습니다.

```ts
import { clearSession, readSession, saveSession } from '../lib/storage';
```

혹은:

```ts
import { storage, storageKeys } from '../../lib/storage';
```

---

## 33. 세션 저장 흐름 전체

로그인 성공 후 세션 저장 흐름은 다음과 같습니다.

```txt
로그인 repository/usecase 성공
-> sessionStore.login(payload)
-> hasCompletedStartFlow: false 추가
-> saveSession(session)
-> MMKV에 accessToken/userName/loginType 등 저장
-> Zustand 세션 상태 set
-> 화면은 로그인 상태로 반응
```

그림처럼 보면:

```txt
Login result
  |
  v
sessionStore.login()
  |
  +--> saveSession() --> MMKV
  |
  +--> set() ---------> Zustand state
```

---

## 34. 앱 재실행 후 세션 복원 흐름

앱을 껐다 켰을 때는 다음 흐름입니다.

```txt
앱 실행
-> SplashScreen 표시
-> useEffect에서 hydrate()
-> readSession()
-> MMKV 값 읽기
-> 필수 값 있으면 session 반환
-> sessionStore에 set
-> hydrated true
-> useLaunchFlowQuery 실행 가능
-> 첫 화면 결정
```

중요한 포인트:

```txt
저장소에 accessToken이 있어도 hydrate 전에는 Zustand의 accessToken이 null일 수 있다.
```

그래서 화면 시작 로직은 `hydrated`를 기다립니다.

---

## 35. 로그아웃 흐름 전체

로그아웃 흐름은 다음과 같습니다.

```txt
사용자가 로그아웃
-> sessionStore.logout()
-> clearSession()
-> MMKV에서 세션 key 삭제
-> lastSelectedGroupId도 삭제
-> Zustand 세션 상태 null로 변경
-> 다음 앱 실행 때 비로그인으로 판단
```

그림처럼 보면:

```txt
logout()
  |
  +--> clearSession() --> MMKV 세션 삭제
  |                   --> 마지막 선택 그룹 삭제
  |
  +--> set() ---------> Zustand 세션 초기화
```

---

## 36. mock 데이터도 MMKV를 쓴다

이 프로젝트는 API 없이 화면을 테스트할 수 있는 mock repository를 가지고 있습니다.

mock 데이터도 앱을 껐다 켰을 때 유지되도록 MMKV에 저장합니다.

대표 파일:

```txt
src/services/repositories/mock/data/mockGroupData.ts
src/services/repositories/mock/data/mockTodoData.ts
src/services/repositories/mock/data/mockReviewData.ts
```

여기서는 `storageKeys.ts`의 key를 쓰지 않고 파일 안의 별도 상수를 씁니다.

예:

```ts
const JOINED_GROUPS_KEY = 'mockJoinedGroups';
const NEXT_GROUP_ID_KEY = 'mockNextGroupId';
```

```ts
const TODOS_KEY = 'mockTodosByGroupDate';
```

```ts
const PENDING_REVIEWS_KEY = 'mockPendingReviews';
```

이 key들은 실제 앱 세션 key와 다르게 mock 데이터 전용입니다.

---

## 37. mock 데이터는 JSON 문자열로 저장한다

MMKV는 문자열, 숫자, boolean 같은 값 저장에 적합합니다.

그런데 mock 그룹 목록이나 투두 목록은 배열/객체입니다.

그래서 JSON 문자열로 바꿔 저장합니다.

예:

```ts
function writeGroups(groups: Group[]) {
  storage.set(JOINED_GROUPS_KEY, JSON.stringify(groups));
}
```

읽을 때는 다시 객체로 바꿉니다.

```ts
function readGroups(): Group[] {
  const raw = storage.getString(JOINED_GROUPS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Group[];
  } catch {
    return [];
  }
}
```

흐름:

```txt
Group[]
-> JSON.stringify
-> string으로 MMKV 저장
-> storage.getString
-> JSON.parse
-> Group[]
```

---

## 38. JSON.parse에 try/catch가 있는 이유

mock 데이터 읽기 코드는 대부분 이렇게 생겼습니다.

```ts
try {
  return JSON.parse(raw) as Group[];
} catch {
  return [];
}
```

이유:

```txt
저장된 JSON 문자열이 깨져 있을 수 있기 때문
```

예를 들어 개발 중에 저장 구조가 바뀌었거나, 이전 버전 데이터가 남아 있으면 `JSON.parse`가 실패할 수 있습니다.

그때 앱 전체가 터지는 대신 빈 배열을 반환합니다.

이런 코드는 로컬 저장소를 다룰 때 자주 보게 됩니다.

---

## 39. 실제 세션과 mock 데이터 key의 차이

두 종류의 key가 있습니다.

| 구분 | 예시 | 위치 |
| --- | --- | --- |
| 실제 앱 세션/선택 key | `accessToken`, `lastSelectedGroupId` | `storageKeys.ts` |
| mock 데이터 key | `mockJoinedGroups`, `mockTodosByGroupDate` | mock data 파일 내부 |

처음 읽을 때는 이렇게 기억하면 됩니다.

```txt
앱 전체에서 공통으로 쓰는 key는 storageKeys.ts
mock 파일 내부에서만 쓰는 key는 해당 mock 파일 상수
```

---

## 40. 로컬 저장소를 읽을 때 가장 먼저 볼 질문

어떤 코드에서 `storage`를 봤다면 다음 질문을 던지면 됩니다.

```txt
1. 어떤 key를 읽고/쓰고 있나?
2. 값 타입은 string, number, boolean, JSON string 중 무엇인가?
3. 값이 없을 때 기본값은 무엇인가?
4. 이 값은 Zustand에도 복사되는가?
5. 삭제 시 다른 관련 값도 같이 지우는가?
```

예를 들어 `readSession`은:

| 질문 | 답 |
| --- | --- |
| 어떤 key? | `accessToken`, `userName`, `loginType` 등 |
| 타입? | 대부분 string, `hasCompletedStartFlow`는 boolean |
| 기본값? | `hasCompletedStartFlow`는 false |
| Zustand 복사? | `hydrate()`에서 복사 |
| 관련 삭제? | `clearSession()`에서 선택 그룹까지 삭제 |

---

## 41. 화면 상태와 저장소 상태 구분하기

초보자가 가장 헷갈리는 부분입니다.

아래 두 값은 같은 정보처럼 보여도 위치가 다릅니다.

```txt
MMKV의 accessToken
Zustand의 accessToken
```

차이:

| 위치 | 성격 | 언제 유지되나 |
| --- | --- | --- |
| MMKV | 영구 저장 | 앱 재실행 후에도 남음 |
| Zustand | 메모리 상태 | 앱 실행 중에만 유지 |

앱을 껐다 켜면 Zustand는 초기화됩니다.

하지만 MMKV에는 값이 남아 있습니다.

그래서 앱 시작 때 `hydrate()`로 MMKV 값을 Zustand에 다시 넣습니다.

---

## 42. read와 write가 같이 있는 이유

저장소 helper는 보통 세트로 존재합니다.

```txt
saveSession
readSession
clearSession
```

```txt
saveLastSelectedGroupId
readLastSelectedGroupId
clearLastSelectedGroupId
```

이렇게 세트로 보면 읽기 쉽습니다.

| 동작 | 세션 | 선택 그룹 |
| --- | --- | --- |
| 저장 | `saveSession` | `saveLastSelectedGroupId` |
| 읽기 | `readSession` | `readLastSelectedGroupId` |
| 삭제 | `clearSession` | `clearLastSelectedGroupId` |

새로운 로컬 저장 값이 추가되면 보통 이 패턴을 따르게 됩니다.

---

## 43. 새 저장 값이 필요할 때의 기본 패턴

예를 들어 `lastAccessVersion`을 실제로 관리한다고 하면 보통 이런 흐름이 됩니다.

1. key 추가

```ts
export const storageKeys = {
  ...
  lastAccessVersion: 'lastAccessVersion',
};
```

2. helper 함수 만들기

```ts
export function readLastAccessVersion() {
  return storage.getString(storageKeys.lastAccessVersion) ?? null;
}

export function saveLastAccessVersion(version: string) {
  storage.set(storageKeys.lastAccessVersion, version);
}

export function clearLastAccessVersion() {
  storage.remove(storageKeys.lastAccessVersion);
}
```

3. 필요한 store/usecase에서 helper 사용

```txt
화면/UseCase/Store
-> helper 함수 호출
-> storage 직접 접근은 최소화
```

이 패턴을 알면 저장소 코드가 늘어나도 읽기 쉽습니다.

---

## 44. 저장소 값을 변경할 때 주의할 점

로컬 저장소는 앱 재실행 후에도 남습니다.

그래서 key 이름이나 저장 형태를 바꿀 때 주의해야 합니다.

예를 들어 기존에:

```txt
loginType = "kakao"
```

로 저장하던 값을 갑자기:

```txt
loginType = { provider: "kakao" }
```

처럼 바꾸면 기존 사용자의 저장 값과 충돌할 수 있습니다.

그래서 저장소 구조를 바꿀 때는 다음을 생각해야 합니다.

```txt
기존 값이 남아 있을 때도 앱이 안전하게 동작하는가?
읽기 함수에서 fallback을 제공하는가?
필요하면 이전 key를 지우는가?
```

---

## 45. remove와 null의 차이

로컬 저장소를 다룰 때 다음 두 개념을 구분해야 합니다.

```txt
값을 null로 저장한다
값을 삭제한다
```

이 프로젝트는 선택 그룹이 없을 때 `null`을 저장하지 않고 삭제합니다.

```ts
if (groupId === null) {
  storage.remove(storageKeys.lastSelectedGroupId);
  return;
}
```

그리고 읽을 때:

```ts
storage.getNumber(storageKeys.lastSelectedGroupId) ?? null
```

로 `값 없음`을 `null`로 바꿉니다.

즉:

```txt
저장소 안에는 key가 없음
앱 코드 안에서는 null로 표현
```

이 방식이 깔끔합니다.

---

## 46. 저장소와 React Query는 다르다

React Query도 데이터를 캐시합니다.

그래서 처음에는 MMKV와 헷갈릴 수 있습니다.

차이는 다음과 같습니다.

| 구분 | MMKV | React Query |
| --- | --- | --- |
| 주 목적 | 앱 재실행 후에도 값 유지 | 서버 상태 요청/캐시 관리 |
| 대표 값 | accessToken, 선택 그룹, mock 데이터 | 그룹 목록, 투두 목록, 랭킹 |
| 저장 위치 | 네이티브 로컬 저장소 | JS 메모리 캐시 |
| 직접 사용하는 파일 | `src/lib/storage/*` | `src/queries/*` |

쉽게 말하면:

```txt
MMKV는 앱을 꺼도 남길 값
React Query는 서버에서 가져온 값을 잘 관리하기 위한 도구
```

---

## 47. 저장소와 Zustand도 다르다

Zustand는 전역 상태라서 저장소처럼 느껴질 수 있습니다.

하지만 기본 Zustand state는 앱을 껐다 켜면 사라집니다.

| 구분 | MMKV | Zustand |
| --- | --- | --- |
| 앱 재실행 후 유지 | 유지됨 | 기본적으로 사라짐 |
| 화면 리렌더 유발 | 직접 유발하지 않음 | store 구독 화면 리렌더 |
| 대표 사용 | 세션 저장, 마지막 선택 그룹 | 현재 로그인 상태, 선택 그룹, 필터 |

이 프로젝트는 둘을 같이 씁니다.

```txt
MMKV
-> 오래 남겨야 하는 원본 저장

Zustand
-> 화면이 바로 반응해야 하는 메모리 상태
```

---

## 48. 저장소에서 직접 읽는 코드 찾기

저장소 사용처를 찾고 싶으면 검색하면 됩니다.

```bash
rg "storage\\." src
```

혹은 key 사용처를 찾습니다.

```bash
rg "storageKeys" src
```

특정 key 사용처는:

```bash
rg "accessToken" src
```

이렇게 찾을 수 있습니다.

저장소를 읽을 때는 `storage.set`, `storage.getString`, `storage.getNumber`, `storage.getBoolean`, `storage.remove`를 중심으로 보면 됩니다.

---

## 49. 읽기 연습: accessToken

`accessToken` 하나만 따라가 봅시다.

저장:

```txt
sessionStore.login()
-> saveSession()
-> storage.set(storageKeys.accessToken, payload.accessToken)
```

앱 시작 복원:

```txt
SplashScreen
-> hydrate()
-> readSession()
-> storage.getString(storageKeys.accessToken)
-> sessionStore.accessToken
```

API 요청:

```txt
Repository
-> apiClient
-> applyAuthorizationHeader()
-> storage.getString(storageKeys.accessToken)
-> Authorization header
```

삭제:

```txt
sessionStore.logout()
-> clearSession()
-> storage.remove(storageKeys.accessToken)
```

이 흐름을 이해하면 세션 저장 구조 대부분이 보입니다.

---

## 50. 읽기 연습: lastSelectedGroupId

`lastSelectedGroupId` 흐름은 다음과 같습니다.

초기화:

```txt
mainStore 생성
-> readLastSelectedGroupId()
-> storage.getNumber(storageKeys.lastSelectedGroupId)
-> selectedGroupId 초기값
```

그룹 선택:

```txt
setSelectedGroupId(groupId)
-> saveLastSelectedGroupId(groupId)
-> storage.set(storageKeys.lastSelectedGroupId, groupId)
-> Zustand selectedGroupId 갱신
```

로그아웃:

```txt
logout()
-> clearSession()
-> clearLastSelectedGroupId()
-> storage.remove(storageKeys.lastSelectedGroupId)
```

이 값은 사용자 경험을 좋게 하기 위한 저장값입니다.

앱을 다시 켜도 마지막으로 보고 있던 그룹을 기억할 수 있습니다.

---

## 51. 저장소 오류를 의심할 때

다음 증상이 있으면 로컬 저장소 흐름을 확인합니다.

| 증상 | 확인할 곳 |
| --- | --- |
| 앱을 껐다 켰는데 로그인이 풀림 | `saveSession`, `readSession`, `hydrate` |
| 로그인했는데 API가 401 | `accessToken` 저장 여부, `apiClient` interceptor |
| 로그아웃했는데 이전 그룹이 남음 | `clearSession`, `clearLastSelectedGroupId` |
| 시작 플로우를 끝냈는데 다시 start로 감 | `hasCompletedStartFlow`, `completeStartFlow` |
| mock에서 만든 그룹/투두가 남아 있음 | mock data storage key |

특히 세션 문제는 보통 이 순서로 봅니다.

```txt
login에서 saveSession이 호출됐나?
MMKV에 accessToken/userName/loginType이 저장됐나?
Splash에서 hydrate가 호출됐나?
readSession이 null을 반환하고 있지는 않나?
useLaunchFlowQuery가 hydrated 이후 실행되나?
apiClient가 요청 직전에 토큰을 읽고 있나?
```

---

## 52. 초보자가 자주 헷갈리는 부분

### 52-1. MMKV 값이 바뀌면 화면이 자동으로 바뀌나?

아닙니다.

MMKV는 저장소입니다.

화면이 반응하려면 Zustand state도 바뀌어야 합니다.

그래서 `login`에서:

```ts
saveSession(session);
set(session);
```

둘 다 합니다.

### 52-2. 앱 시작 때 accessToken이 null이면 무조건 로그아웃인가?

아닙니다.

`hydrated`가 false인 동안에는 아직 MMKV에서 세션을 읽기 전일 수 있습니다.

그래서:

```txt
hydrated === true
```

가 된 뒤 판단해야 합니다.

### 52-3. refreshToken이 없으면 세션이 무효인가?

현재 `readSession` 기준으로는 아닙니다.

필수 값은 다음 세 개입니다.

```txt
accessToken
userName
loginType
```

`refreshToken`은 optional입니다.

### 52-4. selectedGroupId는 서버 데이터인가?

아닙니다.

`selectedGroupId`는 "내가 UI에서 어떤 그룹을 선택했는지"를 나타내는 클라이언트 상태입니다.

서버에서 온 그룹 목록은 React Query가 들고 있고, 그중 어떤 그룹을 보고 있는지는 Zustand/MMKV가 기억합니다.

### 52-5. mock 데이터는 실제 서버 데이터인가?

아닙니다.

mock repository에서 화면 테스트를 위해 MMKV에 저장하는 로컬 데이터입니다.

---

## 53. iOS 개발자 관점에서 보기

iOS에 익숙하다면 이렇게 대응시켜 볼 수 있습니다.

| iOS | RN Dogether |
| --- | --- |
| `UserDefaults.standard` | `createMMKV({ id: ... })`로 만든 `storage` |
| `set(_:forKey:)` | `storage.set(key, value)` |
| `string(forKey:)` | `storage.getString(key)` |
| `integer(forKey:)` | `storage.getNumber(key)` |
| `bool(forKey:)` | `storage.getBoolean(key)` |
| `removeObject(forKey:)` | `storage.remove(key)` |
| 앱 시작 시 UserDefaults 읽기 | `hydrate()` |
| ObservableObject 상태 갱신 | Zustand `set(...)` |

가장 중요한 차이는 React 화면 갱신입니다.

```txt
MMKV에 저장만 해서는 React 화면이 바뀌지 않는다.
Zustand state를 set해야 화면이 반응한다.
```

---

## 54. 이 프로젝트의 로컬 저장소 원칙

현재 코드에서 보이는 원칙은 다음과 같습니다.

```txt
1. MMKV 인스턴스는 storage.ts에서 한 번 만든다.
2. 공통 key는 storageKeys.ts에 모은다.
3. 세션은 sessionStorage helper로 다룬다.
4. 마지막 선택 그룹은 selectedGroupStorage helper로 다룬다.
5. 화면 반응이 필요한 값은 Zustand에도 반영한다.
6. API 인증 토큰은 요청 직전에 MMKV에서 직접 읽는다.
7. 객체/배열 mock 데이터는 JSON 문자열로 저장한다.
8. 로그아웃 시 세션과 세션성 UI 값을 함께 정리한다.
```

이 원칙만 기억해도 저장소 코드를 읽을 때 길을 잃지 않습니다.

---

## 55. 추천 읽기 순서

처음 학습할 때는 이 순서로 읽어보면 좋습니다.

1. `src/lib/storage/storage.ts`
2. `src/lib/storage/storageKeys.ts`
3. `src/lib/storage/sessionStorage.ts`
4. `src/stores/sessionStore.ts`
5. `src/screens/splash/SplashScreen.tsx`
6. `src/queries/useLaunchFlowQuery.ts`
7. `src/services/api/client.ts`
8. `src/lib/storage/selectedGroupStorage.ts`
9. `src/stores/mainStore.ts`
10. `src/services/repositories/mock/data/mockGroupData.ts`
11. `src/services/repositories/mock/data/mockTodoData.ts`
12. `src/services/repositories/mock/data/mockReviewData.ts`

이 순서대로 보면:

```txt
저장소 자체
-> 세션 저장
-> 앱 시작 복원
-> API 인증
-> 마지막 선택 그룹
-> mock 데이터
```

순서로 자연스럽게 이어집니다.

---

## 56. 마지막으로 한 번에 정리

로컬 저장소를 읽을 때 핵심은 이것입니다.

```txt
MMKV는 앱을 꺼도 남겨야 하는 값을 저장한다.
Zustand는 화면이 바로 반응해야 하는 메모리 상태를 들고 있다.
앱 시작 때 hydrate로 MMKV 값을 Zustand에 복원한다.
API 요청은 MMKV에서 accessToken을 직접 읽어 Authorization header를 붙인다.
로그아웃할 때는 세션뿐 아니라 마지막 선택 그룹도 함께 지운다.
mock 데이터는 JSON 문자열로 MMKV에 저장한다.
```

한 줄로 줄이면:

```txt
MMKV는 Dogether RN에서 "앱을 다시 켜도 기억해야 하는 값"을 맡고,
Zustand와 apiClient가 그 값을 각자 필요한 방식으로 사용한다.
```
