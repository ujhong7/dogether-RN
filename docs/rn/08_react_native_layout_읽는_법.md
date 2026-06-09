# React Native Layout 읽는 법

이 문서는 Dogether RN 프로젝트에서 React Native layout과 `StyleSheet`를 읽는 방법을 정리한 문서입니다.

React Native는 웹 CSS와 비슷한 속성을 쓰지만, 실제로는 JavaScript 객체로 스타일을 작성하고 Flexbox로 layout을 계산합니다.

## RN layout을 읽는 기본 감각

React Native 화면은 컴포넌트 tree와 style 객체의 조합입니다.

```tsx
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>
```

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0B1020',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '800',
  },
});
```

구조와 스타일을 나눠서 읽으면 쉽습니다.

```text
JSX
  -> 어떤 UI가 어떤 부모-자식 구조로 놓이는가?

StyleSheet
  -> 각 UI가 어떤 크기, 방향, 여백, 색상을 갖는가?
```

## RN 스타일과 CSS의 차이

RN 스타일은 CSS와 비슷하지만 완전히 같지는 않습니다.

| 구분 | 웹 CSS | React Native |
| --- | --- | --- |
| 작성 방식 | CSS 파일, class | JavaScript 객체 |
| 속성 이름 | `background-color` | `backgroundColor` |
| 숫자 단위 | `16px` | `16` |
| 기본 layout | block/inline 흐름 | Flexbox |
| 기본 flex 방향 | 보통 row 감각 | `column` |
| 텍스트 스타일 | 상속 많음 | `Text`에 직접 지정 |

예:

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2B31',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
```

숫자 `16`은 px 문자열이 아니라 RN의 density-independent point 값입니다. iOS의 point와 비슷하게 생각하면 됩니다.

## StyleSheet.create

스타일은 보통 `StyleSheet.create`로 만듭니다.

```tsx
import { StyleSheet } from 'react-native';

export const mainStyles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#1E1F24',
    borderRadius: 14,
    padding: 12,
  },
});
```

`StyleSheet.create`를 쓰면 스타일 이름을 한곳에 모을 수 있고, TypeScript가 속성 오타를 어느 정도 잡아줍니다.

## 스타일 파일 위치

Dogether RN은 스타일을 두 방식으로 둡니다.

| 방식 | 위치 | 예시 |
| --- | --- | --- |
| 화면 전용 스타일 파일 | `src/screens/.../styles.ts` | `src/screens/main/styles.ts` |
| 작은 컴포넌트 내부 스타일 | 컴포넌트 파일 하단 | `TodoRow.tsx`, `MainHeader.tsx` |
| 공통 색상 | `src/theme/colors.ts` | `colors.primary`, `colors.text` |

큰 화면은 `styles.ts`로 분리하고, 재사용 범위가 작은 컴포넌트는 같은 파일 아래에 `StyleSheet.create`를 두는 패턴입니다.

## 공통 색상

공통 색상은 `src/theme/colors.ts`에 있습니다.

```ts
export const colors = {
  bg: '#0B1020',
  surface: '#111827',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  primary: '#5B9DF0',
  border: '#374151',
};
```

화면에서는 이렇게 사용합니다.

```tsx
color: colors.text,
backgroundColor: colors.primary,
borderColor: colors.border,
```

색상이 하드코딩되어 있으면 해당 화면 전용 색상이고, `colors.*`를 쓰면 프로젝트 공통 토큰이라고 보면 됩니다.

## View

`View`는 가장 기본적인 layout 컨테이너입니다.

```tsx
<View style={styles.panel}>
  ...
</View>
```

iOS의 `UIView`와 비슷합니다.

`View`는 자식을 담고, Flexbox로 배치합니다.

```tsx
panel: {
  flex: 1,
  backgroundColor: '#1E1F24',
  borderRadius: 14,
  padding: 12,
}
```

읽는 법:

