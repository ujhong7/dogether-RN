# iOS 개발자를 위한 React Native 개념

이 문서는 iOS 개발 경험이 있는 사람이 Dogether RN 프로젝트를 처음 읽을 때 필요한 React Native 개념을 정리한 문서입니다.

Dogether RN은 `React Native`, `Expo`, `Expo Router`, `TypeScript`, `React Query`, `Zustand`, `Axios`, `MMKV`를 중심으로 구성되어 있습니다.

## React Native를 읽는 기본 감각

React Native는 UI를 선언형으로 그립니다.

UIKit처럼 `UILabel`을 만들고 나중에 값을 직접 바꾸는 감각보다, SwiftUI처럼 "현재 상태가 이러면 화면은 이렇게 생긴다"에 가깝습니다.

```tsx
export function StartScreen() {
  return (
    <View>
      <Text>Start</Text>
    </View>
  );
}
```

여기서 `View`, `Text`는 React Native가 제공하는 기본 UI 컴포넌트입니다.

| React Native | iOS에 빗대면 |
| --- | --- |
| `View` | `UIView` |
| `Text` | `UILabel` |
| `Image` | `UIImageView` |
| `Pressable` | `UIButton` 또는 tap gesture가 붙은 view |
| `ScrollView` | `UIScrollView` |
| `TextInput` | `UITextField`, `UITextView` |

다만 RN에서는 화면을 직접 명령형으로 수정하기보다, state가 바뀌면 컴포넌트 함수가 다시 실행되고 JSX가 다시 계산됩니다.

## TSX와 JSX

`.tsx` 파일은 TypeScript와 JSX를 함께 쓰는 파일입니다.

JSX는 JavaScript/TypeScript 안에서 UI를 XML처럼 쓰는 문법입니다.

```tsx
<Pressable onPress={handlePress}>
  <Text>확인</Text>
</Pressable>
```

처음 보면 HTML처럼 보이지만, 실제로는 React 컴포넌트를 호출하는 문법입니다.

| 문법 | 의미 |
| --- | --- |
| `<Text>내용</Text>` | Text 컴포넌트에 children 전달 |
| `<Screen />` | 자식이 없는 컴포넌트 |
| `style={styles.title}` | `style` prop에 값 전달 |
| `onPress={handlePress}` | 터치 이벤트에 함수 전달 |
| `{value}` | JSX 안에서 TypeScript 값 사용 |

SwiftUI의 `VStack { Text("Hello") }`처럼 UI를 선언한다는 점은 비슷하지만, JSX는 JavaScript 표현식을 `{}` 안에 넣어서 섞어 씁니다.

## 함수형 컴포넌트

Dogether RN의 화면은 대부분 함수형 컴포넌트입니다.

```tsx
export function OnboardingScreen() {
  const { demoLoginMutation } = useOnboarding();

  return (
    <Screen>
      <Text>두게더 RN 온보딩</Text>
    </Screen>
  );
}
```

iOS 감각으로 보면 `OnboardingScreen`은 `UIViewController + View` 역할에 가깝습니다.

하지만 UIKit의 ViewController처럼 속성을 많이 들고 생명주기 메서드를 오버라이드하는 방식은 아닙니다. 화면에 필요한 값은 hook에서 가져오고, JSX는 현재 상태에 맞는 UI를 반환합니다.

## Props

Props는 부모 컴포넌트가 자식 컴포넌트에 넘기는 입력값입니다.

```tsx
<MainHeader
  group={currentGroup}
  dayLabel={progressMeta.dayLabel}
  onPressGroupName={() => setGroupSheetVisible(true)}
/>
```

iOS로 비유하면 child view나 child view controller를 만들 때 initializer 또는 property로 값을 주입하는 것과 비슷합니다.

```swift
let header = MainHeaderView(group: currentGroup)
header.onPressGroupName = { ... }
```

RN에서는 데이터뿐 아니라 이벤트 핸들러 함수도 props로 자주 넘깁니다.

## State

State는 화면이 기억해야 하는 값입니다.

