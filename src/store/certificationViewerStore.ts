import { create } from 'zustand';

type CertificationViewerContext = {
  groupId: number | null;
  date: string;
  todoIds: number[];
};

type CertificationViewerState = {
  context: CertificationViewerContext;
  selectedIndex: number;
  openViewer: (input: CertificationViewerContext & { selectedIndex: number }) => void;
  setSelectedIndex: (index: number) => void;
  clearContext: () => void;
};

const initialContext: CertificationViewerContext = {
  groupId: null,
  date: '',
  todoIds: [],
};

export const useCertificationViewerStore = create<CertificationViewerState>((set) => ({
  context: initialContext,
  selectedIndex: 0,
  openViewer: ({ groupId, date, todoIds, selectedIndex }) =>
    set({
      context: { groupId, date, todoIds },
      selectedIndex,
    }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  clearContext: () =>
    set({
      context: initialContext,
      selectedIndex: 0,
    }),
}));