```text
남은 공간을 차지하고,
어두운 배경과 둥근 모서리를 가지며,
안쪽 여백은 12다.
```

## Text

텍스트는 반드시 `Text` 컴포넌트 안에 있어야 합니다.

```tsx
<Text style={styles.dateTitle}>{formattedDate}</Text>
```

텍스트 스타일은 `Text`에 직접 지정합니다.

```tsx
dateTitle: {
  color: colors.text,
  fontSize: 16,
  fontWeight: '800',
}
```

React Native에서는 일반 `View`에 `fontSize`나 `color`를 넣어도 자식 `Text`에 자동 상속된다고 기대하면 안 됩니다.

## ScrollView

`ScrollView`는 내용이 화면보다 길 때 스크롤하게 합니다.

```tsx
<ScrollView
  style={styles.todoListScroll}
  contentContainerStyle={styles.todoListContent}
  showsVerticalScrollIndicator={false}
>
  ...
</ScrollView>
```

읽을 때는 `style`과 `contentContainerStyle`을 구분해야 합니다.

| prop | 의미 |
| --- | --- |
| `style` | ScrollView 자체의 크기와 위치 |
| `contentContainerStyle` | ScrollView 안쪽 콘텐츠의 여백과 간격 |

예:

```tsx
todoListScroll: {
  flex: 1,
},
todoListContent: {
  gap: 10,
  paddingBottom: 8,
},
```

뜻:

```text
스크롤 영역은 남은 공간을 차지하고,
안쪽 아이템들은 10 간격으로 배치하며,
아래쪽 여백은 8이다.
```

## SafeArea

모바일에는 노치, 상태바, 홈 인디케이터가 있습니다.

Dogether RN은 공통 `Screen` 컴포넌트에서 `SafeAreaView`를 사용합니다.

```tsx
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

구조:

```text
Screen
└── SafeAreaView
    └── View or ScrollView
        └── children
```

모든 화면이 `Screen`을 사용하면 안전 영역, 배경색, 기본 padding을 통일할 수 있습니다.

## Flexbox 기본

React Native layout은 Flexbox가 기본입니다.

중요한 차이:

```text
React Native의 기본 flexDirection은 column이다.
```

즉 자식은 기본적으로 위에서 아래로 쌓입니다.

```tsx
<View>
  <Text>A</Text>
  <Text>B</Text>
