// MARK: - 그룹 관리 Screen
//
// 역할: 참여 중인 그룹 목록을 보여주고, 그룹 탈퇴 확인 모달을 연결합니다.
// 읽는 법: "hook state -> error state -> list render -> leave modal" 순서로 보면 됩니다.

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QueryErrorState } from '../../components/QueryErrorState';
import { Screen } from '../../components/Screen';
import { useGroupManagementScreen } from '../../hooks/useGroupManagementScreen';
import { GroupManagementCard } from './components/GroupManagementCard';
import { LeaveGroupConfirmModal } from './components/LeaveGroupConfirmModal';
import { styles } from './styles';

export function GroupManagementScreen() {
  // MARK: - Hook state

  const {
    groupsQuery,
    groups,
    pendingLeaveGroup,
    isLeaving,
    openLeaveConfirm,
    closeLeaveConfirm,
    handleConfirmLeave,
  } = useGroupManagementScreen();

  // MARK: - Error state

  if (groupsQuery.isError) {
    return (
      <QueryErrorState
        error={groupsQuery.error}
        onRetry={() => {
          void groupsQuery.refetch();
        }}
      />
    );
  }

  // MARK: - Render

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
