export const endpoints = {
  appInfo: {
    checkUpdate: '/api/v1/app-info/force-update-check',
  },
  auth: {
    login: '/api/v1/auth/login',
    withdraw: '/api/v1/auth/withdraw',
    refresh: '/api/v1/auth/refresh',
  },
  groups: {
    checkParticipating: '/api/v1/groups/participating',
    my: '/api/v1/groups/my',
    ranking: (groupId: number) => `/api/v1/groups/${groupId}/ranking`,
  },
  challengeGroups: {
    createTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/todos`,
    myTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/my-todos`,
  },
  my: {
    profile: '/api/v1/my/profile',
  },
};
