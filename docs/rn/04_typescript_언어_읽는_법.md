# TypeScript 언어 읽는 법

이 문서는 Dogether RN 코드를 읽기 위해 필요한 TypeScript 문법을 정리한 문서입니다.

TypeScript 전체 문법을 처음부터 끝까지 설명하기보다, 이 프로젝트에서 실제로 자주 나오는 표현을 중심으로 설명합니다.

## TypeScript를 읽는 기본 감각

TypeScript는 JavaScript에 타입을 붙인 언어입니다.

React Native 앱은 실제 실행 시 JavaScript로 동작하지만, 개발할 때는 TypeScript가 값의 모양을 미리 검사해줍니다.

```ts
export type Group = {
  id: number;
  name: string;
  currentMember: number;
  maximumMember: number;
};
```

iOS 개발자 관점에서는 Swift의 `struct`와 비슷하게 볼 수 있습니다.

```swift
struct Group {
  let id: Int
  let name: String
  let currentMember: Int
  let maximumMember: Int
}
```

다만 TypeScript의 타입은 런타임 객체가 아니라, 개발 중 코드의 모양을 검사하기 위한 정보입니다.

## `.ts`와 `.tsx`

파일 확장자는 보통 두 가지입니다.

| 확장자 | 의미 | 예시 |
| --- | --- | --- |
| `.ts` | TypeScript 코드 | model, hook, store, usecase |
| `.tsx` | TypeScript + JSX | React Native 화면/컴포넌트 |

JSX를 쓰는 파일은 `.tsx`입니다.

```tsx
export function MainScreen() {
  return <Text>메인</Text>;
}
```

JSX가 없는 모델, store, repository 파일은 `.ts`입니다.

```ts
export type TodoStatus = 'WAIT_CERTIFICATION' | 'WAIT_APPROVAL';
```

## 기본 타입

TypeScript의 기본 타입은 Swift와 비슷하게 읽을 수 있습니다.

| TypeScript | 의미 | Swift에 빗대면 |
| --- | --- | --- |
| `string` | 문자열 | `String` |
| `number` | 숫자 | `Int`, `Double` |
| `boolean` | 참/거짓 | `Bool` |
| `null` | 값이 없음 | `nil` |
| `undefined` | 값이 아직 정의되지 않음 | optional 값이 없는 상태와 비슷 |
| `void` | 반환값 없음 | `Void` |
| `unknown` | 타입을 아직 모름 | 안전한 `Any` |
| `any` | 타입 검사를 거의 하지 않음 | 위험한 `Any` |

예:

```ts
const name: string = 'Dogether';
const count: number = 3;
const loading: boolean = false;
```

이 프로젝트에서는 서버 응답처럼 아직 모양이 확실하지 않은 값에 `unknown` 또는 `any`가 등장합니다.

```ts
function mapTodoStatus(value: unknown): Todo['status'] {
  ...
}
```

## 변수 선언: const와 let

TypeScript에서는 변수를 만들 때 `const`와 `let`을 자주 씁니다.

### const

`const`는 다시 대입할 수 없는 변수입니다. Swift의 `let`과 비슷합니다.

```ts
const selectedGroupId = useMainStore((state) => state.selectedGroupId);
```

한 번 값을 넣은 뒤 다른 값으로 바꾸지 않습니다.

### let

`let`은 다시 대입할 수 있는 변수입니다. Swift의 `var`와 비슷합니다.

```ts
let mounted = true;

return () => {
  mounted = false;
};
```

이 프로젝트에서는 대부분 `const`를 사용하고, 값이 실제로 바뀌어야 할 때만 `let`을 씁니다.

## type

`type`은 데이터의 모양에 이름을 붙이는 문법입니다.

```ts
export type Todo = {
  id: number;
  content: string;
  status: TodoStatus;
  certificationContent?: string;
};
```

Swift의 `struct`처럼 읽으면 쉽습니다.

```swift
struct Todo {
  let id: Int
  let content: String
  let status: TodoStatus
  let certificationContent: String?
}
```

`export`는 다른 파일에서 이 타입을 가져다 쓸 수 있게 공개한다는 뜻입니다.

## interface

`interface`는 객체가 가져야 하는 메서드나 속성의 약속을 정의합니다.

Repository contract에서 자주 나옵니다.

```ts
export interface ChallengeGroupRepository {
  getMyTodos(groupId: number, date: string): Promise<Todo[]>;
  createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]>;
}
```

