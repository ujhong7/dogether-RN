import { QueryClient } from '@tanstack/react-query';

// MARK: - React Query Client
//
// React Query의 전역 설정입니다.
// 서버에서 받아온 데이터는 queryKey 단위로 캐싱되고, 같은 queryKey를 쓰는 화면끼리 결과를 공유합니다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 네트워크 오류가 났을 때 한 번 더 재시도합니다. 너무 많이 재시도하면 UX가 답답해질 수 있습니다.
      retry: 1,
      // 30초 동안은 "아직 신선한 데이터"로 보고 불필요한 재요청을 줄입니다.
      staleTime: 1000 * 30,
    },
  },
});
