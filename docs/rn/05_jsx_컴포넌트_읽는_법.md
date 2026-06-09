# JSX 컴포넌트 읽는 법

이 문서는 Dogether RN 코드에서 `.tsx` 화면과 컴포넌트를 읽는 방법을 정리한 문서입니다.

TypeScript 문법을 아는 것과 React Native 화면을 읽는 것은 조금 다릅니다. 화면 파일에서는 `JSX`, `props`, `children`, 조건부 렌더링, 리스트 렌더링, 스타일 배열을 읽을 수 있어야 합니다.

## JSX를 읽는 기본 감각

JSX는 TypeScript 코드 안에서 UI를 태그처럼 쓰는 문법입니다.

```tsx
return (
  <View>
    <Text>안녕하세요</Text>
  </View>
);
```

구조로 보면 다음과 같습니다.

```text
View
└── Text
    └── "안녕하세요"
```

iOS UIKit의 view hierarchy와 비슷하게 볼 수 있습니다.

```text
UIView
└── UILabel
```

하지만 React Native에서는 실제 view를 찾아서 직접 수정하기보다, 현재 상태에 맞는 JSX tree를 다시 반환합니다.

```text
상태가 이러면
화면은 이런 JSX tree다
```

## JSX는 함수의 반환값이다

React Native 화면은 보통 함수형 컴포넌트입니다.

```tsx
export function MainScreen() {
  return (
    <Screen>
      <Text>메인</Text>
    </Screen>
  );
}
```

`MainScreen`은 현재 상태를 기준으로 어떤 UI를 보여줄지 반환하는 함수입니다.

상태가 바뀌면 컴포넌트 함수가 다시 실행되고, 새로운 JSX가 계산됩니다.

## JSX tree 읽는 법

JSX는 바깥 태그부터 안쪽 태그로 읽으면 됩니다.

```tsx
<Screen>
  <MainHeader />
  <MainPanel />
  <ReviewToast />
</Screen>
```

구조:

```text
Screen
├── MainHeader
├── MainPanel
└── ReviewToast
```

Dogether RN의 `MainScreen`도 이 감각으로 읽으면 됩니다.

```text
MainScreen
└── Screen
    ├── MainHeader
    ├── MainPanel
    ├── GroupSelectBottomSheet
    └── ReviewToast
```

## React Native 기본 컴포넌트

React Native에서는 HTML 태그를 쓰지 않고, RN이 제공하는 기본 컴포넌트를 씁니다.

| 컴포넌트 | 역할 | iOS에 빗대면 |
| --- | --- | --- |
| `View` | 기본 레이아웃 컨테이너 | `UIView` |
| `Text` | 텍스트 표시 | `UILabel` |
| `Pressable` | 터치 가능한 영역 | `UIButton`, tap gesture view |
| `TextInput` | 텍스트 입력 | `UITextField` |
| `ScrollView` | 스크롤 컨테이너 | `UIScrollView` |
| `Image` | 이미지 | `UIImageView` |
| `Modal` | 모달 표시 | modal presentation |

예:

```tsx
<Pressable onPress={onMovePast}>
  <Text>‹</Text>
</Pressable>
```

이 코드는 "누를 수 있는 영역 안에 텍스트를 보여준다"는 뜻입니다.

## Props

Props는 부모 컴포넌트가 자식 컴포넌트에 넘기는 입력값입니다.

```tsx
<MainHeader
  group={currentGroup}
  dayLabel={progressMeta.dayLabel}
  progressPercent={progressMeta.progressPercent}
  onPressGroupName={() => setGroupSheetVisible(true)}
/>
```

`MainHeader`가 받는 props 타입은 보통 컴포넌트 위쪽에 있습니다.

```ts
type Props = {
  group?: Group;
  dayLabel: string;
  progressPercent: number;
  onPressGroupName: () => void;
};
```

읽는 법:

