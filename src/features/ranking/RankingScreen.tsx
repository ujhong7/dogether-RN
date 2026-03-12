import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { UserUseCase } from '../../domain/usecases/userUseCase';
import { createUserRepository } from '../../data/repositories';
import { rankingStyles as styles } from './styles';
import { getRankAccent } from './utils';
import { RankingAvatar } from './components/RankingAvatar';
import { RankingTopThree } from './components/RankingTopThree';

export function RankingScreen() {
  const useCase = useMemo(() => new UserUseCase(createUserRepository()), []);
  const rankingQuery = useQuery({
    queryKey: ['ranking', 1],
    queryFn: () => useCase.getRanking(1),
  });

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
