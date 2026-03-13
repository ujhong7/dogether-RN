import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { useMainScreen } from '../../hooks/useMainScreen';
import { toAppError } from '../../services/errors/appError';
import { useMainStore } from '../../stores/mainStore';
import { useReviewToastStore } from '../../stores/reviewToastStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getProgressMeta } from './utils';
import { MainHeader } from './components/MainHeader';
import { MainPanel } from './components/MainPanel';
import { mainStyles as styles } from './styles';

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
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const movePast = useMainStore((state) => state.movePast);
  const moveFuture = useMainStore((state) => state.moveFuture);
  const setFilter = useMainStore((state) => state.setFilter);
  const [groupSheetVisible, setGroupSheetVisible] = useState(false);
  const logout = useSessionStore((state) => state.logout);
  const toastMessage = useReviewToastStore((state) => state.message);
  const clearToast = useReviewToastStore((state) => state.clearToast);
  const progressMeta = getProgressMeta(currentGroup);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      clearToast();
    }, 2200);

    return () => clearTimeout(timeout);
  }, [clearToast, toastMessage]);

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
        onSelectGroup={setSelectedGroupId}
        footerAction={{
          label: '새 그룹 추가하기',
          icon: '⊕',
          onPress: () => {
            router.push('/group-add');
          },
        }}
      />

      {toastMessage ? (
        <View style={styles.reviewToast}>
          <Text style={styles.reviewToastIcon}>✓</Text>
          <Text style={styles.reviewToastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </Screen>
  );
}
