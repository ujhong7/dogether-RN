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
    create: '/api/v1/groups',
    join: '/api/v1/groups/join',
    checkParticipating: '/api/v1/groups/participating',
    my: '/api/v1/groups/my',
    lastSelected: '/api/v1/groups/last-selected',
    leave: (groupId: number) => `/api/v1/groups/${groupId}/leave`,
    ranking: (groupId: number) => `/api/v1/groups/${groupId}/ranking`,
  },
  challengeGroups: {
    createTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/todos`,
    myTodos: (groupId: number) => `/api/v1/challenge-groups/${groupId}/my-todos`,
    memberTodos: (groupId: number, memberId: number) =>
      `/api/v1/challenge-groups/${groupId}/challenge-group-members/${memberId}/today-todo-history`,
    certifyTodo: (todoId: number) => `/api/v1/todos/${todoId}/certify`,
    readTodo: (todoId: number) => `/api/v1/todo-history/${todoId}`,
  },
  s3: {
    presignedUrls: '/api/v1/s3/presigned-urls',
  },
  my: {
    profile: '/api/v1/my/profile',
    certifications: '/api/v2/my/certifications',
    certificationStats: '/api/v2/my/certification-stats',
    groupActivity: (groupId: number) => `/api/v2/my/groups/${groupId}/activity-summary`,
  },
  todoCertifications: {
    pendingReview: '/api/v1/todo-certifications/pending-review',
    review: (todoId: number) => `/api/v1/todo-certifications/${todoId}/review`,
  },
};
