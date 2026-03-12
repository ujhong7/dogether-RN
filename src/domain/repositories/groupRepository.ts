import type { Group } from '../entities/group';

export interface GroupRepository {
  checkParticipating(): Promise<boolean>;
  getGroups(): Promise<Group[]>;
}
