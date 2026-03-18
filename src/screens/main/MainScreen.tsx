import { useState } from 'react';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { useMainScreen } from '../../hooks/useMainScreen';
import { useGroupSelection } from '../../hooks/useGroupSelection';
import { toAppError } from '../../services/errors/appError';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getProgressMeta } from './utils';
import { MainHeader } from './components/MainHeader';
import { MainPanel } from './components/MainPanel';
import { ReviewToast } from './components/ReviewToast';

export function MainScreen() {
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
  const movePast = useMainStore((state) => state.movePast);
  const moveFuture = useMainStore((state) => state.moveFuture);
  const setFilter = useMainStore((state) => state.setFilter);
  const [groupSheetVisible, setGroupSheetVisible] = useState(false);
  const logout = useSessionStore((state) => state.logout);
  const progressMeta = getProgressMeta(currentGroup);
  const { selectGroup: handleSelectGroup } = useGroupSelection();

  if (groupsQuery.isError || todosQuery.isError) {
    const appError = toAppError(groupsQuery.error ?? todosQuery.error);

    if (appError.variant === 'alert') {
      return (
        <Screen>
          <AppAlertModal
            visible
            error={appError}
            onClose={() => {
              logout();
              router.replace('/onboarding');
            }}
          />
        </Screen>
      );
    }

    return (
      <Screen>
        <FullScreenErrorState
          title={appError.title}
          message={appError.message}
          actionLabel={appError.actionLabel}
          onRetry={() => {
            if (groupsQuery.isError) {
              void groupsQuery.refetch();
            }
            if (todosQuery.isError) {
              void todosQuery.refetch();
            }
          }}
        />
      </Screen>
    );
  }

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

      <GroupSelectBottomSheet
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
