// MARK: - 인증 상세 Screen
//
// 역할: 인증 이미지/내용을 가로 pager로 보여주고, 썸네일 선택과 읽음 처리를 관리합니다.
// 읽는 법: "상수 -> viewer/query state -> 정렬된 todo -> side effect -> empty/render" 순서로 따라갑니다.

import { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { QueryErrorState } from '../../components/QueryErrorState';
import { createChallengeGroupRepository } from '../../services/repositories';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { useCertificationViewerStore } from '../../stores/certificationViewerStore';
import { useMyTodosQuery } from '../../queries/useMyTodosQuery';
import { colors } from '../../theme/colors';
import { certificationDetailStyles as styles } from './styles';
import { getFeedbackText, getStatusMeta } from './utils';

const THUMB_SIZE = 46;
const THUMB_GAP = 8;
const THUMB_ITEM_WIDTH = THUMB_SIZE + THUMB_GAP;

export function CertificationDetailScreen() {
  // MARK: - Viewer state and refs
  //
  // 이전 화면에서 열어둔 viewer context와 FlatList/ScrollView 제어용 ref를 준비합니다.
  const { context, selectedIndex, setSelectedIndex } = useCertificationViewerStore();
  const thumbListRef = useRef<FlatList>(null);
  const mediaScrollRef = useRef<ScrollView>(null);
  const readTodoIdsRef = useRef<Set<number>>(new Set());
  const { width } = useWindowDimensions();
  const mediaCardWidth = Math.max(width - 32, 0);
  const queryClient = useQueryClient();
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const shouldUseRemoteTodos = context.source === 'mine' && Boolean(context.groupId && context.date);

  // MARK: - Todo query
  //
  // 내 인증 목록에서 온 경우에는 최신 투두 목록을 query로 다시 읽고, 없으면 viewer context의 todo를 사용합니다.
  const todosQuery = useMyTodosQuery({
    groupId: shouldUseRemoteTodos ? context.groupId ?? undefined : undefined,
    date: shouldUseRemoteTodos ? context.date ?? '' : '',
  });

  // MARK: - Ordered todos
  //
  // viewer context에 저장된 todoIds 순서에 맞춰 실제 렌더링할 todo 배열을 재정렬합니다.
  const orderedTodos = useMemo(() => {
    const remoteTodos = shouldUseRemoteTodos ? todosQuery.data : undefined;
    const todos = remoteTodos && remoteTodos.length > 0 ? remoteTodos : context.todos;
    if (!context.todoIds.length) {
      return todos;
    }

    const todoMap = new Map(todos.map((todo) => [todo.id, todo]));
    return context.todoIds
      .map((id) => todoMap.get(id))
      .filter((todo): todo is NonNullable<typeof todo> => Boolean(todo));
  }, [context.todoIds, context.todos, shouldUseRemoteTodos, todosQuery.data]);

  const safeIndex = orderedTodos.length === 0 ? 0 : Math.min(selectedIndex, orderedTodos.length - 1);
  const currentTodo = orderedTodos[safeIndex];

  // MARK: - Ranking read side effect
  //
  // 랭킹에서 다른 멤버 인증을 열었을 때는 현재 todo를 읽음 처리하고 랭킹 query를 갱신합니다.
  useEffect(() => {
    if (context.source !== 'ranking' || !currentTodo?.id || readTodoIdsRef.current.has(currentTodo.id)) {
      return;
    }

    readTodoIdsRef.current.add(currentTodo.id);

    void challengeGroupUseCase
      .readTodo(currentTodo.id)
      .then(() => {
        if (context.groupId) {
          void queryClient.invalidateQueries({ queryKey: ['ranking', context.groupId] });
        }
      })
      .catch(() => {
        readTodoIdsRef.current.delete(currentTodo.id);
      });
  }, [challengeGroupUseCase, context.groupId, context.source, currentTodo?.id, queryClient]);

  // MARK: - Scroll synchronization
  //
  // 선택 index가 바뀌면 썸네일 리스트와 큰 이미지 pager 위치를 함께 맞춥니다.
  useEffect(() => {
    if (orderedTodos.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      thumbListRef.current?.scrollToIndex({
        index: safeIndex,
        animated: true,
        viewPosition: 0.5,
      });
      mediaScrollRef.current?.scrollTo({
        x: mediaCardWidth * safeIndex,
        animated: true,
      });
    });
  }, [mediaCardWidth, orderedTodos.length, safeIndex]);

  const hasViewerTodos = context.todos.length > 0;

  if (shouldUseRemoteTodos && todosQuery.isError) {
    return (
      <QueryErrorState
        error={todosQuery.error}
        onRetry={() => {
          void todosQuery.refetch();
        }}
      />
    );
  }

  if (shouldUseRemoteTodos && todosQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  // MARK: - Empty state
  //
  // route context가 없거나 보여줄 todo가 없으면 상세 화면 대신 빈 상태를 보여줍니다.
  if ((!context.groupId && !hasViewerTodos) || (!context.date && !hasViewerTodos) || orderedTodos.length === 0 || !currentTodo) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🫥</Text>
          <Text style={styles.todoTitle}>불러올 인증 정보가 없어요</Text>
        </View>
      </Screen>
    );
  }

  // MARK: - Render
  //
  // 상단 navigation, 썸네일, 큰 이미지 pager, 인증하기 CTA 순서로 구성합니다.
  return (
    <Screen>
      <View style={styles.flex}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.navBack}>‹</Text>
          </Pressable>
          <Text style={styles.navTitle}>{context.title}</Text>
          <View style={styles.navSpacer} />
        </View>

        <FlatList
          ref={thumbListRef}
          data={orderedTodos}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbList}
          contentContainerStyle={styles.thumbContent}
          keyExtractor={(item) => String(item.id)}
          getItemLayout={(_, index) => ({
            length: THUMB_ITEM_WIDTH,
            offset: THUMB_ITEM_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              thumbListRef.current?.scrollToOffset({
                offset: THUMB_ITEM_WIDTH * index,
                animated: true,
              });
            }, 50);
          }}
          renderItem={({ item, index }) => (
            <Pressable
              style={[styles.thumbCard, index === safeIndex ? styles.thumbCardActive : undefined]}
              onPress={() => setSelectedIndex(index)}
            >
              {item.certificationMediaUrl ? (
                <Image source={{ uri: item.certificationMediaUrl }} style={styles.thumbImage} resizeMode="cover" />
              ) : (
                <Text style={styles.thumbPlaceholder}>🐧</Text>
              )}
            </Pressable>
          )}
        />

        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={styles.pageScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            ref={mediaScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / mediaCardWidth);
              if (nextIndex !== safeIndex) {
                setSelectedIndex(nextIndex);
              }
            }}
          >
            {orderedTodos.map((todo) => {
              const pageStatusMeta = getStatusMeta(todo.status);
              const pageFeedbackText = getFeedbackText(todo);

              return (
                <View key={todo.id} style={[styles.page, { width: mediaCardWidth }]}>
                  <View style={styles.mediaCard}>
                    {todo.certificationMediaUrl ? (
                      <>
                        <Image source={{ uri: todo.certificationMediaUrl }} style={styles.mediaImage} resizeMode="cover" />
                        {todo.certificationContent ? (
                          <View style={styles.mediaOverlay}>
                            <Text style={styles.mediaOverlayText}>{todo.certificationContent}</Text>
                          </View>
                        ) : null}
                      </>
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🐧</Text>
                        <Text style={styles.emptyCaption}>아직 열심히 전진중이에요</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.todoTitle}>{todo.content}</Text>

                  <View style={[styles.statusBadge, { backgroundColor: pageStatusMeta.color }]}>
                    <Text style={styles.statusBadgeText}>{pageStatusMeta.label}</Text>
                  </View>

                  {pageFeedbackText ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackText}>{pageFeedbackText}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>

        {currentTodo.status === 'WAIT_CERTIFICATION' && context.groupId && context.date ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.push({
                pathname: '/certify',
                params: {
                  todoId: String(currentTodo.id),
                  groupId: String(context.groupId),
                  date: context.date,
                  content: currentTodo.content,
                },
              })
            }
          >
            <Text style={styles.primaryButtonText}>인증하기</Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}
