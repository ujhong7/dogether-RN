import type { Profile } from '../../../models/profile';
import type { Ranking } from '../../../models/ranking';
import type {
  CertificationListData,
  CertificationListItem,
  CertificationListSection,
  CertificationListSort,
} from '../../../models/certificationList';
import type { StatisticsData } from '../../../models/statistics';
import type { UserRepository } from '../contracts/userRepository';
import { getMockJoinedGroups } from './data/mockGroupData';
import { getAllMockTodoEntries } from './data/mockTodoData';

const mockRanking: Ranking[] = [
  { memberId: 1, rank: 1, name: '승용차', achievementRate: 100, historyReadStatus: 'READ_YET' },
  { memberId: 2, rank: 2, name: '승용차', achievementRate: 80, historyReadStatus: 'READ_ALL' },
  { memberId: 3, rank: 3, name: '승용차', achievementRate: 50, historyReadStatus: null },
  { memberId: 4, rank: 4, name: '영재', achievementRate: 50, historyReadStatus: 'READ_YET' },
  { memberId: 5, rank: 5, name: '지호', achievementRate: 45, historyReadStatus: 'READ_ALL' },
  { memberId: 6, rank: 5, name: '지호', achievementRate: 45, historyReadStatus: null },
];

const mockProfile: Profile = {
  name: 'RN Learner',
};

const KOREAN_WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function parseDate(value: string) {
  if (value.includes('-')) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const [year, month, day] = value.split('.').map(Number);
  return new Date(2000 + year, month - 1, day);
}

function formatSectionDate(value: string) {
  const date = parseDate(value);
  const weekDay = KOREAN_WEEK_DAYS[date.getDay()];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day} (${weekDay})`;
}

function parseGroupDate(dateLabel: string | undefined) {
  if (!dateLabel) {
    return null;
  }

  const [year, month, day] = dateLabel.split('.').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(2000 + year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getCurrentGroupDay(startDateLabel: string | undefined, duration: number) {
  const startDate = parseGroupDate(startDateLabel);
  if (!startDate) {
    return 1;
  }

  const today = startOfDay(new Date());
  const startDateAtMidnight = startOfDay(startDate);
  const diff = Math.floor((today.getTime() - startDateAtMidnight.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Math.min(Math.max(diff, 1), Math.max(duration, 1));
}

function getMockWrittenTodoCount(groupId: number, day: number) {
  return Math.min(10, ((groupId + day) % 3) + 2);
}

function buildMockStatistics(groupId: number): StatisticsData {
  const group = getMockJoinedGroups().find((item) => item.id === groupId) ?? getMockJoinedGroups()[0];
  if (!group) {
    return {
      achievements: [],
      totalMembers: 0,
      myRank: 0,
      certificatedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    };
  }

  const currentDay = getCurrentGroupDay(group.startDate, group.duration);
  const achievements = Array.from({ length: currentDay }, (_, index) => {
    const day = index + 1;
    const createdCount = getMockWrittenTodoCount(group.id, day);
    const certificatedCount = Math.max(createdCount - 1, 0);
    return {
      day,
      createdCount,
      certificatedCount,
      certificationRate: createdCount === 0 ? 0 : Math.round((certificatedCount / createdCount) * 100),
    };
  });

  return {
    achievements,
    totalMembers: group.currentMember + 4,
    myRank: Math.min(group.currentMember, 5),
    certificatedCount: achievements.reduce((total, item) => total + item.certificatedCount, 0),
    approvedCount: achievements.reduce((total, item) => total + Math.max(item.certificatedCount - 1, 0), 0),
    rejectedCount: achievements.length,
  };
}

function buildMockCertificationList(sort: CertificationListSort): CertificationListData {
  const groups = getMockJoinedGroups();
  if (groups.length === 0) {
    return {
      summary: {
        achievementCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      sections: [],
    };
  }

  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const items: CertificationListItem[] = getAllMockTodoEntries()
    .filter((entry) => groupMap.has(entry.groupId))
    .flatMap((entry) => {
      const group = groupMap.get(entry.groupId);
      if (!group) {
        return [];
      }

      return entry.todos
        .filter((todo): todo is typeof todo & { certificationMediaUrl: string; status: 'WAIT_APPROVAL' | 'APPROVED' | 'REJECTED' } => {
          if (todo.status === 'WAIT_CERTIFICATION') {
            return false;
          }

          return Boolean(todo.certificationMediaUrl);
        })
        .map((todo) => ({
          todoId: todo.id,
          groupId: group.id,
          groupName: group.name,
          groupStartDate: group.startDate,
          date: entry.date,
          content: todo.content,
          status: todo.status,
          certificationMediaUrl: todo.certificationMediaUrl,
          certificationContent: todo.certificationContent,
          reviewFeedback: todo.reviewFeedback,
        }));
    });

  const sortedItems = [...items].sort((left, right) => {
    if (sort === 'TODO_COMPLETION_DATE') {
      if (left.date === right.date) {
        return right.todoId - left.todoId;
      }
      return right.date.localeCompare(left.date);
    }

    const groupDateDiff = parseDate(right.groupStartDate).getTime() - parseDate(left.groupStartDate).getTime();
    if (groupDateDiff !== 0) {
      return groupDateDiff;
    }
    if (left.groupId !== right.groupId) {
      return right.groupId - left.groupId;
    }
    if (left.date === right.date) {
      return right.todoId - left.todoId;
    }
    return right.date.localeCompare(left.date);
  });

  const sectionsMap = new Map<string, CertificationListSection>();

  sortedItems.forEach((item) => {
    const sectionKey = sort === 'TODO_COMPLETION_DATE' ? `date:${item.date}` : `group:${item.groupId}`;
    const sectionTitle = sort === 'TODO_COMPLETION_DATE' ? formatSectionDate(item.date) : item.groupName;
    const existingSection = sectionsMap.get(sectionKey);

    if (existingSection) {
      existingSection.items.push(item);
      return;
    }

    sectionsMap.set(sectionKey, {
      key: sectionKey,
      title: sectionTitle,
      items: [item],
    });
  });

  return {
    summary: {
      achievementCount: items.length,
      approvedCount: items.filter((item) => item.status === 'APPROVED').length,
      rejectedCount: items.filter((item) => item.status === 'REJECTED').length,
    },
    sections: Array.from(sectionsMap.values()),
  };
}

export class MockUserRepository implements UserRepository {
  async getRanking(): Promise<Ranking[]> {
    return mockRanking;
  }

  async getMyProfile(): Promise<Profile> {
    return mockProfile;
  }

  async getStatistics(groupId: number): Promise<StatisticsData> {
    return buildMockStatistics(groupId);
  }

  async getCertificationList(sort: CertificationListSort): Promise<CertificationListData> {
    return buildMockCertificationList(sort);
  }
}
