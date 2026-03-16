import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import { useGroupsQuery } from '../../queries/useGroupsQuery';
import { useRankingQuery } from '../../queries/useRankingQuery';
import { toAppError } from '../../services/errors/appError';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';
import { rankingStyles as styles } from './styles';
import { getRankAccent } from './utils';
import { RankingAvatar } from './components/RankingAvatar';
import { RankingTopThree } from './components/RankingTopThree';

export function RankingScreen() {
  const groupsQuery = useGroupsQuery();
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const logout = useSessionStore((state) => state.logout);
  const groups = groupsQuery.data ?? [];
  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const rankingQuery = useRankingQuery(currentGroup?.id);

  if (groupsQuery.isError || rankingQuery.isError) {
    const appError = toAppError(groupsQuery.error ?? rankingQuery.error);

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
            if (rankingQuery.isError) {
              void rankingQuery.refetch();
            }
          }}
        />
      </Screen>
    );
  }

  if (groupsQuery.isLoading || rankingQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!currentGroup) {
    return (
      <Screen>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>소속된 그룹이 없어요</Text>
          <Text style={styles.emptyDescription}>새로운 그룹을 만들어 함께 시작해보세요!</Text>
        </View>
      </Screen>
    );
  }

  const rankings = rankingQuery.data ?? [];
  const others = rankings.slice(3);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.titleBadge}>
          <Text style={styles.titleBadgeText}>순위</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <RankingTopThree rankings={rankings} />

      <View style={styles.noticeBox}>
        <Text style={styles.noticeIcon}>ⓘ</Text>
        <Text style={styles.noticeText}>달성률은 인증, 인정, 참여 기간을 기준으로 계산돼요.</Text>
      </View>

      {rankings.length === 0 ? (
        <View style={styles.emptyListWrap}>
          <Text style={styles.emptyTitle}>아직 순위 데이터가 없어요</Text>
          <Text style={styles.emptyDescription}>그룹 활동이 쌓이면 순위가 표시돼요.</Text>
        </View>
      ) : null}

      <ScrollView scrollEnabled={false} contentContainerStyle={styles.listContent}>
        {others.map((item) => (
          <Pressable key={`${item.memberId}-${item.rank}`} style={styles.row}>
            <Text style={styles.rankText}>{item.rank}</Text>
            <RankingAvatar accent={getRankAccent(item.rank)} />
            <Text style={styles.nameText}>{item.name}</Text>
            <View style={styles.rateBox}>
              <Text style={styles.rateIcon}>✿</Text>
              <Text style={styles.rateText}>{item.achievementRate}%</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}
