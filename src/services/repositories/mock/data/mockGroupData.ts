// MARK: - 그룹 Mock 데이터 저장소
//
// 역할: mock 모드에서 참여 그룹 목록을 MMKV에 저장하고, 초대 코드 참여용 seed 그룹을 제공합니다.
// 읽는 법: "seed 그룹 -> storage helper -> 조회/생성/참여/탈퇴" 순서로 보면 됩니다.

import type { Group } from '../../../../models/group';
import type { AppErrorCode } from '../../../../models/error';
import { storage } from '../../../../lib/storage';

const JOINED_GROUPS_KEY = 'mockJoinedGroups';
const NEXT_GROUP_ID_KEY = 'mockNextGroupId';

// MARK: - Joinable seed groups
//
// 그룹 참여 화면에서 초대 코드 입력을 테스트하기 위한 서버 대체 데이터입니다.
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

// MARK: - Date helpers

function formatDate(date: Date) {
  return `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

// MARK: - Storage helpers

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

// MARK: - Read joined groups

export function getMockJoinedGroups() {
  return readGroups();
}

export function hasMockJoinedGroups() {
  return readGroups().length > 0;
}

// MARK: - Create group
//
// 사용자가 입력한 그룹 생성 폼을 Group 모델로 바꾸고 mock 저장소 맨 앞에 추가합니다.
export function createMockGroup(input: {
  name: string;
  memberCount: number;
  durationDays: number;
  startAt: 'TODAY' | 'TOMORROW';
}) {
  const startDate = new Date();
  if (input.startAt === 'TOMORROW') {
    startDate.setDate(startDate.getDate() + 1);
  }
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + input.durationDays - 1);
  const joinCodeBase = input.name.replace(/[^a-zA-Z0-9가-힣]/g, '').slice(0, 3);
  const joinCode = `${joinCodeBase || '두게더'}011210`;
  const nextId = readNextGroupId();
  const group: Group = {
    id: nextId,
    name: input.name,
    currentMember: 1,
    maximumMember: input.memberCount,
    joinCode,
    status: formatDate(endDate) === formatDate(new Date()) ? 'dDay' : 'running',
    duration: input.durationDays,
    progress: 0,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };

  writeGroups([group, ...readGroups()]);
  writeNextGroupId(nextId + 1);
  return group;
}

export type JoinMockGroupResult =
  | { ok: true; group: Group }
  | { ok: false; code: Extract<AppErrorCode, 'CGF-0002' | 'CGF-0003' | 'CGF-0004' | 'CGF-0005'> };

// MARK: - Join group by code
//
// 실제 API처럼 중복 참여/정원 초과/존재하지 않는 코드 에러를 결과값으로 반환합니다.
export function joinMockGroupByCode(code: string): JoinMockGroupResult {
  const normalizedCode = code.trim().toUpperCase();
  const joinedGroups = readGroups();

  if (joinedGroups.some((group) => group.joinCode?.toUpperCase() === normalizedCode)) {
    return { ok: false, code: 'CGF-0002' };
  }

  const target = seededJoinableGroups.find((group) => group.joinCode?.toUpperCase() === normalizedCode);
  if (!target) {
    return { ok: false, code: 'CGF-0005' };
  }

  if (target.currentMember >= target.maximumMember) {
    return { ok: false, code: 'CGF-0003' };
  }

  const joinedGroup: Group = {
    ...target,
    currentMember: Math.min(target.currentMember + 1, target.maximumMember),
  };

  writeGroups([joinedGroup, ...joinedGroups]);
  return { ok: true, group: joinedGroup };
}

// MARK: - Cleanup

export function resetMockJoinedGroups() {
  storage.remove(JOINED_GROUPS_KEY);
  storage.remove(NEXT_GROUP_ID_KEY);
}

export function leaveMockGroup(groupId: number) {
  const nextGroups = readGroups().filter((group) => group.id !== groupId);
  writeGroups(nextGroups);
  return nextGroups;
}
