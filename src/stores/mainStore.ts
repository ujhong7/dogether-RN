import { create } from 'zustand';
import { readLastSelectedGroupId, saveLastSelectedGroupId } from '../lib/storage';

// MARK: - 메인 화면 Store
//
// 역할: 메인/랭킹/통계 화면이 함께 참조하는 "현재 선택 그룹"과 메인 화면의 UI 상태를 보관합니다.
// 읽는 법: "상태 타입 -> 마지막 선택 그룹 초기화 -> 화면 조작 action" 순서로 보면 됩니다.
// 서버에서 내려오는 데이터는 React Query가 담당하고, 사용자가 지금 어떤 화면 상태를 선택했는지만 Zustand가 담당합니다.

export type TodoFilter = 'all' | 'wait' | 'approve' | 'reject';

// MARK: - State shape

type MainState = {
  selectedGroupId: number | null;
  // 0은 오늘, -1은 어제, -2는 그저께입니다. 미래 이동은 0까지만 허용됩니다.
  dateOffset: number;
  filter: TodoFilter;
  sheetExpanded: boolean;
  setSelectedGroupId: (groupId: number | null) => void;
  movePast: () => void;
  moveFuture: () => void;
  setFilter: (filter: TodoFilter) => void;
  setSheetExpanded: (expanded: boolean) => void;
};

// MARK: - Store implementation

export const useMainStore = create<MainState>((set) => ({
  // 앱을 다시 켰을 때도 마지막으로 보던 그룹을 복원하기 위해 MMKV에서 초기값을 읽습니다.
  selectedGroupId: readLastSelectedGroupId(),
  dateOffset: 0,
  filter: 'all',
  sheetExpanded: false,
  setSelectedGroupId: (selectedGroupId) => {
    // 그룹을 바꾸면 날짜/필터/시트 상태를 초기화해서 이전 그룹의 UI 상태가 섞이지 않게 합니다.
    saveLastSelectedGroupId(selectedGroupId);
    set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
  },
  // 날짜를 바꾸면 이전 날짜의 필터가 남지 않도록 기본 필터로 되돌립니다.
  movePast: () => set((state) => ({ dateOffset: state.dateOffset - 1, filter: 'all' })),
  moveFuture: () => set((state) => ({ dateOffset: state.dateOffset + 1, filter: 'all' })),
  // 같은 필터를 다시 누르면 "전체"로 토글됩니다.
  setFilter: (filter) => set((state) => ({ filter: state.filter === filter ? 'all' : filter })),
  setSheetExpanded: (sheetExpanded) => set({ sheetExpanded }),
}));
