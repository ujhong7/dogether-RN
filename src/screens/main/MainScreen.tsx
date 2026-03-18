import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { useMainScreen } from '../../hooks/useMainScreen';
import { useGroupSelection } from '../../hooks/useGroupSelection';
import { toAppError } from '../../services/errors/appError';
import { useMainStore } from '../../stores/mainStore';
import { useReviewToastStore } from '../../stores/reviewToastStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';
import { getProgressMeta } from './utils';
import { MainHeader } from './components/MainHeader';
import { MainPanel } from './components/MainPanel';

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
  const toastMessage = useReviewToastStore((state) => state.message);
  const clearToast = useReviewToastStore((state) => state.clearToast);
  const progressMeta = getProgressMeta(currentGroup);
  const { selectGroup: handleSelectGroup } = useGroupSelection();

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
        onSelectGroup={handleSelectGroup}
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

const styles = StyleSheet.create({
  reviewToast: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 32,
    borderRadius: 14,
    backgroundColor: '#2A2F3A',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewToastIcon: {
    color: '#7FC0FF',
    fontSize: 16,
    fontWeight: '900',
  },
  reviewToastText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
