import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { AppAlertModal } from '../../components/AppAlertModal';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { Screen } from '../../components/Screen';
import type { Ranking } from '../../models/ranking';
import { useGroupsQuery } from '../../queries/useGroupsQuery';
import { useRankingQuery } from '../../queries/useRankingQuery';
import { createChallengeGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { useCertificationViewerStore } from '../../stores/certificationViewerStore';
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
  const openViewer = useCertificationViewerStore((state) => state.openViewer);
  const groups = groupsQuery.data ?? [];
  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const rankingQuery = useRankingQuery(currentGroup?.id);
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const [modalError, setModalError] = useState<ReturnType<typeof toAppError> | null>(null);

  useFocusEffect(
    useCallback(() => {
      void rankingQuery.refetch();
    }, [rankingQuery]),
  );

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

  const handleOpenMemberCertification = async (ranking: Ranking) => {
    if (!currentGroup || !ranking.historyReadStatus) {
      return;
    }

    try {
      const result = await challengeGroupUseCase.getMemberTodos(currentGroup.id, ranking.memberId);

      openViewer({
        source: 'ranking',
        title: `${ranking.name}님의 인증 정보`,
        groupId: currentGroup.id,
        date: '',
        todoIds: result.todos.map((todo) => todo.id),
        todos: result.todos,
        selectedIndex: Math.max(result.selectedIndex, 0),
      });
      router.push('/certification');
    } catch (error) {
      setModalError(toAppError(error));
    }
  };

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

      <RankingTopThree rankings={rankings} onPressRanking={(ranking) => void handleOpenMemberCertification(ranking)} />

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
          <Pressable
            key={`${item.memberId}-${item.rank}`}
            style={styles.row}
            disabled={!item.historyReadStatus}
            onPress={() => void handleOpenMemberCertification(item)}
          >
            <Text style={styles.rankText}>{item.rank}</Text>
            <RankingAvatar
              accent={getRankAccent(item.rank)}
              imageUrl={item.profileImageUrl}
              readStatus={item.historyReadStatus}
            />
            <Text style={styles.nameText}>{item.name}</Text>
            <View style={styles.rateBox}>
              <Text style={styles.rateIcon}>✿</Text>
              <Text style={styles.rateText}>{item.achievementRate}%</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {modalError ? <AppAlertModal visible error={modalError} onClose={() => setModalError(null)} /> : null}
    </Screen>
  );
}
