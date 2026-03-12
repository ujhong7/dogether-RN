export const endpoints = {
  checkUpdate: '/api/v1/app-info/force-update-check',
  login: '/api/v1/auth/login',
  checkParticipating: '/api/v1/groups/participating',
  groupsMy: '/api/v1/groups/my',
  createTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/todos`,
  myTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/my-todos`,
  ranking: (groupId: number) => `/api/v1/groups/${groupId}/ranking`,
  profile: '/api/v1/my/profile',
};
