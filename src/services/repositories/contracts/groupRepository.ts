// MARK: - 그룹 Repository Contract
//
// 역할: 그룹 기능에 필요한 데이터 동작을 interface로 정의합니다.
// 읽는 법: UseCase/Hook이 기대하는 데이터 기능의 목록을 먼저 보고, 실제 구현은 impl/mock 파일에서 확인합니다.
// iOS 비유: Swift의 protocol입니다. API 구현체와 Mock 구현체가 같은 약속을 따르게 합니다.
// 주요 선언: `CreateGroupInput`, `JoinGroupResult`, `GroupRepository`.

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

// TypeScript의 interface는 런타임 객체를 만들지 않고 "모양"만 정의합니다.
// Swift protocol처럼 class가 implements해서 같은 메서드 목록을 제공하게 만들 수 있습니다.
export interface GroupRepository {
  checkParticipating(): Promise<boolean>;
  getGroups(): Promise<Group[]>;
  createGroup(input: CreateGroupInput): Promise<Group>;
  joinGroupByCode(code: string): Promise<JoinGroupResult>;
  saveLastSelectedGroup(groupId: number): Promise<void>;
  leaveGroup(groupId: number): Promise<Group[]>;
}
