import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useCertificationViewerStore } from '../../stores/certificationViewerStore';
import { useMyTodosQuery } from '../../queries/useMyTodosQuery';
import { certificationDetailStyles as styles } from './styles';
import { getFeedbackText, getStatusMeta } from './utils';

const THUMB_SIZE = 46;
const THUMB_GAP = 8;
const THUMB_ITEM_WIDTH = THUMB_SIZE + THUMB_GAP;

export function CertificationDetailScreen() {
  const { context, selectedIndex, setSelectedIndex } = useCertificationViewerStore();
  const thumbListRef = useRef<FlatList>(null);
  const mediaScrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const mediaCardWidth = Math.max(width - 32, 0);

  const todosQuery = useMyTodosQuery({
    groupId: context.groupId ?? undefined,
    date: context.date ?? '',
  });

  const orderedTodos = useMemo(() => {
    const todos = todosQuery.data && todosQuery.data.length > 0 ? todosQuery.data : context.todos;
    if (!context.todoIds.length) {
      return todos;
    }

    const todoMap = new Map(todos.map((todo) => [todo.id, todo]));
    return context.todoIds
      .map((id) => todoMap.get(id))
      .filter((todo): todo is NonNullable<typeof todo> => Boolean(todo));
  }, [context.todoIds, context.todos, todosQuery.data]);

  const safeIndex = orderedTodos.length === 0 ? 0 : Math.min(selectedIndex, orderedTodos.length - 1);
  const currentTodo = orderedTodos[safeIndex];

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

  return (
    <Screen>
      <View style={styles.flex}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.navBack}>‹</Text>
          </Pressable>
          <Text style={styles.navTitle}>내 인증 정보</Text>
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
