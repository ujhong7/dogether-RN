// MARK: - 통계 Screen
//
// 역할: 선택 그룹의 달성률 차트와 요약 통계를 보여주고, 그룹 선택 bottom sheet를 연결합니다.
// 읽는 법: "hook state -> 그룹 query 에러/빈 상태 -> 통계 query 에러/loading -> render" 순서로 봅니다.

import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QueryErrorState } from '../../components/QueryErrorState';
import { GroupSelectBottomSheet } from '../../components/GroupSelectBottomSheet';
import { Screen } from '../../components/Screen';
import { useStatisticsScreen } from '../../hooks/useStatisticsScreen';
import { colors } from '../../theme/colors';
import { StatisticsChartCard } from './components/StatisticsChartCard';
import { StatisticsGroupHeader } from './components/StatisticsGroupHeader';
import { StatisticsSummarySection } from './components/StatisticsSummarySection';
import { styles } from './styles';

export function StatisticsScreen() {
  // MARK: - Hook state
  //
  // 통계 화면의 그룹 선택, query, summary 계산은 useStatisticsScreen에서 담당합니다.
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

  // MARK: - Groups error state

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

  // MARK: - Empty group state
  //
  // 가입한 그룹이 없으면 통계 대신 그룹 생성 CTA를 보여줍니다.
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

  // MARK: - Statistics error state

  if (statisticsQuery.isError) {
    return (
      <QueryErrorState
        error={statisticsQuery.error}
        onRetry={() => {
          void statisticsQuery.refetch();
        }}
      />
    );
  }

  // MARK: - Loading state

  if (groupsQuery.isLoading || statisticsQuery.isLoading || !summary) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // MARK: - Render

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
