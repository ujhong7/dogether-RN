import { create } from 'zustand';

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

export const useStartFlowStore = create<StartFlowState>((set) => ({
  completePayload: null,
  setCompletePayload: (completePayload) => set({ completePayload }),
  clearCompletePayload: () => set({ completePayload: null }),
}));
