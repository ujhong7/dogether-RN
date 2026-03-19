import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useGroupManagementScreen } from '../../hooks/useGroupManagementScreen';
import { toAppError } from '../../services/errors/appError';
import { useSessionStore } from '../../stores/sessionStore';
import { GroupManagementCard } from './components/GroupManagementCard';
import { LeaveGroupConfirmModal } from './components/LeaveGroupConfirmModal';
import { styles } from './styles';

export function GroupManagementScreen() {
  const logout = useSessionStore((state) => state.logout);
  const {
    groupsQuery,
    groups,
    pendingLeaveGroup,
    isLeaving,
    openLeaveConfirm,
    closeLeaveConfirm,
    handleConfirmLeave,
  } = useGroupManagementScreen();

  if (groupsQuery.isError) {
    const appError = toAppError(groupsQuery.error);

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
            void groupsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>그룹관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <GroupManagementCard key={group.id} group={group} onPressLeave={openLeaveConfirm} />
        ))}
      </ScrollView>

      <LeaveGroupConfirmModal
        visible={Boolean(pendingLeaveGroup)}
        isLeaving={isLeaving}
        onClose={closeLeaveConfirm}
        onConfirm={() => {
          void handleConfirmLeave();
        }}
      />
    </Screen>
  );
}