iOS로 비유하면 Swift `protocol`에 가깝습니다.

```swift
protocol ChallengeGroupRepository {
  func getMyTodos(groupId: Int, date: String) async throws -> [Todo]
}
```

실제 API 구현체와 Mock 구현체는 같은 interface를 따라야 합니다.

## type과 interface 차이

이 프로젝트에서는 대체로 이렇게 쓰면 됩니다.

| 문법 | 주 용도 | 예시 |
| --- | --- | --- |
| `type` | 데이터 모델, union type, 화면 option | `Todo`, `Group`, `LoginType` |
| `interface` | 구현해야 하는 contract | `AuthRepository`, `GroupRepository` |

엄밀히는 둘 다 객체 모양을 표현할 수 있지만, 프로젝트를 읽을 때는 위 기준으로 이해하면 충분합니다.

## Union Type

Union type은 가능한 값의 목록을 제한합니다.

```ts
export type LoginType = 'apple' | 'kakao' | 'demo';
```

뜻은 `LoginType`에는 세 문자열만 들어갈 수 있다는 것입니다.

```ts
const loginType: LoginType = 'kakao';
```

아래 값은 허용되지 않습니다.

```ts
const loginType: LoginType = 'google';
```

프로젝트 예시:

```ts
export type TodoStatus =
  | 'WAIT_CERTIFICATION'
  | 'WAIT_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';
```

Swift의 enum과 비슷하게 볼 수 있습니다.

```swift
enum TodoStatus {
  case waitCertification
  case waitApproval
  case approved
  case rejected
}
```

## Optional Property: `?`

객체 타입의 속성 이름 뒤에 `?`가 붙으면 그 값은 없어도 됩니다.

```ts
export type AuthSession = {
  accessToken: string;
  refreshToken?: string | null;
  userName: string;
};
```

`refreshToken?: string | null`은 다음을 뜻합니다.

```text
refreshToken 속성이 아예 없을 수도 있고,
있다면 string 또는 null일 수 있다.
```

Swift의 optional과 비슷하지만, TypeScript에는 `undefined`와 `null`이 모두 있다는 점이 다릅니다.

## `null`과 `undefined`

TypeScript에서는 값이 없다는 표현이 두 가지입니다.

| 값 | 의미 |
| --- | --- |
| `null` | 의도적으로 비어 있음 |
| `undefined` | 값이 아직 없거나 속성이 없음 |

이 프로젝트에서는 상태값이 명시적으로 비어 있음을 나타낼 때 `null`을 자주 씁니다.

```ts
accessToken: string | null;
selectedGroupId: number | null;
```

optional property는 값이 없으면 `undefined`가 될 수 있습니다.

```ts
certificationContent?: string;
```

## `|` 읽는 법

`|`는 "또는"입니다.

```ts
string | null
```

뜻:

```text
string이거나 null이다
```

예:

```ts
const accessToken: string | null = null;
```

이 타입의 값은 사용할 때 null 체크가 필요합니다.

```ts
if (accessToken) {
  config.headers.Authorization = `Bearer ${accessToken}`;
}
```

## 배열 타입

배열은 두 가지 방식으로 쓸 수 있습니다.

```ts
Todo[]
Array<Todo>
```

이 프로젝트에서는 `Todo[]` 형태가 더 자주 보입니다.

```ts
getMyTodos(groupId: number, date: string): Promise<Todo[]>;
```

뜻은 "비동기로 Todo 배열을 돌려준다"입니다.

문자열 배열은 이렇게 읽습니다.

```ts
contents: string[]
```

뜻:

```text
contents는 string들의 배열이다
```

## 객체 타입

객체 타입은 `{ ... }` 안에 속성 이름과 타입을 적습니다.

```ts
export type MemberTodosResult = {
  selectedIndex: number;
  todos: Todo[];
};
```

뜻:

```text
MemberTodosResult는 selectedIndex 숫자와 todos 배열을 가진 객체다.
```

서버 응답 타입도 이런 식으로 정의합니다.

```ts
type MemberTodosResponse = {
  currentTodoHistoryToReadIndex?: number;
  todos?: any[];
};
```

## 함수 타입

함수 타입은 매개변수와 반환값으로 읽습니다.

```ts
setSelectedGroupId: (groupId: number | null) => void;
```

뜻:

```text
number 또는 null을 받고,
반환값은 없는 함수다.
```

Swift로 보면:

```swift
(Int?) -> Void
```