| prop | 의미 |
| --- | --- |
| `group` | 표시할 그룹 정보. 없을 수도 있음 |
| `dayLabel` | 진행 현황에 보여줄 날짜 라벨 |
| `progressPercent` | 진행률 숫자 |
| `onPressGroupName` | 그룹 이름을 눌렀을 때 실행할 함수 |

부모는 데이터와 이벤트를 내려주고, 자식은 그 값을 사용해 UI를 그립니다.

## Props 구조 분해

컴포넌트 함수의 매개변수에서 props를 바로 꺼내는 문법이 자주 나옵니다.

```tsx
export function TodoRow({
  todo,
  dateOffset,
  currentGroupId,
  queryDate,
  todoIds,
  selectedIndex,
}: Props) {
  ...
}
```

뜻:

```text
Props 객체에서 todo, dateOffset, currentGroupId 등을 꺼내
컴포넌트 안에서 바로 변수처럼 쓰겠다.
```

아래 코드와 비슷합니다.

```tsx
export function TodoRow(props: Props) {
  const todo = props.todo;
  const dateOffset = props.dateOffset;
}
```

## children

`children`은 컴포넌트 태그 사이에 들어오는 자식 UI입니다.

```tsx
<Screen>
  <Text>메인</Text>
</Screen>
```

`Screen` 컴포넌트는 `children`을 받아서 `SafeAreaView` 안에 넣습니다.

```tsx
type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
      ) : (
        <View style={styles.wrap}>{children}</View>
      )}
    </SafeAreaView>
  );
}
```

구조로 보면:

```text
Screen
└── SafeAreaView
    └── View or ScrollView
        └── children
```

Flutter의 `child` 또는 `children`과 비슷한 감각입니다.

## 하나의 부모로 감싸야 한다

컴포넌트는 보통 하나의 루트 JSX를 반환해야 합니다.

아래는 안 됩니다.

```tsx
return (
  <Text>A</Text>
  <Text>B</Text>
);
```

그래서 `View`로 감싸거나 Fragment를 씁니다.

```tsx
return (
  <View>
    <Text>A</Text>
    <Text>B</Text>
  </View>
);
```

또는:

```tsx
return (
  <>
    <Text>A</Text>
    <Text>B</Text>
  </>
);
```

`<>...</>`는 Fragment입니다. 화면에 별도 `View`를 만들지 않고 여러 JSX를 묶을 때 씁니다.

`MainHeader`는 Fragment를 사용합니다.

```tsx
return (
  <>
    <View style={styles.topBar}>...</View>
    <View style={styles.groupSection}>...</View>
    <Pressable style={styles.rankingButton}>...</Pressable>
  </>
);
```

## `{}` 읽는 법

JSX 안에서 TypeScript 값을 넣을 때는 `{}`를 씁니다.

```tsx
<Text>{formattedDate}</Text>
```

뜻:

```text
formattedDate 변수 값을 Text 안에 표시한다.
```

문자열 조합도 가능합니다.

```tsx
<Text>{visibleTodos.length}/10</Text>
```

삼항 연산자나 함수 호출도 들어갈 수 있습니다.

```tsx
<Text>{group?.name ?? '그룹 선택'}</Text>
```

뜻:

```text
group.name이 있으면 보여주고,
없으면 "그룹 선택"을 보여준다.
```

## 조건부 렌더링: 삼항 연산자

조건에 따라 다른 UI를 보여줄 때 삼항 연산자를 많이 씁니다.

```tsx
{scroll ? (
  <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
) : (
  <View style={styles.wrap}>{children}</View>
)}
```

뜻:

```text
scroll이 true면 ScrollView를 보여주고,
false면 View를 보여준다.
```

`Screen` 컴포넌트가 이 패턴을 사용합니다.

## 조건부 렌더링: `조건 ? JSX : null`

조건이 맞을 때만 UI를 보여주고 싶으면 `null`을 반환합니다.

```tsx
{sheetStatus === 'createTodo' ? (
  <View style={styles.centerState}>
    <Text>오늘의 투두를 작성해보세요</Text>
  </View>
) : null}
```