</View>
```

구조:

```text
A
B
```

가로로 배치하려면 `flexDirection: 'row'`를 지정합니다.

```tsx
dateHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
```

## flex

`flex: 1`은 가능한 남은 공간을 차지한다는 뜻입니다.

```tsx
panel: {
  flex: 1,
}
```

부모 안에서 남은 영역을 채웁니다.

메인 화면의 `panel`, 투두 목록의 `todoSection`, `todoListScroll`처럼 화면 안에서 길게 늘어나야 하는 영역에 자주 씁니다.

```tsx
todoSection: {
  flex: 1,
  gap: 10,
},
todoListScroll: {
  flex: 1,
},
```

읽는 법:

```text
todoSection은 panel 안의 남은 공간을 차지하고,
그 안의 ScrollView도 남은 공간을 차지한다.
```

## flexDirection

`flexDirection`은 자식 배치 방향입니다.

| 값 | 의미 |
| --- | --- |
| `column` | 위에서 아래. RN 기본값 |
| `row` | 왼쪽에서 오른쪽 |

예:

```tsx
dateHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}
```

날짜 이동 헤더는 왼쪽 화살표, 날짜, 오른쪽 화살표가 가로로 배치됩니다.

```text
[‹]      5월 27일      [›]
```

## justifyContent와 alignItems

Flexbox에는 주축과 교차축이 있습니다.

`flexDirection: 'column'`일 때:

| 속성 | 방향 |
| --- | --- |
| `justifyContent` | 세로 방향 |
| `alignItems` | 가로 방향 |

`flexDirection: 'row'`일 때:

| 속성 | 방향 |
| --- | --- |
| `justifyContent` | 가로 방향 |
| `alignItems` | 세로 방향 |

예:

```tsx
centerState: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
}
```

기본 `column` 방향이므로:

```text
justifyContent: center -> 세로 가운데
alignItems: center -> 가로 가운데
```

## gap

`gap`은 자식 사이 간격입니다.

```tsx
filterRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
}
```

뜻:

```text
필터 버튼들을 가로로 배치하고,
줄바꿈을 허용하며,
버튼 사이 간격은 8이다.
```

예전 RN에서는 `gap` 지원이 제한적이었지만, 이 프로젝트의 RN 버전에서는 사용할 수 있습니다.

## padding과 margin

`padding`은 안쪽 여백, `margin`은 바깥 여백입니다.

```tsx
panel: {
  padding: 12,
}
```

```tsx
primaryAction: {
  marginTop: 22,
  paddingVertical: 14,
}
```

자주 보는 축약:

| 속성 | 의미 |
| --- | --- |
| `padding` | 상하좌우 안쪽 여백 |
| `paddingHorizontal` | 좌우 안쪽 여백 |
| `paddingVertical` | 상하 안쪽 여백 |
| `margin` | 상하좌우 바깥 여백 |
| `marginHorizontal` | 좌우 바깥 여백 |
| `marginVertical` | 상하 바깥 여백 |

## width와 height

크기는 숫자 또는 문자열 비율로 지정합니다.

```tsx
dateArrow: {
  width: 28,
  height: 28,
}
```

```tsx
imageBox: {
  width: '100%',
  aspectRatio: 1,
}
```

`width: '100%'`는 부모 너비를 채운다는 뜻입니다.

`aspectRatio: 1`은 너비와 높이 비율을 1:1로 맞춘다는 뜻입니다. 인증 사진 박스처럼 정사각형이 필요한 UI에 유용합니다.

## minHeight와 maxWidth

최소/최대 크기를 지정할 수 있습니다.

```tsx
emptyFilterState: {
  minHeight: 280,
}
```

```tsx
card: {
  width: '100%',
  maxWidth: 340,
}
```

내용이 적어도 최소 높이를 유지하거나, 큰 화면에서 너무 넓어지지 않게 할 때 사용합니다.

## border와 borderRadius

테두리와 둥근 모서리는 아래처럼 지정합니다.

```tsx
imageBox: {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  overflow: 'hidden',
}
```

`overflow: 'hidden'`은 둥근 모서리 바깥으로 자식이 삐져나오지 않게 합니다.

인증 사진처럼 이미지가 박스 안에 꽉 차는 UI에서는 중요합니다.

## backgroundColor와 opacity

배경색은 `backgroundColor`입니다.

```tsx
footerButton: {
  backgroundColor: colors.primary,
}
```

비활성화 상태는 별도 스타일로 덮어씁니다.

```tsx
footerButtonDisabled: {
  backgroundColor: '#5B6475',
}
```

투명도는 `opacity`로 줄 수 있습니다.

```tsx
dateArrowDisabled: {
  opacity: 0.35,
}
```

## position

기본 위치는 normal flow입니다. 겹치거나 특정 위치에 고정하려면 `position: 'absolute'`를 사용합니다.

예:

```tsx
textCounter: {
  position: 'absolute',
  right: 14,
  bottom: 12,
}
```

인증 내용 입력창의 글자 수 카운터를 입력창 오른쪽 아래에 올리는 스타일입니다.

읽는 법:

```text
부모 기준 오른쪽 14, 아래 12 위치에 배치한다.
```

부모가 `position: 'relative'`를 명시하지 않아도 RN의 기본값이 relative라서 일반적으로 부모 기준으로 잡힙니다.

## marginTop: 'auto'

RN에서도 일부 layout에서 `'auto'`를 사용할 수 있습니다.

```tsx
footerButton: {
  marginTop: 'auto',
}
```

인증 화면의 footer 버튼을 아래쪽으로 밀어내는 역할입니다.

읽는 법:

```text
위쪽 가능한 여백을 자동으로 차지해서 버튼을 하단 쪽으로 보낸다.
```

## KeyboardAvoidingView

입력 화면에서는 키보드가 UI를 가리지 않도록 `KeyboardAvoidingView`를 사용합니다.

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={styles.flex}
>
  ...
</KeyboardAvoidingView>
```

