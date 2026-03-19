import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { useStatisticsScreen } from '../../hooks/useStatisticsScreen';
import { toAppError } from '../../services/errors/appError';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';
import { StatisticsChartCard } from './components/StatisticsChartCard';
import { StatisticsGroupHeader } from './components/StatisticsGroupHeader';
import { StatisticsSummarySection } from './components/StatisticsSummarySection';
import { styles } from './styles';

export function StatisticsScreen() {
  const logout = useSessionStore((state) => state.logout);
  const {
    groupsQuery,
    groups,
    currentGroup,
    statisticsQuery,
    summary,
    sheetVisible,
    openSheet,
    closeSheet,
    handleSelectGroup,
  } = useStatisticsScreen();

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

      <StatisticsGroupHeader group={currentGroup} onPressGroupSelect={openSheet} />

      <StatisticsChartCard
        chartValues={summary.chartValues}
        achievementPercent={summary.achievementPercent}
      />

      <StatisticsSummarySection
        totalMembers={summary.totalMembers}
        rank={summary.rank}
        certificatedCount={summary.certificatedCount}
        approvedCount={summary.approvedCount}
        rejectedCount={summary.rejectedCount}
      />

      <GroupSelectBottomSheet
        visible={sheetVisible}
        groups={groups}
        currentGroupId={currentGroup?.id}
        onClose={closeSheet}
        onSelectGroup={handleSelectGroup}
      />
    </Screen>
  );
}