React Native에서는 상태 위치가 중요합니다.

| 상태 종류 | RN에서의 위치 | iOS에 빗대면 |
| --- | --- | --- |
| 화면 안에서만 쓰는 임시 상태 | `useState` | ViewController의 private property, SwiftUI `@State` |
| 여러 화면이 공유하는 UI 상태 | Zustand store | Singleton store, ObservableObject |
| 서버에서 가져오는 데이터 상태 | React Query | Repository cache, async ViewModel state |
| 영구 저장 상태 | MMKV storage | UserDefaults, Keychain 성격의 wrapper |

예를 들어 `MainScreen`의 그룹 선택 bottom sheet 표시 여부는 화면 내부에서만 필요하므로 `useState`로 충분합니다.

```tsx
const [groupSheetVisible, setGroupSheetVisible] = useState(false);
```

반면 현재 선택된 그룹, 날짜 offset, 필터는 메인 화면 흐름에서 오래 유지해야 하므로 `mainStore`에 있습니다.

## useState

`useState`는 함수형 컴포넌트 안에서 local state를 만드는 hook입니다.

```tsx
const [groupSheetVisible, setGroupSheetVisible] = useState(false);
```

뜻은 다음과 같습니다.

| 부분 | 의미 |
| --- | --- |
| `groupSheetVisible` | 현재 값 |
| `setGroupSheetVisible` | 값을 바꾸는 함수 |
| `false` | 초기값 |

값을 바꾸면 컴포넌트가 다시 렌더링됩니다.

```tsx
setGroupSheetVisible(true);
```

SwiftUI의 `@State private var groupSheetVisible = false`와 비슷한 감각입니다.

## useEffect

`useEffect`는 렌더링 이후 실행할 작업을 등록하는 hook입니다.

```tsx
useEffect(() => {
  hydrate();
}, [hydrate]);
```

UIKit에 억지로 빗대면 `viewDidLoad`, `viewDidAppear`, `deinit` 일부 감각이 섞여 있습니다. 다만 RN에서는 dependency array가 중요합니다.

| 형태 | 의미 |
| --- | --- |
| `useEffect(() => { ... }, [])` | 처음 mount된 뒤 한 번 실행 |
| `useEffect(() => { ... }, [value])` | `value`가 바뀔 때마다 실행 |
| `return () => { ... }` | cleanup. unmount 또는 재실행 직전 호출 |

Dogether RN의 `useOnboarding`에서는 native SDK 사용 가능 여부를 확인할 때 `useEffect`를 사용합니다.

```tsx
useEffect(() => {
  AppleAuthentication.isAvailableAsync().then(...);
}, []);
```

## useMemo와 useCallback

`useMemo`는 계산 결과나 객체 생성을 재사용하는 hook입니다.

```tsx
const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
```

이 코드는 컴포넌트가 다시 렌더링되어도 `AuthUseCase` 인스턴스를 계속 재사용하게 합니다.

`useCallback`은 함수를 재사용할 때 씁니다.

```tsx
const handlePress = useCallback(() => {
  router.push('/main');
}, []);
```

iOS의 lazy property나 한 번 만든 의존성을 계속 들고 있는 ViewModel 속성과 비슷하게 생각할 수 있습니다.

## Custom Hook

`use...`로 시작하는 함수는 hook입니다.

Dogether RN에서는 화면 로직을 custom hook으로 분리합니다.

```text
Screen
  -> useSomething()
    -> useState / useEffect
    -> useQuery / useMutation
    -> Zustand store
    -> UseCase
```

예를 들어 온보딩은 이렇게 나뉩니다.

```text
OnboardingScreen
  -> useOnboarding()
    -> demoLoginMutation
    -> kakaoLoginMutation
    -> appleLoginMutation
    -> loginError
```

`OnboardingScreen`은 버튼과 UI를 그리고, 실제 로그인 흐름은 `useOnboarding`이 담당합니다.

iOS로 비유하면 Screen은 ViewController/View, custom hook은 ViewModel에 가깝습니다.

