import { create } from 'zustand';
import type { Todo } from '../models/todo';

// MARK: - 인증 상세 Viewer Store
//
// 역할: 내 인증 목록/랭킹 등 여러 진입점에서 인증 상세 화면으로 넘어갈 때 필요한 문맥을 보관합니다.
// 읽는 법: "viewer context -> 선택 index -> open/clear action" 순서로 보면 됩니다.
// iOS로 비유하면 상세 화면으로 push하기 전 ViewModel에 주입할 navigation context를 모아두는 역할입니다.

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

// MARK: - Initial context

const initialContext: CertificationViewerContext = {
  source: 'mine',
  title: '내 인증 정보',
  groupId: null,
  date: '',
  todoIds: [],
  todos: [],
};

// MARK: - Store implementation

export const useCertificationViewerStore = create<CertificationViewerState>((set) => ({
  context: initialContext,
  selectedIndex: 0,
  // 목록 화면에서 어떤 인증을 눌렀는지와 같은 목록 안의 todo들을 함께 저장합니다.
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
