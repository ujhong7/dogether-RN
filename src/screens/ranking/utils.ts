// MARK: - Ranking Utils
//
// 역할: 랭킹 화면에서 순위별 강조 색상을 계산합니다.

export function getRankAccent(rank: number) {
  if (rank === 1) return '#F5D04E';
  if (rank === 2) return '#FF5C92';
  if (rank === 3) return '#58A6FF';
  return '#58A6FF';
}
