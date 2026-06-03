// MARK: - 랭킹 Screen
//
// 역할: 현재 그룹의 랭킹을 보여주고, 읽을 인증이 있는 멤버를 누르면 인증 상세 viewer로 이동합니다.
// 읽는 법: "query/state -> focus refetch -> error/loading/empty -> member detail -> render" 순서로 보면 됩니다.

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { AppErrorAlertModal } from '../../components/AppErrorAlertModal';
import { QueryErrorState } from '../../components/QueryErrorState';
import { Screen } from '../../components/Screen';
import type { Ranking } from '../../models/ranking';
import { useGroupsQuery } from '../../queries/useGroupsQuery';
import { useRankingQuery } from '../../queries/useRankingQuery';
import { createChallengeGroupRepository } from '../../services/repositories';
import { selectPreferredError, toAppError } from '../../services/errors/appError';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { useCertificationViewerStore } from '../../stores/certificationViewerStore';
import { useMainStore } from '../../stores/mainStore';
import { colors } from '../../theme/colors';
import { rankingStyles as styles } from './styles';
import { getRankAccent } from './utils';
import { RankingAvatar } from './components/RankingAvatar';
import { RankingTopThree } from './components/RankingTopThree';

export function RankingScreen() {
  // MARK: - Query and store state
  //
  // 현재 선택 그룹을 기준으로 그룹 목록과 랭킹 목록을 조회합니다.
  const groupsQuery = useGroupsQuery();
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const openViewer = useCertificationViewerStore((state) => state.openViewer);
  const groups = groupsQuery.data ?? [];
  const currentGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const rankingQuery = useRankingQuery(currentGroup?.id);
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const [modalError, setModalError] = useState<ReturnType<typeof toAppError> | null>(null);

  // MARK: - Focus refresh
  //
  // 랭킹 화면으로 다시 돌아올 때 읽음 상태/순위가 바뀌었을 수 있어 refetch합니다.
  useFocusEffect(
    useCallback(() => {
      void rankingQuery.refetch();
    }, [rankingQuery]),
  );

  // MARK: - Error state
  //
  // 그룹 또는 랭킹 query가 실패하면 정상 화면 대신 공통 에러 UI를 보여줍니다.
  if (groupsQuery.isError || rankingQuery.isError) {
    return (
      <QueryErrorState
        error={selectPreferredError(groupsQuery.error, rankingQuery.error)}
        onRetry={() => {
          if (groupsQuery.isError) {
            void groupsQuery.refetch();
          }
          if (rankingQuery.isError) {
            void rankingQuery.refetch();
          }
        }}
      />
    );
  }

  // MARK: - Loading state

  if (groupsQuery.isLoading || rankingQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // MARK: - Empty group state

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

  // MARK: - Open member certification
  //
  // 멤버 row를 누르면 해당 멤버의 투두 목록을 읽고 인증 상세 viewer context를 구성합니다.
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

  // MARK: - Render

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

      {modalError ? (
        <AppErrorAlertModal visible error={modalError} onClose={() => setModalError(null)} />
      ) : null}
    </Screen>
  );
}