뜻:

```text
sheetStatus가 createTodo면 이 UI를 그리고,
아니면 아무것도 그리지 않는다.
```

React에서 `null`은 "렌더링하지 않음"입니다.

## 조건부 렌더링: `조건 && JSX`

짧게 쓸 때는 `&&`도 사용할 수 있습니다.

```tsx
{error.cancelLabel ? (
  <Pressable onPress={onClose}>
    <Text>{error.cancelLabel}</Text>
  </Pressable>
) : null}
```

이 프로젝트에서는 명확성을 위해 `조건 ? JSX : null` 형태가 많이 보입니다.

## 리스트 렌더링: map

배열을 UI 목록으로 바꿀 때 `map`을 사용합니다.

```tsx
{filteredTodos.map((todo, index) => (
  <TodoRow
    key={todo.id}
    todo={todo}
    selectedIndex={index}
  />
))}
```

읽는 법:

```text
filteredTodos 배열의 각 todo마다
TodoRow 컴포넌트를 하나씩 만든다.
```

`index`는 현재 요소의 순서입니다.

## key

리스트 렌더링에서는 `key`가 중요합니다.

```tsx
<TodoRow key={todo.id} todo={todo} />
```

`key`는 React가 "이 항목이 이전 렌더링의 어떤 항목과 같은지" 구분하는 값입니다.

보통 서버에서 받은 고유 id를 사용합니다.

```text
좋음: key={todo.id}
주의: key={index}
```

순서가 바뀔 수 있는 목록에서 index를 key로 쓰면 UI 상태가 엉킬 수 있습니다.

## 빈 상태 렌더링

리스트가 비어 있을 때 다른 UI를 보여주는 패턴도 자주 나옵니다.

```tsx
{filteredTodos.length > 0 ? (
  filteredTodos.map((todo) => <TodoRow key={todo.id} todo={todo} />)
) : (
  <View style={styles.emptyFilterState}>
    <Text>표시할 투두가 없어요</Text>
  </View>
)}
```

뜻:

```text
filteredTodos가 있으면 목록을 그리고,
없으면 빈 상태 UI를 그린다.
```

메인 화면의 투두 목록에서 이 패턴을 볼 수 있습니다.

## 이벤트 핸들러

터치 이벤트는 보통 `onPress` prop에 함수를 넘깁니다.

```tsx
<Pressable onPress={onMovePast}>
  <Text>‹</Text>
</Pressable>
```

함수에 값을 넘겨야 할 때는 화살표 함수로 감쌉니다.

```tsx
<Pressable onPress={() => onSetFilter(option.key)}>
  <Text>{option.label}</Text>
</Pressable>
```

주의할 점:

```tsx
onPress={onSetFilter(option.key)}
```

이렇게 쓰면 렌더링 중에 함수가 바로 실행됩니다. 사용자가 눌렀을 때 실행하려면 `() => ...`로 감싸야 합니다.

## disabled

버튼을 비활성화할 때는 `disabled` prop을 사용합니다.

```tsx
<Pressable
  disabled={!canGoPast}
  onPress={onMovePast}
>
  <Text>‹</Text>
</Pressable>
```

보통 비활성화 상태에서는 style도 같이 바꿉니다.

```tsx
style={[styles.dateArrow, !canGoPast ? styles.dateArrowDisabled : undefined]}
```

## style prop

React Native에서는 `style` prop에 스타일 객체를 넘깁니다.

```tsx
<Text style={styles.title}>제목</Text>
```

스타일은 보통 아래쪽에 `StyleSheet.create`로 정의합니다.

```tsx
const styles = StyleSheet.create({
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
```

화면 단위 스타일은 `styles.ts` 파일로 분리하기도 하고, 작은 컴포넌트는 같은 파일 아래쪽에 둘 수도 있습니다.

## 스타일 배열

여러 스타일을 합칠 때는 배열을 씁니다.