Zustand store에서 action 타입을 정의할 때 자주 나옵니다.

```ts
movePast: () => void;
setFilter: (filter: TodoFilter) => void;
```

## Promise

`Promise<T>`는 비동기 작업의 결과 타입입니다.

```ts
loginDemo(): Promise<AuthSession>;
```

뜻:

```text
loginDemo는 비동기로 실행되고,
성공하면 AuthSession을 돌려준다.
```

Swift의 async 함수와 비슷합니다.

```swift
func loginDemo() async throws -> AuthSession
```

반환할 값이 없으면 `Promise<void>`입니다.

```ts
readTodo(todoId: number): Promise<void>;
```

## async와 await

`async` 함수 안에서는 `await`로 Promise가 끝날 때까지 기다릴 수 있습니다.

```ts
async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
  const res = await apiClient.get(...);
  return (res.data.data?.todos ?? []).map(mapTodo);
}
```

읽는 순서:

```text
1. apiClient.get(...) 요청을 보낸다.
2. 응답이 올 때까지 기다린다.
3. 응답에서 todos를 꺼낸다.
4. mapTodo로 앱 모델 배열로 바꿔 반환한다.
```

`await`는 `async` 함수 안에서만 사용할 수 있습니다.

## 제네릭: `<T>`

제네릭은 타입을 나중에 끼워 넣는 문법입니다.

```ts
apiClient.get<ApiEnvelope<{ todos: any[] }>>(...)
```

뜻:

```text
이 GET 요청의 응답은 ApiEnvelope<{ todos: any[] }> 모양이라고 알려준다.
```

React Query, Axios, Zustand, 여러 helper에서 제네릭이 자주 보입니다.

```ts
create<SessionState>((set) => ({ ... }))
```

뜻:

```text
이 Zustand store의 전체 상태 모양은 SessionState다.
```

## import와 export

`export`는 다른 파일에서 가져다 쓸 수 있게 공개합니다.

```ts
export type Todo = {
  id: number;
  content: string;
};
```

`import`는 다른 파일에서 공개한 값을 가져옵니다.

```ts
import type { Todo } from '../../../models/todo';
```

`import type`은 타입 정보만 가져온다는 뜻입니다. 런타임 JavaScript 코드에는 남지 않아도 되는 import입니다.

일반 값이나 함수는 이렇게 가져옵니다.

```ts
import { apiClient } from '../../api/client';
```

## 구조 분해 할당

구조 분해 할당은 객체나 배열에서 필요한 값만 꺼내는 문법입니다.

객체 구조 분해:

```ts
const { demoLoginMutation, loginError } = useOnboarding();
```

뜻:

```text
useOnboarding()이 반환한 객체에서
demoLoginMutation과 loginError만 꺼내 변수로 만든다.
```

배열 구조 분해:

```ts
const [groupSheetVisible, setGroupSheetVisible] = useState(false);
```

뜻:

```text
첫 번째 값은 현재 상태,
두 번째 값은 상태를 바꾸는 함수다.
```

## Optional Chaining: `?.`

`?.`는 왼쪽 값이 `null` 또는 `undefined`이면 뒤를 실행하지 않고 `undefined`를 반환합니다.

```ts
const currentGroup = groupsQuery.data?.find((group) => group.id === selectedGroupId);
```

뜻:

```text
groupsQuery.data가 있으면 find를 실행하고,
없으면 currentGroup은 undefined가 된다.
```

Swift의 optional chaining과 비슷합니다.

```swift
groupsQuery.data?.first(where: { ... })
```

## Nullish Coalescing: `??`

`??`는 왼쪽 값이 `null` 또는 `undefined`이면 오른쪽 값을 사용합니다.

```ts
const visibleTodos = todosQuery.data ?? [];
```

뜻:

```text
todosQuery.data가 있으면 그 값을 쓰고,
없으면 빈 배열을 쓴다.
```

`||`와 비슷해 보이지만 다릅니다. `??`는 `null`과 `undefined`만 기본값으로 대체합니다.

## 삼항 연산자

삼항 연산자는 조건에 따라 값을 고르는 문법입니다.

```ts
return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
```

뜻:

```text
env.useMockGroups가 true면 MockGroupRepository,
false면 GroupRepositoryImpl을 반환한다.
```

Swift의 ternary와 비슷합니다.

```swift
env.useMockGroups ? MockGroupRepository() : GroupRepositoryImpl()
```

## 화살표 함수

