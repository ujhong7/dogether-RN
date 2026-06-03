// MARK: - 인증 Draft Zustand Store
//
// 역할: 사진 선택 route와 내용 입력 route 사이에서 인증 작성 중간 상태를 공유합니다.
// 읽는 법: "draft 타입 -> 초기값 -> start/set/clear action" 순서로 보면 됩니다.

import { create } from 'zustand';

// MARK: - State shape

type CertificationDraft = {
  todoId: number | null;
  groupId: number | null;
  date: string;
  todoContent: string;
  imageUri: string | null;
  imageMimeType: string | null;
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
  setImageAsset: (input: { uri: string | null; mimeType?: string | null }) => void;
  setContent: (content: string) => void;
  clearDraft: () => void;
};

// MARK: - Initial state

const initialDraft: CertificationDraft = {
  todoId: null,
  groupId: null,
  date: '',
  todoContent: '',
  imageUri: null,
  imageMimeType: null,
  content: '',
};

// MARK: - Store implementation

export const useCertificationDraftStore = create<CertificationDraftState>((set) => ({
  // MARK: Draft value

  draft: initialDraft,

  // MARK: Start draft
  //
  // 같은 투두로 다시 들어온 경우에는 기존 이미지/내용을 유지하고, 다른 투두면 새 draft로 초기화합니다.
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
              imageMimeType: null,
              content: '',
            },
    })),

  // MARK: Update draft fields

  setImageAsset: ({ uri, mimeType }) =>
    set((state) => ({
      draft: {
        ...state.draft,
        imageUri: uri,
        imageMimeType: mimeType?.trim() || null,
      },
    })),
  setContent: (content) =>
    set((state) => ({
      draft: {
        ...state.draft,
        content,
      },
    })),

  // MARK: Clear draft

  clearDraft: () => set({ draft: initialDraft }),
}));