```tsx
<Text style={[styles.todoContent, isDimmed ? styles.todoDimmed : undefined]}>
  {todo.content}
</Text>
```

읽는 법:

```text
기본으로 todoContent 스타일을 적용하고,
isDimmed가 true이면 todoDimmed 스타일도 추가한다.
```

뒤쪽 스타일이 앞쪽 스타일을 덮어쓸 수 있습니다.

```tsx
style={[
  styles.filterButton,
  active ? { backgroundColor: option.color, borderColor: option.color } : undefined,
]}
```

객체를 직접 넣어 동적 스타일을 만들 수도 있습니다.

## Fragment

Fragment는 실제 native view를 만들지 않고 JSX 여러 개를 묶습니다.

```tsx
return (
  <>
    <Text>A</Text>
    <Text>B</Text>
  </>
);
```

`MainHeader`처럼 여러 블록을 부모에게 그대로 넘기고 싶을 때 사용합니다.

만약 layout 스타일을 적용해야 한다면 Fragment가 아니라 `View`를 써야 합니다.

## 컴포넌트 분리

Dogether RN에서는 화면이 너무 커지지 않도록 하위 컴포넌트로 나눕니다.

메인 화면 예:

```text
MainScreen
├── MainHeader
├── MainPanel
│   └── TodoRow
├── GroupSelectBottomSheet
└── ReviewToast
```

분리 기준은 대체로 다음과 같습니다.

| 기준 | 예시 |
| --- | --- |
| 반복되는 UI | `TodoRow` |
| 화면 안의 큰 영역 | `MainHeader`, `MainPanel` |
| 공통으로 쓰는 UI | `Screen`, `AppAlertModal` |
| 특정 기능의 단계 | `GroupCreateStepOne`, `GroupCreateStepTwo` |

부모 컴포넌트는 데이터와 이벤트를 내려주고, 자식 컴포넌트는 UI를 그립니다.

## 공통 컴포넌트 읽는 법

공통 컴포넌트는 `src/components`에 있습니다.

예: `Screen`

```tsx
type Props = {
  children: ReactNode;
  scroll?: boolean;
};
```

이 컴포넌트를 읽을 때는 아래 순서가 좋습니다.

```text
1. Props 타입을 본다.
2. children을 어떻게 배치하는지 본다.
3. 조건부 렌더링이 있는지 본다.
4. style이 어떤 역할을 하는지 본다.
```

`Screen`은 모든 화면의 기본 배경, SafeArea, padding, scroll 여부를 통일하는 역할입니다.

## 화면 컴포넌트 읽는 법

화면 컴포넌트는 `src/screens` 아래에 있습니다.

예: `MainScreen`

읽는 순서:

```text
1. import를 본다.
   -> 어떤 컴포넌트, hook, store를 쓰는지 확인

2. use... hook 호출을 본다.
   -> 화면 데이터와 이벤트가 어디서 오는지 확인

3. useState를 본다.
   -> 화면 내부에서만 쓰는 상태 확인

4. error/empty/loading 분기를 본다.
   -> 정상 화면 전에 빠지는 조건 확인

5. return JSX를 위에서 아래로 본다.
   -> 실제 화면 구조 확인
```

`MainScreen`은 먼저 `useMainScreen()`으로 화면에 필요한 값을 가져오고, error 상태를 먼저 처리한 뒤, 정상 화면을 렌더링합니다.

## 하위 컴포넌트 읽는 법

하위 컴포넌트는 보통 props 중심으로 읽습니다.

예: `TodoRow`

```text
1. Props 타입을 본다.
2. props를 구조 분해하는 부분을 본다.
3. 파생 상태를 본다.
   -> uncertified, accent 등
4. 이벤트 핸들러를 본다.
   -> handleOpenViewer, handleGoCertify
5. return JSX를 본다.
6. styles를 본다.
```

`TodoRow`는 투두 하나를 보여주고, 상태에 따라 인증하기 버튼 또는 상세 이동 UI를 보여줍니다.

