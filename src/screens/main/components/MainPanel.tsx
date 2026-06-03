// MARK: - 메인 하단 Panel 컴포넌트
//
// 역할: 날짜 이동, 필터, 투두 작성 CTA, 투두 목록/빈 상태를 sheetStatus에 따라 바꿔 보여줍니다.
// 읽는 법: "날짜 헤더 -> 필터 -> 상태별 본문 -> 추가 버튼" 순서로 JSX를 따라가면 됩니다.

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Todo } from '../../../models/todo';
import type { MainSheetStatus } from '../../../hooks/useMainScreen';
import type { TodoFilter } from '../../../stores/mainStore';
import { mainStyles as styles } from '../styles';
import { MAIN_FILTERS } from '../utils';
import { DoneIllustration, EmptyIllustration, TodayIllustration } from './Illustrations';
import { TodoRow } from './TodoRow';

type Props = {
  sheetStatus: MainSheetStatus;
  filter: TodoFilter;
  formattedDate: string;
  canGoPast: boolean;
  canGoFuture: boolean;
  visibleTodos: Todo[];
  filteredTodos: Todo[];
  dateOffset: number;
  currentGroupId?: number;
  queryDate: string;
  activeFilterEmptyText: string;
  onMovePast: () => void;
  onMoveFuture: () => void;
  onSetFilter: (filter: TodoFilter) => void;
};

export function MainPanel({
  sheetStatus,
  filter,
  formattedDate,
  canGoPast,
  canGoFuture,
  visibleTodos,
  filteredTodos,
  dateOffset,
  currentGroupId,
  queryDate,
  activeFilterEmptyText,
  onMovePast,
  onMoveFuture,
  onSetFilter,
}: Props) {
  return (
    <View style={styles.panel}>
      {/* MARK: - Date navigation */}
      <View style={styles.dateHeader}>
        <Pressable
          style={[styles.dateArrow, !canGoPast ? styles.dateArrowDisabled : undefined]}
          disabled={!canGoPast}
          onPress={onMovePast}
        >
          <Text style={styles.dateArrowText}>‹</Text>
        </Pressable>
        <Text style={styles.dateTitle}>{formattedDate}</Text>
        <Pressable
          style={[styles.dateArrow, !canGoFuture ? styles.dateArrowDisabled : undefined]}
          disabled={!canGoFuture}
          onPress={onMoveFuture}
        >
          <Text style={styles.dateArrowText}>›</Text>
        </Pressable>
      </View>

      {/* MARK: - Status filter */}
      {sheetStatus !== 'createTodo' && sheetStatus !== 'done' ? (
        <View style={styles.filterRow}>
          {MAIN_FILTERS.map((option) => {
            const active = filter === option.key;
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.filterButton,
                  active ? { backgroundColor: option.color, borderColor: option.color } : undefined,
                ]}
                onPress={() => onSetFilter(option.key)}
              >
                {option.icon ? (
                  <Text style={[styles.filterIcon, active ? styles.filterActiveText : undefined]}>
                    {option.icon}
                  </Text>
                ) : null}
                <Text style={[styles.filterText, active ? styles.filterActiveText : undefined]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* MARK: - Create todo state */}
      {sheetStatus === 'createTodo' ? (
        <View style={styles.centerState}>
          <TodayIllustration />
          <Text style={styles.centerTitle}>오늘의 투두를 작성해보세요</Text>
          <Text style={styles.centerDescription}>매일 자정부터 새로운 투두를 입력해요</Text>
          <Pressable style={styles.primaryAction} onPress={() => router.push('/todo-write')}>
            <Text style={styles.primaryActionText}>투두 작성하기</Text>
          </Pressable>
        </View>
      ) : null}

      {/* MARK: - Finished group state */}
      {sheetStatus === 'done' ? (
        <View style={styles.centerState}>
          <DoneIllustration />
          <Text style={styles.centerTitle}>그룹 활동 기간이 모두 끝났어요</Text>
          <Text style={styles.centerDescription}>오늘이 지나면 이 페이지는 더 이상 열 수 없어요</Text>
        </View>
      ) : null}

      {/* MARK: - Todo list state */}
      {sheetStatus === 'certificateTodo' || sheetStatus === 'todoList' || sheetStatus === 'emptyList' ? (
        <View style={styles.todoSection}>
          <ScrollView
            style={styles.todoListScroll}
            contentContainerStyle={styles.todoListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo, index) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  dateOffset={dateOffset}
                  currentGroupId={currentGroupId}
                  queryDate={queryDate}
                  todoIds={filteredTodos.map((item) => item.id)}
                  selectedIndex={index}
                />
              ))
            ) : (
              <View style={styles.emptyFilterState}>
                <EmptyIllustration tint={filter === 'wait' ? '#E8C95F' : filter === 'reject' ? '#FF4F7A' : '#7F89A8'} />
                <Text style={styles.centerTitle}>{activeFilterEmptyText || '표시할 투두가 없어요'}</Text>
                <Text style={styles.centerDescription}>오늘 하루 이루고 싶은 작은 목표를 입력해보세요!</Text>
              </View>
            )}
          </ScrollView>

          {/* MARK: - Inline add todo action */}
          {dateOffset === 0 && filter === 'all' && visibleTodos.length < 10 ? (
            <Pressable style={styles.addTodoInline} onPress={() => router.push('/todo-write')}>
              <Text style={styles.addTodoPlus}>⊕</Text>
              <Text style={styles.addTodoLabel}>투두 추가하기 ({visibleTodos.length}/10)</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
