import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useGroupManagementScreen } from '../../hooks/useGroupManagementScreen';
import { toAppError } from '../../services/errors/appError';
import { useSessionStore } from '../../stores/sessionStore';
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
          <View key={group.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{group.name}</Text>
              <Pressable style={styles.leaveButton} onPress={() => openLeaveConfirm(group.id)}>
                <Text style={styles.leaveButtonText}>탈퇴하기</Text>
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>그룹원</Text>
              <Text style={styles.infoValue}>
                {group.currentMember}/{group.maximumMember}
              </Text>
              <Text style={styles.infoLabel}>종료일</Text>
              <Text style={styles.infoValue}>{group.endDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>초대코드</Text>
              <Text style={styles.infoValue}>{group.joinCode}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {pendingLeaveGroup ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>현재 그룹을 탈퇴하시겠어요?</Text>
            <Text style={styles.modalMessage}>그룹을 탈퇴하면 그룹 내 모든 데이터가{"\n"}삭제되며 복구할 수 없어요.</Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={closeLeaveConfirm}>
                <Text style={styles.modalCancelText}>뒤로가기</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirmButton, isLeaving ? styles.modalConfirmButtonDisabled : undefined]}
                disabled={isLeaving}
                onPress={() => {
                  void handleConfirmLeave();
                }}
              >
                <Text style={styles.modalConfirmText}>{isLeaving ? '탈퇴중...' : '탈퇴하기'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