## React Query

React Query는 서버 상태를 관리하는 도구입니다.

UIKit 프로젝트에서 직접 만들던 다음 기능을 대신해줍니다.

- 로딩 상태
- 에러 상태
- 성공 데이터
- 재시도
- 캐시
- refetch
- 같은 데이터 공유

```tsx
return useQuery({
  queryKey: ['groups'],
  queryFn: () => groupUseCase.getGroups(),
});
```

`queryKey`는 캐시 주소입니다. 같은 `queryKey`를 쓰면 같은 서버 상태로 취급됩니다.

| React Query 값 | 의미 |
| --- | --- |
| `data` | 성공 데이터 |
| `isLoading` | 처음 불러오는 중 |
| `isFetching` | 다시 불러오는 중 |
| `isError` | 에러 여부 |
| `error` | 에러 객체 |
| `refetch()` | 다시 요청 |

이 프로젝트의 query hook은 `src/queries`에 있습니다.

## Mutation

Query가 "읽기"라면 mutation은 "변경"입니다.

로그인, 투두 작성, 리뷰 승인/거절처럼 서버 상태를 바꾸는 작업은 mutation으로 다룹니다.

```tsx
const demoLoginMutation = useMutation({
  mutationFn: () => authUseCase.loginDemo(),
  onSuccess: (data) => {
    loginStore(data);
  },
  onError: (error) => {
    setLoginError(toAppError(error));
  },
});
```

iOS로 보면 버튼 액션에서 비동기 API를 호출하고, 성공/실패 callback에서 ViewModel state를 바꾸는 흐름과 비슷합니다.

## Zustand

Zustand는 전역 UI 상태 저장소입니다.

React Query가 서버 데이터를 담당한다면, Zustand는 앱이 현재 들고 있어야 하는 UI 상태를 담당합니다.

```tsx
export const useMainStore = create<MainState>((set) => ({
  selectedGroupId: readLastSelectedGroupId(),
  dateOffset: 0,
  filter: 'all',
  setSelectedGroupId: (selectedGroupId) => {
    saveLastSelectedGroupId(selectedGroupId);
    set({ selectedGroupId, dateOffset: 0, filter: 'all' });
  },
}));
```

화면에서는 selector로 필요한 값만 꺼냅니다.

```tsx
const dateOffset = useMainStore((state) => state.dateOffset);
const movePast = useMainStore((state) => state.movePast);
```

SwiftUI의 `ObservableObject`나 앱 전역 store와 비슷하지만, `useMainStore(...)`를 호출하는 컴포넌트만 해당 값 변화를 구독합니다.

## Expo Router

Expo Router는 파일 기반 라우팅입니다.

`app` 폴더의 파일 이름이 route가 됩니다.

```text
app/index.tsx        -> /
app/main.tsx         -> /main
app/settings.tsx     -> /settings
app/group-create.tsx -> /group-create
```

`app/_layout.tsx`는 이 route들이 공통으로 지나는 부모 레이아웃입니다. 여기서 Stack Navigator와 전역 Provider를 설정합니다.

화면 이동은 보통 `router`를 사용합니다.

```tsx
router.push('/group-add');
router.replace('/splash');
router.back();
```

| Expo Router | iOS Navigation 감각 |
| --- | --- |
| `router.push(...)` | navigationController push |
| `router.replace(...)` | 현재 root/화면 교체 |
| `router.back()` | pop |
| `Redirect` | 화면을 그리지 않고 즉시 route 변경 |

## StyleSheet

React Native는 CSS 파일을 직접 쓰지 않고, 보통 `StyleSheet.create`로 스타일 객체를 만듭니다.

```tsx
export const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
```

사용할 때는 `style` prop에 넣습니다.

```tsx
<Text style={styles.title}>두게더 RN 온보딩</Text>
```

여러 스타일을 합칠 때는 배열을 씁니다.

```tsx
<Pressable style={[styles.button, isPending ? styles.buttonDisabled : undefined]} />
```

