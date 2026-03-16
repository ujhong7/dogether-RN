import { create } from 'zustand';
import type { Todo } from '../models/todo';

type CertificationViewerContext = {
  source: 'mine' | 'ranking';
  title: string;
  groupId: number | null;
  date: string;
  todoIds: number[];
  todos: Todo[];
};

type CertificationViewerState = {
  context: CertificationViewerContext;
  selectedIndex: number;
  openViewer: (
    input: Omit<CertificationViewerContext, 'todos'> & { selectedIndex: number; todos?: Todo[] }
  ) => void;
  setSelectedIndex: (index: number) => void;
  clearContext: () => void;
};

const initialContext: CertificationViewerContext = {
  source: 'mine',
  title: '내 인증 정보',
  groupId: null,
  date: '',
  todoIds: [],
  todos: [],
};

export const useCertificationViewerStore = create<CertificationViewerState>((set) => ({
  context: initialContext,
  selectedIndex: 0,
  openViewer: ({ source, title, groupId, date, todoIds, todos = [], selectedIndex }) =>
    set({
      context: { source, title, groupId, date, todoIds, todos },
      selectedIndex,
    }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  clearContext: () =>
    set({
      context: initialContext,
      selectedIndex: 0,
    }),
}));