## Modal 컴포넌트 읽는 법

`AppAlertModal`은 공통 alert modal입니다.

```tsx
<Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
  <View style={styles.overlay}>
    <View style={styles.card}>
      ...
    </View>
  </View>
</Modal>
```

구조:

```text
Modal
└── overlay
    └── card
        ├── icon
        ├── title
        ├── message
        └── actions
```

`visible`이 true이면 보이고, false이면 숨겨집니다.

확인 버튼은 `onConfirm`이 있으면 `onConfirm`을 실행하고, 없으면 `onClose`를 실행합니다.

## 입력 컴포넌트 읽는 법

`TextInput`은 입력값과 변경 함수를 같이 봐야 합니다.

```tsx
<TextInput
  value={groupName}
  onChangeText={(text) => onChangeGroupName(text.slice(0, 20))}
  placeholder="멋진 그룹명으로 동기부여를 해보세요 !"
  style={[styles.input, isFocused ? styles.inputFocused : undefined]}
/>
```

읽는 법:

| prop | 의미 |
| --- | --- |
| `value` | 현재 입력값 |
| `onChangeText` | 텍스트가 바뀔 때 실행 |
| `placeholder` | 비어 있을 때 안내 문구 |
| `placeholderTextColor` | placeholder 색상 |
| `style` | 입력창 스타일 |

`text.slice(0, 20)`은 입력을 20자까지만 허용하기 위한 처리입니다.

## 주석 MARK 읽는 법

이 프로젝트의 화면 파일에는 이런 주석이 자주 있습니다.

```tsx
// MARK: - Render
// MARK: - Derived state
// MARK: - Styles
```

Swift 파일의 `// MARK:`처럼 읽는 구간을 나누기 위한 주석입니다.

처음 보는 컴포넌트는 MARK를 기준으로 훑으면 구조가 빨리 잡힙니다.

## JSX 안에서 길을 잃지 않는 법

JSX가 길어지면 괄호와 중괄호가 많아서 헷갈릴 수 있습니다.

그럴 때는 아래 순서로 보면 됩니다.

```text
1. 가장 바깥 태그를 찾는다.
2. 큰 자식 컴포넌트 이름만 먼저 본다.
3. 조건부 렌더링을 접어두고 정상 상태만 본다.
4. map으로 반복되는 부분을 찾는다.
5. 이벤트 핸들러 이름을 보고 행동을 추측한다.
6. props 타입으로 입력값의 의미를 확인한다.
```

처음부터 모든 style 값을 읽으려고 하지 않아도 됩니다. 먼저 tree와 데이터 흐름을 잡고, 그다음 layout/style을 보면 됩니다.

## Dogether RN에서 자주 보는 패턴

### 화면 wrapper

```tsx
<Screen>
  ...
</Screen>
```

SafeArea, 배경색, padding을 통일합니다.

### 조건별 본문

```tsx
{sheetStatus === 'createTodo' ? <CreateTodoState /> : null}
```

현재 화면 상태에 따라 특정 UI만 보여줍니다.

### 리스트

```tsx
{filteredTodos.map((todo) => (
  <TodoRow key={todo.id} todo={todo} />
))}
```

배열 데이터를 UI 목록으로 바꿉니다.

### 동적 스타일

```tsx
style={[styles.button, active ? styles.activeButton : undefined]}
```

상태에 따라 스타일을 추가합니다.

### 이벤트 callback

```tsx
onPress={() => router.push('/todo-write')}
```

사용자가 눌렀을 때 화면 이동이나 상태 변경을 실행합니다.

## 한 줄 요약

```text
JSX는 현재 상태를 UI tree로 표현하는 문법이고,
컴포넌트는 props를 받아 JSX를 반환하며,
조건부 렌더링은 특정 상태의 UI를 고르고,
map은 배열을 UI 목록으로 바꾸고,
style 배열은 상태에 맞는 모양을 조합한다.
```
