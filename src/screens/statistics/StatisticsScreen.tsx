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
import { styles } from './styles';
import { BAR_MAX_HEIGHT } from './utils';

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

      <View style={styles.groupHeader}>
        <View style={styles.groupInfoArea}>
          <Pressable style={styles.groupNameRow} onPress={openSheet}>
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
        onClose={closeSheet}
        onSelectGroup={handleSelectGroup}
      />
    </Screen>
  );
}
