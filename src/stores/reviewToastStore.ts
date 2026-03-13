import { create } from 'zustand';

type ReviewToastState = {
  message: string | null;
  showCompletedToast: (message: string) => void;
  clearToast: () => void;
};

export const useReviewToastStore = create<ReviewToastState>((set) => ({
  message: null,
  showCompletedToast: (message) => set({ message }),
  clearToast: () => set({ message: null }),
}));
