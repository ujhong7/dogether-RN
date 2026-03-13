import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useGroupsQuery } from '../../queries/useGroupsQuery';
import { createGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

export function GroupManagementScreen() {
  const groupsQuery = useGroupsQuery();
  const queryClient = useQueryClient();
  const logout = useSessionStore((state) => state.logout);
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
  const [pendingLeaveGroupId, setPendingLeaveGroupId] = useState<number | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const groups = groupsQuery.data ?? [];
  const pendingLeaveGroup = groups.find((group) => group.id === pendingLeaveGroupId) ?? null;

  const handleConfirmLeave = async () => {
    if (!pendingLeaveGroupId || isLeaving) {
      return;
    }

    setIsLeaving(true);

    try {
      const remainingGroups = await groupUseCase.leaveGroup(pendingLeaveGroupId);
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      await queryClient.invalidateQueries({ queryKey: ['certification-list'] });
      await queryClient.invalidateQueries({ queryKey: ['ranking'] });

      if (remainingGroups.length === 0) {
        setSelectedGroupId(null);
        setPendingLeaveGroupId(null);
        router.replace('/start');
        return;
      }

      if (selectedGroupId === pendingLeaveGroupId) {
        setSelectedGroupId(remainingGroups[0].id);
      }

      setPendingLeaveGroupId(null);
    } finally {
      setIsLeaving(false);
    }
  };

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
              <Pressable style={styles.leaveButton} onPress={() => setPendingLeaveGroupId(group.id)}>
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
              <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setPendingLeaveGroupId(null)}>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
  },
  leaveButton: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#333741',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoLabel: {
    color: '#8D95A8',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: '#E8EBF5',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#2A2B31',
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalMessage: {
    color: '#A5ADBF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#5A5D67',
  },
  modalConfirmButton: {
    backgroundColor: '#FF4F7A',
  },
  modalConfirmButtonDisabled: {
    opacity: 0.6,
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalConfirmText: {
    color: '#111318',
    fontSize: 16,
    fontWeight: '800',
  },
});
