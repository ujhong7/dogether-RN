import { create } from 'zustand';
import type { Todo } from '../models/todo';

type CertificationViewerContext = {
  groupId: number | null;
  date: string;
  todoIds: number[];
  todos: Todo[];
};

type CertificationViewerState = {
  context: CertificationViewerContext;
  selectedIndex: number;
  openViewer: (input: Omit<CertificationViewerContext, 'todos'> & { selectedIndex: number; todos?: Todo[] }) => void;
  setSelectedIndex: (index: number) => void;
  clearContext: () => void;
};

const initialContext: CertificationViewerContext = {
  groupId: null,
  date: '',
  todoIds: [],
  todos: [],
};

export const useCertificationViewerStore = create<CertificationViewerState>((set) => ({
  context: initialContext,
  selectedIndex: 0,
  openViewer: ({ groupId, date, todoIds, todos = [], selectedIndex }) =>
    set({
      context: { groupId, date, todoIds, todos },
      selectedIndex,
    }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  clearContext: () =>
    set({
      context: initialContext,
      selectedIndex: 0,
    }),
}));
