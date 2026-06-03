// MARK: - 유저 API Repository 구현
//
// 역할: UserRepository interface를 실제 서버 API 호출로 구현합니다.
// 읽는 법: "응답 타입 -> mapping helper -> API method" 순서로 보면 서버 응답이 앱 모델로 바뀌는 흐름이 보입니다.

import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiEnvelope } from '../../../types/api';
import type { Profile } from '../../../models/profile';
import type { Ranking, RankingHistoryReadStatus } from '../../../models/ranking';
import type { CertificationListData, CertificationListSort } from '../../../models/certificationList';
import type { StatisticsData } from '../../../models/statistics';
import type { UserRepository } from '../contracts/userRepository';
import { toAppError } from '../../errors/appError';
import { getAppError } from '../../../models/error';

// MARK: - API response types
//
// 서버 응답의 원본 shape입니다. 화면에서 직접 쓰기보다 아래 mapping 과정을 거쳐 앱 모델로 바꿉니다.
type MyProfileResponse = {
  name: string;
  profileImageUrl?: string;
};

type RankingResponse = {
  ranking: Array<{
    memberId?: number;
    rank?: number;
    name?: string;
    achievementRate?: number;
    profileImageUrl?: string;
    historyReadStatus?: string | null;
  }>;
};

type GroupSummaryResponse = {
  certificationPeriods: Array<{
    day: number;
    createdCount: number;
    certificatedCount: number;
    certificationRate: number;
  }>;
  ranking: {
    totalMemberCount: number;
    myRank: number;
  };
};

type CertificationStatsResponse = {
  certificatedCount: number;
  approvedCount: number;
  rejectedCount: number;
};

type MyActivityResponse = {
  certifications: Array<{
    groupedBy: string;
    certificationInfo: Array<{
      id: number;
      groupId?: number;
      challengeGroupId?: number;
      groupName?: string;
      startAt?: string;
      startDate?: string;
      content: string;
      status: string;
      certificationContent: string;
      certificationMediaUrl: string;
      reviewFeedback?: string | null;
    }>;
  }>;
  pageInfo: {
    recentPageNumber: number;
    hasNext: boolean;
  };
};

type GroupsResponse = {
  joiningChallengeGroups: Array<{
    groupId?: number;
    id?: number;
    groupName?: string;
    name?: string;
    startAt?: string;
    startDate?: string;
  }>;
};

function requireString(value: unknown) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw getAppError('COMMON');
  }

  return normalized;
}

function requireNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw getAppError('COMMON');
  }

  return parsed;
}

// MARK: - Certification list helpers

function formatSectionDate(value: string) {
  return value;
}

function mapCertificationStatus(status: string) {
  switch (status.toUpperCase()) {
    case 'REVIEW_PENDING':
    case 'WAIT_APPROVAL':
      return 'WAIT_APPROVAL' as const;
    case 'APPROVE':
    case 'APPROVED':
      return 'APPROVED' as const;
    case 'REJECT':
    case 'REJECTED':
      return 'REJECTED' as const;
    default:
      throw getAppError('COMMON');
  }
}

// MARK: - Group metadata helpers

function formatGroupDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return undefined;
  }

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${year.slice(2)}.${month}.${day}`;
  }

  throw getAppError('COMMON');
}

// MARK: - Ranking helpers

function mapHistoryReadStatus(value: unknown): RankingHistoryReadStatus {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'READ_YET') {
    return 'READ_YET';
  }
  if (normalized === 'READ_ALL') {
    return 'READ_ALL';
  }
  return null;
}

export class UserRepositoryImpl implements UserRepository {
  // MARK: - Ranking
  //
  // 그룹 id 기준으로 랭킹 목록을 조회하고, 누가 읽을 인증 히스토리가 있는지도 함께 mapping합니다.
  async getRanking(groupId: number): Promise<Ranking[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<RankingResponse>>(endpoints.groups.ranking(groupId));
      return (res.data.data?.ranking ?? []).map((raw) => ({
        memberId: requireNumber(raw.memberId),
        rank: requireNumber(raw.rank),
        name: requireString(raw.name),
        achievementRate: requireNumber(raw.achievementRate),
        profileImageUrl: raw.profileImageUrl,
        historyReadStatus: mapHistoryReadStatus(raw.historyReadStatus),
      }));
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - My profile
  //
  // 마이페이지 상단에 보여줄 내 이름/프로필 이미지를 조회합니다.
  async getMyProfile(): Promise<Profile> {
    try {
      const res = await apiClient.get<ApiEnvelope<MyProfileResponse>>(endpoints.my.profile);
      return {
        name: requireString(res.data.data?.name),
        imageUrl: res.data.data?.profileImageUrl,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Statistics
  //
  // 통계 화면은 그룹 활동 요약과 인증 통계가 모두 필요해서 두 API를 병렬로 호출합니다.
  async getStatistics(groupId: number): Promise<StatisticsData> {
    try {
      const [activityRes, statsRes] = await Promise.all([
        apiClient.get<ApiEnvelope<GroupSummaryResponse>>(endpoints.my.groupActivity(groupId)),
        apiClient.get<ApiEnvelope<CertificationStatsResponse>>(endpoints.my.certificationStats, {
          params: { groupId },
        }),
      ]);

      const activity = activityRes.data.data;
      const stats = statsRes.data.data;
      if (!activity || !stats) {
        throw getAppError('COMMON');
      }

      return {
        achievements: (activity.certificationPeriods ?? []).map((item) => ({
          day: requireNumber(item.day),
          createdCount: requireNumber(item.createdCount),
          certificatedCount: requireNumber(item.certificatedCount),
          certificationRate: requireNumber(item.certificationRate),
        })),
        totalMembers: activity.ranking ? requireNumber(activity.ranking.totalMemberCount) : 0,
        myRank: activity.ranking ? requireNumber(activity.ranking.myRank) : 0,
        certificatedCount: requireNumber(stats.certificatedCount),
        approvedCount: requireNumber(stats.approvedCount),
        rejectedCount: requireNumber(stats.rejectedCount),
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Certification list
  //
  // 인증 목록 화면 데이터입니다. 정렬 기준에 따라 section title과 item metadata가 달라집니다.
  async getCertificationList(sort: CertificationListSort): Promise<CertificationListData> {
    try {
      const [statsRes, groupsRes] = await Promise.all([
        apiClient.get<ApiEnvelope<CertificationStatsResponse>>(endpoints.my.certificationStats),
        apiClient.get<ApiEnvelope<GroupsResponse>>(endpoints.groups.my),
      ]);

      const groupsByName = new Map(
        (groupsRes.data.data?.joiningChallengeGroups ?? []).map((group) => [
          requireString(group.groupName ?? group.name),
          {
            id: requireNumber(group.groupId ?? group.id),
            startDate: formatGroupDate(group.startAt ?? group.startDate),
          },
        ]),
      );

      const sortBy = sort === 'TODO_COMPLETION_DATE' ? 'CERTIFICATED_AT' : 'GROUP_CREATED_AT';
      const allSections: CertificationListData['sections'] = [];
      let page = 0;
      let hasNext = true;

      // MARK: Pagination
      //
      // 서버가 page 단위로 내려주므로 hasNext가 false가 될 때까지 모든 section을 모읍니다.
      while (hasNext) {
        const activityRes = await apiClient.get<ApiEnvelope<MyActivityResponse>>(endpoints.my.certifications, {
          params: {
            sortBy,
            page: String(page),
          },
        });

        const activity = activityRes.data.data;
        const mappedSections = (activity?.certifications ?? []).map((section, sectionIndex) => {
          const groupMeta = groupsByName.get(section.groupedBy);

          return {
            key: `${sort}:${page}:${sectionIndex}:${section.groupedBy}`,
            title: sort === 'TODO_COMPLETION_DATE' ? formatSectionDate(section.groupedBy) : section.groupedBy,
            items: (section.certificationInfo ?? []).map((item) => {
              const itemGroupId = item.groupId ?? item.challengeGroupId;
              const itemGroupName = item.groupName;
              const itemGroupStartDate = item.startAt ?? item.startDate;
              const resolvedGroupMeta:
                | { id?: number; startDate?: string }
                | undefined =
                groupMeta ??
                (itemGroupName ? groupsByName.get(itemGroupName) : undefined) ??
                (itemGroupId
                  ? {
                      id: itemGroupId,
                      startDate: formatGroupDate(itemGroupStartDate),
                    }
                  : undefined);

              return {
                todoId: requireNumber(item.id),
                groupId: resolvedGroupMeta?.id,
                groupName: sort === 'GROUP_CREATION_DATE' ? section.groupedBy : itemGroupName ?? '',
                groupStartDate: resolvedGroupMeta?.startDate,
                date: sort === 'TODO_COMPLETION_DATE' ? section.groupedBy : '',
                content: item.content,
                status: mapCertificationStatus(item.status),
                certificationMediaUrl: item.certificationMediaUrl,
                certificationContent: item.certificationContent,
                reviewFeedback: item.reviewFeedback ?? undefined,
              };
            }),
          };
        });

        allSections.push(...mappedSections);
        hasNext = Boolean(activity?.pageInfo?.hasNext);
        page += 1;
      }

      const stats = statsRes.data.data;

      return {
        summary: {
          achievementCount: stats ? requireNumber(stats.certificatedCount) : 0,
          approvedCount: stats ? requireNumber(stats.approvedCount) : 0,
          rejectedCount: stats ? requireNumber(stats.rejectedCount) : 0,
        },
        sections: allSections,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}