iOS로 보면 Auto Layout constraint를 직접 작성한다기보다, Flexbox 기반 layout style을 선언하는 방식입니다.

## Flexbox

React Native layout은 Flexbox를 사용합니다.

UIKit의 Auto Layout과 달리 constraint를 연결하기보다, 부모와 자식이 layout 규칙을 공유합니다.

자주 보는 속성은 다음과 같습니다.

| 속성 | 의미 |
| --- | --- |
| `flex: 1` | 가능한 공간을 차지 |
| `flexDirection` | 자식 배치 방향. 기본값은 `column` |
| `alignItems` | 교차축 정렬 |
| `justifyContent` | 주축 정렬 |
| `gap` | 자식 사이 간격 |
| `padding` | 내부 여백 |
| `margin` | 외부 여백 |

웹 CSS는 기본 방향이 row 느낌이 강하지만, React Native Flexbox의 기본 방향은 `column`입니다.

## TypeScript 기본 감각

TypeScript는 JavaScript에 타입을 얹은 언어입니다.

```ts
function save(groupId: number): Promise<void>
```

| 문법 | 의미 | Swift에 빗대면 |
| --- | --- | --- |
| `groupId: number` | 매개변수 타입 | `groupId: Int` |
| `Promise<void>` | 비동기 작업, 반환값 없음 | `async -> Void` |
| `string \| null` | 문자열 또는 null | `String?` |
| `type Foo = { ... }` | 데이터 모양 정의 | struct에 가까움 |
| `interface Repository` | 구현해야 하는 메서드 목록 | protocol |
| `private readonly repo` | 내부에서만 읽는 의존성 | `private let repo` |

Repository contract는 Swift protocol처럼 보면 됩니다.

```ts
export interface AuthRepository {
  loginDemo(): Promise<AuthSession>;
  loginWithApple(payload: AppleLoginPayload): Promise<AuthSession>;
}
```

## UseCase와 Repository

Dogether RN은 화면이 API를 직접 호출하지 않습니다.

```text
Screen
  -> Hook
    -> UseCase
      -> Repository interface
        -> API 구현체 or Mock 구현체
```

예를 들어 로그인 흐름은 다음과 같습니다.

```text
OnboardingScreen
  -> useOnboarding
    -> AuthUseCase
      -> AuthRepository
        -> AuthRepositoryImpl or MockAuthRepository
```

`AuthUseCase`는 Swift로 치면 다음과 비슷합니다.

```swift
final class AuthUseCase {
  private let authRepository: AuthRepository
}
```

실제 API를 쓸지 mock을 쓸지는 `src/services/repositories/index.ts`에서 환경값에 따라 결정합니다.

## Axios와 API Client

Axios는 HTTP 요청 라이브러리입니다.

이 프로젝트는 Axios를 화면에서 직접 쓰지 않고 `apiClient`로 감쌉니다.

```text
Repository Impl
  -> apiClient
    -> request interceptor
      -> MMKV에서 access token 읽기
      -> Authorization header 추가
```

iOS의 `URLSession` wrapper 또는 Alamofire Session에 interceptor를 붙인 구조와 비슷합니다.

`src/services/api/client.ts`를 보면 base URL, timeout, Authorization header 처리를 확인할 수 있습니다.

## MMKV Storage

MMKV는 React Native에서 사용하는 빠른 key-value 저장소입니다.

iOS의 `UserDefaults` wrapper와 비슷하게 생각하면 됩니다.

이 프로젝트에서는 `src/lib/storage` 아래에 저장소 관련 파일이 있습니다.

```text
storage.ts                MMKV 인스턴스 생성
storageKeys.ts            저장 key 모음
sessionStorage.ts         로그인 세션 저장/복원
selectedGroupStorage.ts   마지막 선택 그룹 저장
```

세션 store는 앱이 켜질 때 MMKV에서 저장된 세션을 읽어 Zustand 상태로 옮깁니다.

```text
MMKV
  -> readSession()
  -> useSessionStore.hydrate()
  -> accessToken / userName / loginType
```

