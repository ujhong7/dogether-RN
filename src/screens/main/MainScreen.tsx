// MARK: - 메인 Screen
//
// 역할: 메인 화면 UI를 그리고, useMainScreen hook에서 받은 상태/이벤트를 컴포넌트에 연결합니다.
// 읽는 법: "hook 입력값 -> error state -> normal render -> bottom sheet/toast" 순서로 보면 됩니다.

import { useState } from 'react';
import { router } from 'expo-router';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { QueryErrorState } from '../../components/QueryErrorState';
import { useMainScreen } from '../../hooks/useMainScreen';
import { useGroupSelection } from '../../hooks/useGroupSelection';
import { selectPreferredError } from '../../services/errors/appError';
import { useMainStore } from '../../stores/mainStore';
import { getProgressMeta } from './utils';
import { MainHeader } from './components/MainHeader';
import { MainPanel } from './components/MainPanel';
import { ReviewToast } from './components/ReviewToast';

// import는 다른 파일/라이브러리에서 필요한 값을 가져오는 문법입니다.
// 예: import { router } from 'expo-router'는 expo-router 패키지에서 화면 이동용 router 객체를 가져옵니다.
// 예: import { Screen } from '../../components/Screen'은 프로젝트 내부 공통 컴포넌트를 상대 경로로 가져옵니다.
//
// MainScreen.tsx는 실제 메인 화면 컴포넌트입니다.
// 화면별 폴더를 index.ts / styles.ts / XxxScreen.tsx로 나누는 이유는 역할 분리입니다.
// - index.ts: 이 폴더 밖으로 무엇을 공개할지 정하는 출입구
// - styles.ts: 화면 스타일 상수 모음
// - MainScreen.tsx: state, 이벤트, JSX를 조합하는 실제 화면
export function MainScreen() {
  // MARK: - Hook state
  //
  // 화면에서 필요한 서버 상태와 파생값을 custom hook으로 분리해 JSX를 읽기 쉽게 유지합니다.
  const {
    groupsQuery,
    todosQuery,
    currentGroup,
    filteredTodos,
    visibleTodos,
    dateOffset,
    queryDate,
    filter,
    formattedDate,
    canGoPast,
    canGoFuture,
    sheetStatus,
    activeFilterEmptyText,
  } = useMainScreen();

  // MARK: - Store actions and local UI state
  //
  // 버튼/시트 이벤트에서 사용할 action과 화면 내부 modal 표시 상태입니다.
  const movePast = useMainStore((state) => state.movePast);
  const moveFuture = useMainStore((state) => state.moveFuture);
  const setFilter = useMainStore((state) => state.setFilter);
  const [groupSheetVisible, setGroupSheetVisible] = useState(false);
  const progressMeta = getProgressMeta(currentGroup);
  const { selectGroup: handleSelectGroup } = useGroupSelection();

  // MARK: - Error state
  //
  // 그룹/투두 query 중 하나라도 실패하면 정상 화면 대신 공통 에러 UI를 먼저 렌더링합니다.
  if (groupsQuery.isError || todosQuery.isError) {
    return (
      <QueryErrorState
        error={selectPreferredError(groupsQuery.error, todosQuery.error)}
        onRetry={() => {
          if (groupsQuery.isError) {
            void groupsQuery.refetch();
          }
          if (todosQuery.isError) {
            void todosQuery.refetch();
          }
        }}
      />
    );
  }

  // MARK: - Normal render
  //
  // 정상 상태에서는 Header, MainPanel, 그룹 선택 BottomSheet, ReviewToast 순서로 화면을 구성합니다.
  return (
    <Screen>
      <MainHeader
        group={currentGroup}
        dayLabel={progressMeta.dayLabel}
        progressPercent={progressMeta.progressPercent}
        // 그룹 이름을 누르면 하단 그룹 선택 시트가 열립니다.
        onPressGroupName={() => setGroupSheetVisible(true)}
      />

      <MainPanel
        // MainPanel은 현재 날짜/필터/투두 상태에 맞춰 투두 작성, 인증, 목록 화면을 바꿔 보여줍니다.
        sheetStatus={sheetStatus}
        filter={filter}
        formattedDate={formattedDate}
        canGoPast={canGoPast}
        canGoFuture={canGoFuture}
        visibleTodos={visibleTodos}
        filteredTodos={filteredTodos}
        dateOffset={dateOffset}
        currentGroupId={currentGroup?.id}
        queryDate={queryDate}
        activeFilterEmptyText={activeFilterEmptyText}
        onMovePast={movePast}
        onMoveFuture={moveFuture}
        onSetFilter={setFilter}
      />

      <GroupSelectBottomSheet
        // iOS의 action sheet/bottom sheet와 비슷한 역할의 그룹 선택 UI입니다.
        visible={groupSheetVisible}
        groups={groupsQuery.data ?? []}
        currentGroupId={currentGroup?.id}
        onClose={() => setGroupSheetVisible(false)}
        onSelectGroup={handleSelectGroup}
        footerAction={{
          label: '새 그룹 추가하기',
          icon: '⊕',
          onPress: () => {
            router.push('/group-add');
          },
        }}
      />

      <ReviewToast />
    </Screen>
  );
}
