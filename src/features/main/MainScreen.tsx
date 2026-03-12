import { useState } from 'react';
import { Screen } from '../../components/Screen';
import { useMainScreen } from './useMainScreen';
import { useMainStore } from '../../store/mainStore';
import { getProgressMeta } from './utils';
import { MainHeader } from './components/MainHeader';
import { MainPanel } from './components/MainPanel';
import { GroupSelectSheet } from './components/GroupSelectSheet';

export function MainScreen() {
  const {
    groupsQuery,
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
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const movePast = useMainStore((state) => state.movePast);
  const moveFuture = useMainStore((state) => state.moveFuture);
  const setFilter = useMainStore((state) => state.setFilter);
  const [groupSheetVisible, setGroupSheetVisible] = useState(false);
  const progressMeta = getProgressMeta(currentGroup);

  return (
    <Screen>
      <MainHeader
        group={currentGroup}
        dayLabel={progressMeta.dayLabel}
        progressPercent={progressMeta.progressPercent}
        onPressGroupName={() => setGroupSheetVisible(true)}
      />

      <MainPanel
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

      <GroupSelectSheet
        visible={groupSheetVisible}
        groups={groupsQuery.data ?? []}
        currentGroupId={currentGroup?.id}
        onClose={() => setGroupSheetVisible(false)}
        onSelectGroup={setSelectedGroupId}
      />
    </Screen>
  );
}
