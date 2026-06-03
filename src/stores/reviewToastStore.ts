import { create } from 'zustand';

// MARK: - 리뷰 완료 Toast Store
//
// 역할: 리뷰 화면에서 처리 완료 후 다른 화면에도 잠깐 보여줄 toast 메시지를 보관합니다.
// 읽는 법: message 하나와 show/clear action만 있는 아주 작은 UI store입니다.

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