그래서 앱 시작 시 `hydrated`가 중요합니다. `hydrated`가 false이면 아직 저장소를 다 읽지 않았으므로 로그인 여부를 단정하면 안 됩니다.

## Native 기능

React Native 앱에서도 native SDK를 사용할 수 있습니다.

Dogether RN에서 사용하는 native 성격의 기능은 다음과 같습니다.

| 기능 | 사용 라이브러리 |
| --- | --- |
| Kakao 로그인 | `@react-native-seoul/kakao-login` |
| Apple 로그인 | `expo-apple-authentication` |
| 이미지 선택 | `expo-image-picker` |
| 파일 처리 | `expo-file-system` |
| 로컬 저장소 | `react-native-mmkv` |

이런 기능은 iOS/Android 환경에 따라 동작 가능 여부가 달라질 수 있습니다. 그래서 `useOnboarding`처럼 사용 가능 여부를 먼저 확인하고 버튼 노출을 결정하는 코드가 있습니다.

## RN에서 조심해야 하는 차이

### 1. 렌더링 함수 안에서 부수효과를 직접 실행하지 않는다

컴포넌트 함수는 state가 바뀔 때 다시 실행될 수 있습니다. 그래서 API 호출, 저장소 쓰기, navigation 같은 부수효과는 render 중에 직접 실행하지 않고 event handler, `useEffect`, query/mutation 안에서 처리합니다.

### 2. state 변경은 다시 렌더링을 만든다

`setState`, Zustand `set`, React Query cache 갱신은 UI 갱신으로 이어질 수 있습니다. 화면에 보여줄 값이면 어디에서 구독하고 있는지 확인해야 합니다.

### 3. 서버 상태와 UI 상태를 섞지 않는다

그룹 목록, 투두 목록처럼 서버에서 가져오는 데이터는 React Query가 담당합니다. 선택 그룹, 날짜 offset, 필터처럼 앱이 현재 보고 있는 조건은 Zustand가 담당합니다.

### 4. route 파일과 화면 파일은 다르다

`app/main.tsx`는 `/main` route를 만드는 파일이고, 실제 화면 구현은 `src/screens/main/MainScreen.tsx`에 있습니다.

### 5. iOS와 Android가 함께 있다

React Native 코드는 한 파일에서 iOS/Android를 함께 다룹니다. 플랫폼별 차이가 필요하면 `Platform.OS`를 확인하거나, 라이브러리의 가용성 API를 사용합니다.

## Dogether RN을 읽는 추천 순서

iOS 개발자라면 아래 순서가 가장 자연스럽습니다.

```text
1. app/_layout.tsx
   -> 앱 전체 navigation stack과 Provider 확인

2. app/index.tsx, app/splash.tsx
   -> 앱 첫 진입 route 확인

3. src/screens/splash/SplashScreen.tsx
   -> 첫 화면 분기 UI 확인

4. src/queries/useLaunchFlowQuery.ts
   -> 서버/저장소 상태를 바탕으로 첫 화면 판단

5. src/services/usecases/appLaunchUseCase.ts
   -> launch coordinator 역할의 비즈니스 규칙 확인

6. src/screens/main/MainScreen.tsx
   -> 실제 메인 화면 JSX 구조 확인

7. src/hooks/useMainScreen.ts
   -> ViewModel처럼 상태와 파생값 확인

8. src/stores/mainStore.ts
   -> 선택 그룹, 날짜, 필터 상태 확인

9. src/queries/useGroupsQuery.ts, src/queries/useMyTodosQuery.ts
   -> 서버 상태 흐름 확인

10. src/services/repositories/index.ts
    -> API/Mock 구현체 선택 방식 확인
```

## 한 줄 요약

```text
RN에서는 Screen이 UI를 그리고,
Hook이 ViewModel처럼 로직을 정리하고,
React Query가 서버 상태를 맡고,
Zustand가 전역 UI 상태를 맡고,
UseCase/Repository가 API와 Mock 데이터 출처를 숨긴다.
```
