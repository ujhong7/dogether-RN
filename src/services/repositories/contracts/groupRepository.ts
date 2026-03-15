import type { Group } from '../../../models/group';
import type { AppErrorCode } from '../../../models/error';

export type CreateGroupInput = {
  name: string;
  memberCount: number;
  durationDays: number;
  startAt: 'TODAY' | 'TOMORROW';
};

export type JoinGroupResult =
  | { ok: true; group: Group }
  | { ok: false; code: Extract<AppErrorCode, 'CGF-0002' | 'CGF-0003' | 'CGF-0004' | 'CGF-0005'> };

export interface GroupRepository {
  checkParticipating(): Promise<boolean>;
  getGroups(): Promise<Group[]>;
  createGroup(input: CreateGroupInput): Promise<Group>;
  joinGroupByCode(code: string): Promise<JoinGroupResult>;
  leaveGroup(groupId: number): Promise<Group[]>;
}