화살표 함수는 짧게 함수를 만드는 문법입니다.

```ts
const readAccessToken = () => storage.getString(storageKeys.accessToken);
```

프로젝트에서 자주 보이는 형태:

```ts
const selectedGroupId = useMainStore((state) => state.selectedGroupId);
```

뜻:

```text
state를 받아서 state.selectedGroupId를 반환하는 함수다.
```

Zustand selector, 배열 `map/filter/find`, 이벤트 핸들러에서 자주 사용합니다.

## map, filter, find

배열을 다룰 때 자주 나오는 메서드입니다.

### map

`map`은 배열의 각 요소를 다른 모양으로 바꿉니다.

```ts
return (res.data.data?.todos ?? []).map(mapTodo);
```

뜻:

```text
서버 todo 배열의 각 raw todo를 mapTodo로 변환한다.
```

### filter

`filter`는 조건을 통과하는 요소만 남깁니다.

```ts
const filteredTodos = visibleTodos.filter((todo) => {
  return mapTodoToFilter(todo) === filter;
});
```

### find

`find`는 조건에 맞는 첫 번째 요소를 찾습니다.

```ts
return todos.find((todo) => todo.id === todoId) ?? null;
```

못 찾으면 `undefined`를 반환하므로, 여기서는 `?? null`로 null을 반환하게 바꿉니다.

## switch

`switch`는 값에 따라 분기할 때 사용합니다.

```ts
function mapTodoStatus(value: unknown): Todo['status'] {
  switch (String(value ?? '').toUpperCase()) {
    case 'CERTIFY_PENDING':
    case 'WAIT_CERTIFICATION':
      return 'WAIT_CERTIFICATION';
    case 'REVIEW_PENDING':
    case 'WAIT_APPROVAL':
      return 'WAIT_APPROVAL';
    default:
      return 'WAIT_CERTIFICATION';
  }
}
```

서버에서 온 문자열을 앱 내부 상태값으로 바꿀 때 이런 패턴이 자주 나옵니다.

## `Todo['status']`

이런 문법은 indexed access type입니다.

```ts
function mapTodoStatus(value: unknown): Todo['status'] {
  ...
}
```

뜻:

```text
Todo 타입의 status 속성 타입을 함수 반환 타입으로 사용한다.
```

`Todo['status']`는 결국 아래 타입과 같습니다.

```ts
'WAIT_CERTIFICATION' | 'WAIT_APPROVAL' | 'APPROVED' | 'REJECTED'
```

이렇게 쓰면 `Todo.status`의 타입이 바뀌었을 때 함수 반환 타입도 같이 따라갑니다.

## Record

`Record<K, V>`는 key와 value 타입을 가진 객체 타입입니다.

```ts
const APP_ERROR_PRESETS: Record<AppErrorCode, AppError> = {
  COMMON: { ... },
  'ATF-0003': { ... },
};
```

뜻:

```text
AppErrorCode 각각을 key로 가지고,
각 key의 value는 AppError다.
```

Swift의 dictionary와 비슷하지만, TypeScript는 key 목록이 빠졌는지도 검사할 수 있습니다.

## Pick과 Omit

`Pick`과 `Omit`은 기존 타입에서 일부 속성만 선택하거나 제외할 때 쓰는 유틸리티 타입입니다.

```ts
login: (payload: Omit<AuthSession, 'hasCompletedStartFlow'>) => void;
```

뜻:

```text
AuthSession에서 hasCompletedStartFlow만 뺀 타입을 payload로 받는다.
```

`Pick`은 반대로 필요한 속성만 고릅니다.

```ts
type RuntimeEnvDefaults = Pick<RuntimeEnv, 'apiBaseUrl' | 'appStoreUrl' | 'useMockApi'>;
```

뜻:

```text
RuntimeEnv 중 apiBaseUrl, appStoreUrl, useMockApi만 가진 타입이다.
```

## as

`as`는 타입 단언입니다.

```ts
const profile = (await getProfile()) as KakaoProfile;
```

뜻:

```text
이 값은 KakaoProfile이라고 TypeScript에게 알려준다.
```

주의해야 합니다. 실제 런타임 값이 그 모양이 아니어도 TypeScript는 믿어버립니다. 그래서 바로 아래에서 필요한 값이 있는지 검사하는 코드가 같이 나오는 경우가 많습니다.

```ts
if (!profile?.id) {
  throw getAppError('ATF-0007');
}
```

