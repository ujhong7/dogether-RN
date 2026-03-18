import { create } from 'zustand';
import { readLastSelectedGroupId, saveLastSelectedGroupId } from '../lib/storage';

export type TodoFilter = 'all' | 'wait' | 'approve' | 'reject';

type MainState = {
  selectedGroupId: number | null;
  dateOffset: number;
  filter: TodoFilter;
  sheetExpanded: boolean;
  setSelectedGroupId: (groupId: number | null) => void;
  movePast: () => void;
  moveFuture: () => void;
  setFilter: (filter: TodoFilter) => void;
  setSheetExpanded: (expanded: boolean) => void;
};

export const useMainStore = create<MainState>((set) => ({
  selectedGroupId: readLastSelectedGroupId(),
  dateOffset: 0,
  filter: 'all',
  sheetExpanded: false,
  setSelectedGroupId: (selectedGroupId) => {
    saveLastSelectedGroupId(selectedGroupId);
    set({ selectedGroupId, dateOffset: 0, filter: 'all', sheetExpanded: false });
  },
  movePast: () => set((state) => ({ dateOffset: state.dateOffset - 1, filter: 'all' })),
  moveFuture: () => set((state) => ({ dateOffset: state.dateOffset + 1, filter: 'all' })),
  setFilter: (filter) => set((state) => ({ filter: state.filter === filter ? 'all' : filter })),
  setSheetExpanded: (sheetExpanded) => set({ sheetExpanded }),
}));
