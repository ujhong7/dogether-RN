// MARK: - 인증 목록 Screen
//
// 역할: 내 인증 목록을 정렬/필터링해서 보여주고, 선택한 인증을 상세 viewer로 연결합니다.
// 읽는 법: "state/query -> filtered sections -> open detail -> error/render" 순서로 보면 됩니다.

import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QueryErrorState } from '../../components/QueryErrorState';
import { Screen } from '../../components/Screen';
import { SelectionBottomSheet } from '../../components/SelectionBottomSheet';
import type { CertificationListFilter, CertificationListItem, CertificationListSort } from '../../models/certificationList';
import type { Todo } from '../../models/todo';
import { useCertificationListQuery } from '../../queries/useCertificationListQuery';
import { useCertificationViewerStore } from '../../stores/certificationViewerStore';
import { certificationListStyles as styles } from './styles';
import {
  CERTIFICATION_FILTERS,
  CERTIFICATION_SORT_OPTIONS,
  filterCertificationItems,
  getCertificationBadgeMeta,
  getCertificationEmptyTitle,
} from './utils';

export function CertificationListScreen() {
  // MARK: - Local UI state
  //
  // 정렬 기준, 필터 탭, 정렬 bottom sheet 표시 여부처럼 화면 내부에서만 쓰는 상태입니다.
  const [sort, setSort] = useState<CertificationListSort>('TODO_COMPLETION_DATE');
  const [filter, setFilter] = useState<CertificationListFilter>('all');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const openViewer = useCertificationViewerStore((state) => state.openViewer);
  const certificationListQuery = useCertificationListQuery(sort);

  // MARK: - Derived sections
  //
  // query 결과를 현재 필터에 맞게 줄이고, 빈 목록/필터 결과 여부를 계산합니다.
  const sections = certificationListQuery.data?.sections ?? [];
  const summary = certificationListQuery.data?.summary;
  const filteredSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: filterCertificationItems(section.items, filter),
        }))
        .filter((section) => section.items.length > 0),
    [filter, sections],
  );
  const hasAnyItems = sections.some((section) => section.items.length > 0);
  const hasFilteredItems = filteredSections.length > 0;
  const currentSortLabel = CERTIFICATION_SORT_OPTIONS.find((option) => option.key === sort)?.label ?? '투두 완료일순';

  // MARK: - Open detail
  //
  // 카드 하나를 누르면 같은 날짜 또는 같은 그룹의 인증들을 viewer context에 담고 상세 화면으로 이동합니다.
  const openCertificationDetail = (item: CertificationListItem) => {
    const relatedItems = sections
      .flatMap((section) => section.items)
      .filter((entry) => {
        if (sort !== 'TODO_COMPLETION_DATE') {
          return entry.groupName === item.groupName;
        }

        if (item.groupId) {
          return entry.groupId === item.groupId && entry.date === item.date;
        }

        return entry.todoId === item.todoId;
      });
    const selectedIndex = relatedItems.findIndex((entry) => entry.todoId === item.todoId);
    const viewerTodos: Todo[] = relatedItems.map((entry) => ({
      id: entry.todoId,
      content: entry.content,
      status: entry.status,
      certificationMediaUrl: entry.certificationMediaUrl,
      certificationContent: entry.certificationContent,
      reviewFeedback: entry.reviewFeedback,
    }));

    openViewer({
      source: 'mine',
      title: '내 인증 정보',
      groupId: item.groupId ?? null,
      date: item.date,
      todoIds: viewerTodos.map((entry) => entry.id),
      todos: viewerTodos,
      selectedIndex: selectedIndex < 0 ? 0 : selectedIndex,
    });
    router.push('/certification');
  };

  // MARK: - Error state
  //
  // 인증 목록 query 실패 시 공통 에러 UI를 먼저 렌더링합니다.
  if (certificationListQuery.isError) {
    return (
      <QueryErrorState
        error={certificationListQuery.error}
        onRetry={() => {
          void certificationListQuery.refetch();
        }}
      />
    );
  }

  // MARK: - Render
  //
  // 헤더, 빈 상태 또는 요약/필터/그리드, 정렬 bottom sheet 순서로 화면을 구성합니다.
  return (
    <Screen scroll>
      <View style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>인증 목록</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!hasAnyItems ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIllustrationWrap}>
              <Text style={styles.emptyIllustration}>🐧</Text>
            </View>
            <Text style={styles.emptyTitle}>아직 작성된 투두가 없어요</Text>
            <Text style={styles.emptyDescription}>오늘 하루 이루고 싶은 목표를 입력해보세요!</Text>
          </View>
        ) : (
          <>
            <View style={styles.headingWrap}>
              <Text style={styles.headingText}>대단해요 !</Text>
              <Text style={styles.headingTextLarge}>
                총 <Text style={styles.headingAccent}>{summary?.achievementCount ?? 0}개</Text>의 투두를 달성했어요
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>✔</Text>
                <Text style={styles.summaryLabel}>달성</Text>
                <Text style={styles.summaryCount}>{summary?.achievementCount ?? 0}개</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>✿</Text>
                <Text style={styles.summaryLabel}>인정</Text>
                <Text style={[styles.summaryCount, styles.summaryCountAccent]}>{summary?.approvedCount ?? 0}개</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>✿</Text>
                <Text style={styles.summaryLabel}>노인정</Text>
                <Text style={styles.summaryCount}>{summary?.rejectedCount ?? 0}개</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsContent}>
                <Pressable style={styles.sortButton} onPress={() => setSortSheetVisible(true)}>
                  <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
                  <Text style={styles.sortButtonChevron}>⌄</Text>
                </Pressable>

                {CERTIFICATION_FILTERS.map((option) => {
                  const active = filter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.filterButton, active ? { backgroundColor: option.color, borderColor: option.color } : undefined]}
                      onPress={() => setFilter(option.key)}
                    >
                      {option.icon ? (
                        <Text style={[styles.filterIcon, active ? styles.filterActiveText : undefined]}>{option.icon}</Text>
                      ) : null}
                      <Text style={[styles.filterText, active ? styles.filterActiveText : undefined]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {!hasFilteredItems ? (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIllustrationWrap}>
                  <Text style={styles.emptyIllustration}>🐧</Text>
                </View>
                <Text style={styles.emptyTitle}>{getCertificationEmptyTitle(filter)}</Text>
                <Text style={styles.emptyDescription}>오늘 하루 이루고 싶은 작은 목표를 입력해보세요!</Text>
              </View>
            ) : (
              filteredSections.map((section) => (
                <View key={section.key} style={styles.sectionWrap}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.grid}>
                    {section.items.map((item) => {
                      const badge = getCertificationBadgeMeta(item.status);
                      return (
                        <Pressable key={item.todoId} style={styles.card} onPress={() => openCertificationDetail(item)}>
                          {item.certificationMediaUrl ? (
                            <Image source={{ uri: item.certificationMediaUrl }} style={styles.cardImage} resizeMode="cover" />
                          ) : (
                            <View style={styles.cardPlaceholder}>
                              <Text style={styles.cardPlaceholderText}>🐧</Text>
                            </View>
                          )}
                          <View style={[styles.cardBadge, { backgroundColor: badge.color }]}>
                            <Text style={styles.cardBadgeText}>
                              {badge.icon} {badge.label}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </View>

      <SelectionBottomSheet
        visible={sortSheetVisible}
        title="정렬"
        items={CERTIFICATION_SORT_OPTIONS.map((option) => ({
          key: option.key,
          label: option.label,
          selected: sort === option.key,
        }))}
        onClose={() => setSortSheetVisible(false)}
        onSelect={(key) => setSort(key as CertificationListSort)}
      />
    </Screen>
  );
}
