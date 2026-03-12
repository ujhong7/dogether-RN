import type { Group } from '../../../models/group';

export interface GroupRepository {
  checkParticipating(): Promise<boolean>;
  getGroups(): Promise<Group[]>;
}
