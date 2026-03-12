import { create } from 'zustand';

type CertificationDraft = {
  todoId: number | null;
  groupId: number | null;
  date: string;
  todoContent: string;
  imageUri: string | null;
  content: string;
};

type CertificationDraftState = {
  draft: CertificationDraft;
  startDraft: (input: {
    todoId: number;
    groupId: number;
    date: string;
    todoContent: string;
  }) => void;
  setImageUri: (imageUri: string | null) => void;
  setContent: (content: string) => void;
  clearDraft: () => void;
};

const initialDraft: CertificationDraft = {
  todoId: null,
  groupId: null,
  date: '',
  todoContent: '',
  imageUri: null,
  content: '',
};

export const useCertificationDraftStore = create<CertificationDraftState>((set) => ({
  draft: initialDraft,
  startDraft: ({ todoId, groupId, date, todoContent }) =>
    set((state) => ({
      draft:
        state.draft.todoId === todoId &&
        state.draft.groupId === groupId &&
        state.draft.date === date
          ? {
              ...state.draft,
              todoContent,
            }
          : {
              todoId,
              groupId,
              date,
              todoContent,
              imageUri: null,
              content: '',
            },
    })),
  setImageUri: (imageUri) =>
    set((state) => ({
      draft: {
        ...state.draft,
        imageUri,
      },
    })),
  setContent: (content) =>
    set((state) => ({
      draft: {
        ...state.draft,
        content,
      },
    })),
  clearDraft: () => set({ draft: initialDraft }),
}));