iOS에서는 키보드가 올라올 때 padding을 조정하고, Android에서는 기본 동작을 사용합니다.

`Platform.OS`로 iOS/Android 차이를 처리하는 예입니다.

## Style 배열

상태에 따라 스타일을 추가할 때 배열을 씁니다.

```tsx
style={[styles.footerButton, !canSubmit ? styles.footerButtonDisabled : undefined]}
```

읽는 법:

```text
기본 footerButton 스타일을 적용하고,
canSubmit이 false이면 footerButtonDisabled를 추가한다.
```

뒤쪽 스타일이 앞쪽 스타일을 덮어쓸 수 있습니다.

```tsx
style={[
  styles.filterButton,
  active ? { backgroundColor: option.color, borderColor: option.color } : undefined,
]}
```

이 코드는 active일 때 배경색과 border 색상을 동적으로 바꿉니다.

## 화면별 styles.ts 읽는 법

`styles.ts`는 JSX 순서와 style key 이름을 맞춰 읽으면 쉽습니다.

예: `MainPanel`

```text
MainPanel JSX
  -> styles.panel
  -> styles.dateHeader
  -> styles.filterRow
  -> styles.centerState
  -> styles.todoSection
  -> styles.addTodoInline
```

`src/screens/main/styles.ts`도 비슷한 순서로 key가 배치되어 있습니다.

```text
panel
dateHeader
dateArrow
filterRow
filterButton
centerState
todoSection
todoListScroll
addTodoInline
```

컴포넌트에서 `style={styles.someName}`을 발견하면, 같은 화면의 `styles.ts` 또는 컴포넌트 하단 `StyleSheet.create`에서 `someName`을 찾으면 됩니다.

## MainPanel layout 읽기

`MainPanel`은 메인 화면 하단의 큰 패널입니다.

단순화하면:

```text
panel
├── dateHeader
├── filterRow
├── centerState or todoSection
└── addTodoInline
```

주요 스타일:

```tsx
panel: {
  flex: 1,
  backgroundColor: '#1E1F24',
  borderRadius: 14,
  padding: 12,
  minHeight: 0,
}
```

`minHeight: 0`은 flex 자식 안에서 ScrollView가 너무 커져 부모를 밀어내는 문제를 줄일 때 유용합니다.

```tsx
todoSection: {
  flex: 1,
  gap: 10,
}
```

투두 영역은 패널 안에서 남은 공간을 차지합니다.

## 인증 화면 layout 읽기

인증 사진 화면은 다음 구조입니다.

```text
Screen
└── KeyboardAvoidingView
    ├── CertificationHeader
    ├── imageBox
    ├── todoTitle
    ├── actionRow
    └── footerButton
```

주요 스타일:

```tsx
imageBox: {
  width: '100%',
  aspectRatio: 1,
  borderRadius: 12,
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
}
```

읽는 법:

```text
부모 너비를 꽉 채우는 정사각형 박스이고,
둥근 모서리와 border가 있으며,
안의 placeholder나 이미지를 가운데 배치한다.
```

## TextInput layout 읽기

인증 내용 입력창은 `TextInput`입니다.

```tsx
textArea: {
  minHeight: 116,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surface,
  paddingHorizontal: 14,
  paddingVertical: 14,
  color: colors.text,
  fontSize: 15,
  textAlignVertical: 'top',
}
```