## class와 constructor

UseCase와 Repository 구현체는 class로 작성되어 있습니다.

```ts
export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginDemo() {
    return this.authRepository.loginDemo();
  }
}
```

`constructor(private readonly authRepository: AuthRepository)`는 아래와 비슷합니다.

```ts
class AuthUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }
}
```

Swift로 보면:

```swift
final class AuthUseCase {
  private let authRepository: AuthRepository
}
```

## implements

`implements`는 class가 interface 약속을 지킨다는 뜻입니다.

```ts
export class ChallengeGroupRepositoryImpl implements ChallengeGroupRepository {
  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    ...
  }
}
```

Swift의 protocol 채택과 비슷합니다.

```swift
final class ChallengeGroupRepositoryImpl: ChallengeGroupRepository {
  ...
}
```

interface에 정의된 메서드를 빠뜨리면 TypeScript가 에러를 냅니다.

## try, catch, throw

비동기 API 호출은 실패할 수 있으므로 `try/catch`로 감쌉니다.

```ts
try {
  const res = await apiClient.get(...);
  return (res.data.data?.todos ?? []).map(mapTodo);
} catch (error) {
  throw toAppError(error);
}
```

뜻:

```text
요청이 성공하면 데이터를 반환하고,
실패하면 프로젝트 공통 AppError로 변환해서 다시 던진다.
```

Swift의 `do/catch/throw`와 비슷합니다.

## 자주 보이는 한 줄 해석

### `const currentGroup = groupsQuery.data?.find(...) ?? groupsQuery.data?.[0];`

```text
선택된 그룹 id와 일치하는 그룹을 찾고,
못 찾으면 첫 번째 그룹을 사용한다.
```

### `const visibleTodos = todosQuery.data ?? [];`

```text
투두 데이터가 아직 없으면 빈 배열로 처리한다.
```

### `const isPending = a.isPending || b.isPending || c.isPending;`

```text
여러 요청 중 하나라도 진행 중이면 true다.
```

### `set((state) => ({ dateOffset: state.dateOffset - 1 }));`

```text
현재 Zustand state를 받아 dateOffset만 하나 줄인 새 상태를 만든다.
```

### `return todos.find((todo) => todo.id === todoId) ?? null;`

```text
id가 같은 todo를 찾고, 없으면 null을 반환한다.
```

## Dogether RN에서 특히 자주 보는 패턴

### 모델 타입

```ts
export type Group = {
  id: number;
  name: string;
  status: GroupStatus;
};
```

서버나 화면에서 쓰는 데이터 모양입니다.

### Repository interface

```ts
export interface AuthRepository {
  loginDemo(): Promise<AuthSession>;
}
```

API/Mock 구현체가 지켜야 하는 약속입니다.

### UseCase class

```ts
export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}
}
```

화면의 의도를 repository 호출로 연결합니다.

### Zustand store

```ts
export const useMainStore = create<MainState>((set) => ({
  dateOffset: 0,
  movePast: () => set((state) => ({ dateOffset: state.dateOffset - 1 })),
}));
```

앱 전역 UI 상태를 만듭니다.

### React Query hook

```ts
return useQuery({
  queryKey: ['groups'],
  queryFn: () => groupUseCase.getGroups(),
});
```

서버 데이터를 읽고 캐싱합니다.

## 처음 읽을 때의 요령

TypeScript 코드를 처음 읽을 때는 모든 문법을 한 번에 이해하려고 하지 않아도 됩니다.

아래 순서로 보면 충분합니다.

```text
1. export type을 먼저 본다.
   -> 이 파일이 다루는 데이터 모양 확인

2. interface를 본다.
   -> 이 계층이 제공해야 하는 기능 확인

3. Promise 반환값을 본다.
   -> 비동기로 무엇을 돌려주는지 확인

4. null과 optional을 본다.
   -> 값이 없을 수 있는 지점 확인

5. map/filter/find를 본다.
   -> 배열을 어떻게 가공하는지 확인

6. try/catch를 본다.
   -> 실패를 어떻게 앱 에러로 바꾸는지 확인
```

## 한 줄 요약

```text
TypeScript는 "이 값이 어떤 모양인지"를 코드 옆에 적어두는 언어이고,
Dogether RN에서는 type으로 모델을 읽고,
interface로 repository 약속을 읽고,
Promise로 비동기 흐름을 읽고,
union/null/optional로 가능한 상태를 읽으면 된다.
```
