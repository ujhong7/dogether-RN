import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { useGroupsQuery } from '../../queries/useGroupsQuery';
import { useStatisticsQuery } from '../../queries/useStatisticsQuery';
import { createGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

const MAX_TODOS_PER_DAY = 10;
const BAR_MAX_HEIGHT = 176;

function parseGroupDate(dateLabel: string | undefined) {
  if (!dateLabel) {
    return null;
  }

  const [year, month, day] = dateLabel.split('.').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(2000 + year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getCurrentGroupDay(startDateLabel: string | undefined, duration: number) {
  const startDate = parseGroupDate(startDateLabel);
  if (!startDate) {
    return 1;
  }

  const today = startOfDay(new Date());
  const startDateAtMidnight = startOfDay(startDate);
  const diff = Math.floor((today.getTime() - startDateAtMidnight.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Math.min(Math.max(diff, 1), Math.max(duration, 1));
}

export function StatisticsScreen() {
  const groupsQuery = useGroupsQuery();
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const logout = useSessionStore((state) => state.logout);
  const [sheetVisible, setSheetVisible] = useState(false);
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const groups = groupsQuery.data ?? [];
  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const statisticsQuery = useStatisticsQuery(currentGroup?.id);

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    void groupUseCase.saveLastSelectedGroup(groupId).catch((error: unknown) => {
      console.error('[Statistics] failed to save last selected group', error);
    });
  };

  const summary = useMemo(() => {
    if (!currentGroup || !statisticsQuery.data) {
      return null;
    }

    const currentDay = getCurrentGroupDay(currentGroup.startDate, Math.max(currentGroup.duration, 1));
    const firstVisibleDay = currentDay <= 4 ? 1 : currentDay - 3;
    const visibleDays = Array.from({ length: 4 }, (_, index) => firstVisibleDay + index);
    const achievementMap = new Map(statisticsQuery.data.achievements.map((item) => [item.day, item]));
    const chartValues = visibleDays.map((day) => {
      const achievement = achievementMap.get(day);
      const createdCount = Math.min(achievement?.createdCount ?? 0, MAX_TODOS_PER_DAY);
      const certificatedCount = Math.min(achievement?.certificatedCount ?? 0, createdCount);

      return {
        day,
        label: `${day}일차`,
        total: MAX_TODOS_PER_DAY,
        createdCount,
        certificatedCount,
        certificationRate: achievement?.certificationRate ?? 0,
        isCurrent: day === currentDay,
        isFuture: day > currentDay,
      };
    });

    const achievementPercent = chartValues.find((item) => item.isCurrent)?.certificationRate ?? 0;

    return {
      achievementPercent,
      currentDay,
      chartValues,
      rank: statisticsQuery.data.myRank,
      totalMembers: statisticsQuery.data.totalMembers,
      certificatedCount: statisticsQuery.data.certificatedCount,
      approvedCount: statisticsQuery.data.approvedCount,
      rejectedCount: statisticsQuery.data.rejectedCount,
    };
  }, [currentGroup, statisticsQuery.data]);

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

  if (!groups.length) {
    return (
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.screenTitle}>통계</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyEmoji}>🐧</Text>
          </View>
          <Text style={styles.emptyTitle}>소속된 그룹이 없어요</Text>
          <Text style={styles.emptyDescription}>새로운 그룹을 만들어 함께 시작해보세요!</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/group-create')}>
            <Text style={styles.primaryButtonText}>그룹 만들기</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (statisticsQuery.isError) {
    const appError = toAppError(statisticsQuery.error);

    return (
      <Screen>
        <FullScreenErrorState
          title={appError.title}
          message={appError.message}
          actionLabel={appError.actionLabel}
          onRetry={() => {
            void statisticsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  if (groupsQuery.isLoading || statisticsQuery.isLoading || !summary) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.screenTitle}>통계</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.groupHeader}>
        <View style={styles.groupInfoArea}>
          <Pressable style={styles.groupNameRow} onPress={() => setSheetVisible(true)}>
            <Text style={styles.groupName}>{currentGroup?.name}</Text>
            <Text style={styles.groupChevron}>⌄</Text>
          </Pressable>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>그룹원</Text>
              <Text style={styles.metaValue}>
                {currentGroup ? `${currentGroup.currentMember}/${currentGroup.maximumMember}` : '-'}
              </Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>초대코드</Text>
              <Text style={styles.metaValue}>{currentGroup?.joinCode ?? '-'}</Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>종료일</Text>
              <Text style={styles.metaValue}>{currentGroup?.endDate ?? '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.characterWrap}>
          <View style={styles.characterBody} />
          <View style={styles.characterGlasses} />
          <View style={styles.characterLaptop} />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🗓</Text>
          <Text style={styles.cardTitle}>인증한 기간</Text>
        </View>

        <View style={styles.chartArea}>
          <View style={styles.axisColumn}>
            {[10, 8, 6, 4, 2, 0].map((value) => (
              <Text key={value} style={styles.axisText}>
                {value}
              </Text>
            ))}
          </View>
          <View style={styles.barRow}>
            {summary?.chartValues.map((item) => (
              <View key={item.label} style={styles.barColumn}>
                <View style={styles.barVisualArea}>
                  {item.isCurrent && !item.isFuture ? (
                    <View
                      style={[
                        styles.currentIndicator,
                        {
                          bottom: Math.max((item.createdCount / item.total) * BAR_MAX_HEIGHT + 10, 10),
                        },
                      ]}
                    >
                      <View style={styles.badge}>
                        <Text numberOfLines={1} style={styles.badgeText}>
                          {summary?.achievementPercent ?? 0}% 달성중
                        </Text>
                      </View>
                      <View style={styles.badgePointer} />
                      <View style={styles.currentDot} />
                    </View>
                  ) : null}

                  {item.createdCount > 0 ? (
                    <View
                      style={[
                        styles.barTrack,
                        {
                          height: (item.createdCount / item.total) * BAR_MAX_HEIGHT,
                        },
                      ]}
                    >
                      <View style={styles.barStripeWrap}>
                        {Array.from({ length: 8 }, (_, index) => (
                          <View key={index} style={[styles.barStripe, { left: index * 18 - 12 }]} />
                        ))}
                      </View>
                      {item.certificatedCount > 0 ? (
                        <View
                          style={[
                            styles.barFill,
                            item.isCurrent ? styles.barFillCurrent : undefined,
                            {
                              height: `${(item.certificatedCount / item.createdCount) * 100}%`,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.barTrackPlaceholder} />
                  )}
                </View>
                <Text style={[styles.barLabel, item.isFuture ? styles.barLabelFuture : undefined]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>✦</Text>
            <Text style={styles.infoTitle}>내 순위</Text>
          </View>
          <Text style={styles.infoSubText}>{summary?.totalMembers ?? 0}명 중</Text>
          <Text style={styles.rankValue}>{summary?.rank ?? 0}등</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>▥</Text>
            <Text style={styles.infoTitle}>요약</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>✔</Text>
            <Text style={styles.summaryItemText}>달성 {summary?.certificatedCount ?? 0}개</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>◔</Text>
            <Text style={styles.summaryItemText}>인정 {summary?.approvedCount ?? 0}개</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>✿</Text>
            <Text style={styles.summaryItemText}>노인정 {summary?.rejectedCount ?? 0}개</Text>
          </View>
        </View>
      </View>

      <GroupSelectBottomSheet
        visible={sheetVisible}
        groups={groups}
        currentGroupId={currentGroup?.id}
        onClose={() => setSheetVisible(false)}
        onSelectGroup={handleSelectGroup}
      />
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
  screenTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyCircle: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 3,
    borderColor: '#757C95',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    minWidth: 160,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#111318',
    fontSize: 16,
    fontWeight: '800',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  groupInfoArea: {
    flex: 1,
    paddingTop: 8,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  groupName: {
    color: '#4EA0FF',
    fontSize: 18,
    fontWeight: '800',
  },
  groupChevron: {
    color: colors.text,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 18,
  },
  metaColumn: {
    gap: 2,
  },
  metaLabel: {
    color: '#8C91A7',
    fontSize: 11,
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  characterWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterBody: {
    width: 78,
    height: 78,
    borderRadius: 30,
    backgroundColor: '#5B9DF0',
  },
  characterGlasses: {
    position: 'absolute',
    top: 28,
    width: 32,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#23252D',
  },
  characterLaptop: {
    position: 'absolute',
    bottom: 16,
    width: 46,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#23252D',
  },
  chartCard: {
    backgroundColor: '#1E1F24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardIcon: {
    color: colors.text,
    fontSize: 16,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    minWidth: 106,
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  badgePointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -1,
    marginBottom: 2,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  axisColumn: {
    width: 18,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'space-between',
  },
  axisText: {
    color: '#8C91A7',
    fontSize: 10,
    textAlign: 'right',
  },
  barRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barVisualArea: {
    width: '100%',
    height: BAR_MAX_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#2A2B31',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  barTrackPlaceholder: {
    width: '100%',
    height: 0,
  },
  barStripeWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  barStripe: {
    position: 'absolute',
    top: -24,
    bottom: -24,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '28deg' }],
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#92B8E8',
  },
  barFillCurrent: {
    backgroundColor: '#5B9DF0',
  },
  currentIndicator: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -53 }],
    alignItems: 'center',
    zIndex: 2,
  },
  currentDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5B9DF0',
    borderWidth: 3,
    borderColor: '#F4F7FF',
    marginBottom: -9,
    zIndex: 1,
  },
  barLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  barLabelFuture: {
    color: '#8C91A7',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minHeight: 148,
    backgroundColor: '#1E1F24',
    borderRadius: 16,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  infoIcon: {
    color: colors.text,
    fontSize: 14,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  infoSubText: {
    color: '#B1B7C9',
    fontSize: 13,
    marginBottom: 6,
  },
  rankValue: {
    color: '#4EA0FF',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryBullet: {
    color: '#DCE2F5',
    fontSize: 13,
    width: 18,
  },
  summaryItemText: {
    color: '#DCE2F5',
    fontSize: 13,
    fontWeight: '600',
  },
});
