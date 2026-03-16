import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Profile } from '../../models/profile';
import type { Ranking, RankingHistoryReadStatus } from '../../models/ranking';
import type { CertificationListData, CertificationListSort } from '../../models/certificationList';
import type { StatisticsData } from '../../models/statistics';
import type { UserRepository } from './contracts/userRepository';
import { toAppError } from '../errors/appError';

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

function formatSectionDate(value: string) {
  return value;
}

function mapCertificationStatus(status: string) {
  switch (status.toUpperCase()) {
    case 'REVIEW_PENDING':
      return 'WAIT_APPROVAL' as const;
    case 'APPROVE':
      return 'APPROVED' as const;
    case 'REJECT':
      return 'REJECTED' as const;
    default:
      return 'WAIT_APPROVAL' as const;
  }
}

function formatGroupDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${year.slice(2)}.${month}.${day}`;
  }

  return raw;
}

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
  async getRanking(groupId: number): Promise<Ranking[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<RankingResponse>>(endpoints.groups.ranking(groupId));
      return (res.data.data?.ranking ?? []).map((raw, index) => ({
        memberId: Number(raw.memberId ?? index + 1),
        rank: Number(raw.rank ?? index + 1),
        name: String(raw.name ?? `Member ${index + 1}`),
        achievementRate: Number(raw.achievementRate ?? 0),
        profileImageUrl: raw.profileImageUrl,
        historyReadStatus: mapHistoryReadStatus(raw.historyReadStatus),
      }));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getMyProfile(): Promise<Profile> {
    try {
      const res = await apiClient.get<ApiEnvelope<MyProfileResponse>>(endpoints.my.profile);
      return {
        name: String(res.data.data?.name ?? 'RN Learner'),
        imageUrl: res.data.data?.profileImageUrl,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

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

      return {
        achievements: (activity?.certificationPeriods ?? []).map((item) => ({
          day: Number(item.day ?? 0),
          createdCount: Number(item.createdCount ?? 0),
          certificatedCount: Number(item.certificatedCount ?? 0),
          certificationRate: Number(item.certificationRate ?? 0),
        })),
        totalMembers: Number(activity?.ranking.totalMemberCount ?? 0),
        myRank: Number(activity?.ranking.myRank ?? 0),
        certificatedCount: Number(stats?.certificatedCount ?? 0),
        approvedCount: Number(stats?.approvedCount ?? 0),
        rejectedCount: Number(stats?.rejectedCount ?? 0),
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getCertificationList(sort: CertificationListSort): Promise<CertificationListData> {
    try {
      const [statsRes, groupsRes] = await Promise.all([
        apiClient.get<ApiEnvelope<CertificationStatsResponse>>(endpoints.my.certificationStats),
        apiClient.get<ApiEnvelope<GroupsResponse>>(endpoints.groups.my),
      ]);

      const groupsByName = new Map(
        (groupsRes.data.data?.joiningChallengeGroups ?? []).map((group) => [
          String(group.groupName ?? group.name ?? ''),
          {
            id: Number(group.groupId ?? group.id ?? 0),
            startDate: formatGroupDate(group.startAt ?? group.startDate),
          },
        ]),
      );

      const sortBy = sort === 'TODO_COMPLETION_DATE' ? 'CERTIFICATED_AT' : 'GROUP_CREATED_AT';
      const allSections: CertificationListData['sections'] = [];
      let page = 0;
      let hasNext = true;

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
            items: (section.certificationInfo ?? []).map((item) => ({
              todoId: Number(item.id),
              groupId: groupMeta?.id ?? 0,
              groupName: sort === 'GROUP_CREATION_DATE' ? section.groupedBy : '',
              groupStartDate: groupMeta?.startDate ?? '',
              date: sort === 'TODO_COMPLETION_DATE' ? section.groupedBy : '',
              content: item.content,
              status: mapCertificationStatus(item.status),
              certificationMediaUrl: item.certificationMediaUrl,
              certificationContent: item.certificationContent,
              reviewFeedback: item.reviewFeedback ?? undefined,
            })),
          };
        });

        allSections.push(...mappedSections);
        hasNext = Boolean(activity?.pageInfo?.hasNext);
        page += 1;
      }

      const stats = statsRes.data.data;

      return {
        summary: {
          achievementCount: Number(stats?.certificatedCount ?? 0),
          approvedCount: Number(stats?.approvedCount ?? 0),
          rejectedCount: Number(stats?.rejectedCount ?? 0),
        },
        sections: allSections,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}
