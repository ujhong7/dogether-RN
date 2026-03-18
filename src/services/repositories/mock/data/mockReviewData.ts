import type { PendingReview, ReviewResult } from '../../../../models/review';
import { storage } from '../../../../lib/storage';

const PENDING_REVIEWS_KEY = 'mockPendingReviews';

const seededPendingReviews: PendingReview[] = [
  {
    id: 9001,
    groupId: 101,
    content: '이 땀 보이시죠? 저 개빡세게함, ㄹㅇ',
    mediaUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    todoContent: '노트북으로 운동 영상보기',
    doer: '양성욱',
  },
];

function readStoredPendingReviews() {
  const raw = storage.getString(PENDING_REVIEWS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingReview[];
  } catch {
    return null;
  }
}

function writePendingReviews(reviews: PendingReview[]) {
  storage.set(PENDING_REVIEWS_KEY, JSON.stringify(reviews));
}

export function readPendingReviews() {
  const stored = readStoredPendingReviews();
  if (stored) {
    return stored;
  }

  writePendingReviews(seededPendingReviews);
  return seededPendingReviews;
}

export function submitMockReview(_: number, __: ReviewResult, ___?: string) {
  const pendingReviews = readPendingReviews();
  const nextReviews = pendingReviews.slice(1);
  writePendingReviews(nextReviews);
  return nextReviews;
}

export function resetMockPendingReviews() {
  storage.remove(PENDING_REVIEWS_KEY);
}
