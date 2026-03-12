import type { Group } from '../../domain/entities/group';
import { storage } from '../../lib/storage';

const JOINED_GROUPS_KEY = 'mockJoinedGroups';
const NEXT_GROUP_ID_KEY = 'mockNextGroupId';

const seededJoinableGroups: Group[] = [
  {
    id: 101,
    name: 'DND 작심삼일 탈출러',
    currentMember: 5,
    maximumMember: 6,
    joinCode: '12345678',
    status: 'running',
    duration: 10,
    progress: 0.5,
    startDate: '25.02.01',
    endDate: '25.02.22',
  },
  {
    id: 102,
    name: '배고픈 민족들',
    currentMember: 4,
    maximumMember: 6,
    joinCode: '87654321',
    status: 'running',
    duration: 14,
    progress: 0.64,
    startDate: '25.02.03',
    endDate: '25.02.28',
  },
  {
    id: 103,
    name: '꽉 찬 그룹',
    currentMember: 6,
    maximumMember: 6,
    joinCode: 'FULL0001',
    status: 'running',
    duration: 7,
    progress: 0.3,
    startDate: '25.02.05',
    endDate: '25.02.15',
  },
];

function formatDate(date: Date) {
  return `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function readGroups(): Group[] {
  const raw = storage.getString(JOINED_GROUPS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Group[];
  } catch {
    return [];
  }
}

function writeGroups(groups: Group[]) {
  storage.set(JOINED_GROUPS_KEY, JSON.stringify(groups));
}

function readNextGroupId() {
  return storage.getNumber(NEXT_GROUP_ID_KEY) ?? 1000;
}

function writeNextGroupId(nextId: number) {
  storage.set(NEXT_GROUP_ID_KEY, nextId);
}

export function getMockJoinedGroups() {
  return readGroups();
}

export function hasMockJoinedGroups() {
  return readGroups().length > 0;
}

export function createMockGroup(input: {
  name: string;
  memberCount: number;
  durationDays: number;
  startDateLabel: string;
  endDateLabel: string;
  joinCode: string;
}) {
  const nextId = readNextGroupId();
  const group: Group = {
    id: nextId,
    name: input.name,
    currentMember: 1,
    maximumMember: input.memberCount,
    joinCode: input.joinCode,
    status: input.endDateLabel === formatDate(new Date()) ? 'dDay' : 'running',
    duration: input.durationDays,
    progress: 0,
    startDate: input.startDateLabel,
    endDate: input.endDateLabel,
  };

  writeGroups([group, ...readGroups()]);
  writeNextGroupId(nextId + 1);
  return group;
}

export type JoinMockGroupResult =
  | { ok: true; group: Group }
  | { ok: false; reason: 'full' | 'joined' | 'invalid' };

export function joinMockGroupByCode(code: string): JoinMockGroupResult {
  const normalizedCode = code.trim().toUpperCase();
  const joinedGroups = readGroups();

  if (joinedGroups.some((group) => group.joinCode.toUpperCase() === normalizedCode)) {
    return { ok: false, reason: 'joined' };
  }

  const target = seededJoinableGroups.find((group) => group.joinCode.toUpperCase() === normalizedCode);
  if (!target) {
    return { ok: false, reason: 'invalid' };
  }

  if (target.currentMember >= target.maximumMember) {
    return { ok: false, reason: 'full' };
  }

  const joinedGroup: Group = {
    ...target,
    currentMember: Math.min(target.currentMember + 1, target.maximumMember),
  };

  writeGroups([joinedGroup, ...joinedGroups]);
  return { ok: true, group: joinedGroup };
}

export function resetMockJoinedGroups() {
  storage.remove(JOINED_GROUPS_KEY);
  storage.remove(NEXT_GROUP_ID_KEY);
}
