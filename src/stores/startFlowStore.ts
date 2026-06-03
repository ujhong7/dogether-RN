import { create } from 'zustand';

// MARK: - 시작 플로우 Store
//
// 역할: 그룹 생성/참여가 끝난 뒤 complete 화면에 넘길 요약 정보를 잠시 보관합니다.
// 읽는 법: "완료 payload 타입 -> store state -> set/clear action" 순서로 보면 됩니다.
// route params보다 데이터가 조금 더 많고 화면 간 이동 직후에만 필요해서 가벼운 전역 store로 둡니다.

type FlowKind = 'create' | 'join';

export type CompletePayload = {
  kind: FlowKind;
  targetGroupId: number;
  groupName: string;
  joinCode: string;
  durationLabel?: string;
  memberCountLabel?: string;
  startDateLabel?: string;
  endDateLabel?: string;
};

type StartFlowState = {
  completePayload: CompletePayload | null;
  setCompletePayload: (payload: CompletePayload) => void;
  clearCompletePayload: () => void;
};

// MARK: - Store implementation

export const useStartFlowStore = create<StartFlowState>((set) => ({
  completePayload: null,
  setCompletePayload: (completePayload) => set({ completePayload }),
  clearCompletePayload: () => set({ completePayload: null }),
}));