`textAlignVertical: 'top'`은 Android에서 multiline 입력 텍스트를 위쪽부터 시작하게 하는 데 중요합니다.

focus 상태에서는 border 색상만 바꿉니다.

```tsx
textAreaFocused: {
  borderColor: colors.primary,
}
```

## Modal layout 읽기

모달은 보통 backdrop과 card 구조입니다.

```text
modalBackdrop
└── modalCard
    ├── modalIcon
    ├── modalTitle
    ├── modalDescription
    └── modalActions
```

주요 스타일:

```tsx
modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 24,
}
```

읽는 법:

```text
화면 전체를 덮고,
반투명 검정 배경을 깔고,
카드를 화면 가운데 배치한다.
```

## 레이아웃을 읽는 순서

처음 보는 화면은 아래 순서로 보면 좋습니다.

```text
1. JSX tree를 먼저 본다.
   -> 어떤 컴포넌트가 어떤 순서로 놓이는지 확인

2. 가장 바깥 wrapper style을 본다.
   -> flex, padding, background 확인

3. 큰 section style을 본다.
   -> header, body, footer 영역 확인

4. row/column 방향을 본다.
   -> flexDirection 확인

5. 정렬을 본다.
   -> alignItems, justifyContent 확인

6. 여백을 본다.
   -> gap, padding, margin 확인

7. 상태별 style 배열을 본다.
   -> disabled, focused, active 스타일 확인

8. absolute position을 찾는다.
   -> overlay, counter, toast처럼 흐름 밖에 놓인 UI 확인
```

## 자주 헷갈리는 점

### Text 스타일은 View에 주지 않는다

`color`, `fontSize`, `fontWeight`는 `Text`에 직접 지정합니다.

### row에서 justifyContent와 alignItems 방향이 바뀐다

`flexDirection: 'row'`이면 `justifyContent`는 가로, `alignItems`는 세로입니다.

### ScrollView의 style과 contentContainerStyle은 다르다

스크롤 영역 자체는 `style`, 안쪽 콘텐츠 간격은 `contentContainerStyle`입니다.

### `flex: 1`이 항상 전체 화면은 아니다

`flex: 1`은 부모 안에서 남은 공간을 차지한다는 뜻입니다. 부모가 작으면 자식도 그 안에서만 커집니다.

### style 배열에서 뒤쪽이 이긴다

```tsx
[styles.button, disabled ? styles.disabled : undefined]
```

`disabled` 스타일이 같은 속성을 가지고 있으면 기본 button 스타일을 덮어씁니다.

## Dogether RN에서 자주 보는 패턴

### 화면 wrapper

```tsx
<Screen>
  ...
</Screen>
```

SafeArea, 배경, 기본 padding을 통일합니다.

### 가로 row

```tsx
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
```

헤더, 날짜 이동, 버튼 row에서 자주 보입니다.

### 가운데 빈 상태

```tsx
alignItems: 'center',
justifyContent: 'center',
textAlign: 'center',
```

empty state, 완료 상태, 안내 화면에 자주 보입니다.

### 하단 버튼

```tsx
minHeight: 52,
borderRadius: 10,
alignItems: 'center',
justifyContent: 'center',
marginTop: 'auto',
```

입력 화면의 footer 버튼 패턴입니다.

### 비활성화 스타일

```tsx
style={[styles.footerButton, !canSubmit ? styles.footerButtonDisabled : undefined]}
disabled={!canSubmit}
```

동작 비활성화와 시각적 비활성화를 같이 처리합니다.

## 한 줄 요약

```text
React Native layout은 JSX tree와 StyleSheet를 함께 읽어야 하고,
View는 컨테이너, Text는 텍스트, ScrollView는 스크롤 영역이며,
Flexbox의 flexDirection, alignItems, justifyContent, gap, padding을 보면
화면이 어떤 방향과 간격으로 배치되는지 이해할 수 있다.
```
