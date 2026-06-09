# 네트워크 / API 흐름 읽는 법

이 문서는 Dogether RN 프로젝트에서 API 요청이 어디서 시작되고, 어떤 계층을 거쳐 서버로 나가고, 응답이 어떻게 앱 모델로 바뀌는지 설명합니다.

핵심은 화면이 `axios`나 endpoint를 직접 알지 않고, Repository 계층이 네트워크 세부사항을 담당한다는 점입니다.

## 큰 흐름

네트워크 요청은 대체로 아래 흐름을 따릅니다.

```text
Screen
  -> Hook / Query / Mutation
    -> UseCase
      -> Repository contract
        -> RepositoryImpl
          -> apiClient
            -> endpoint
            -> Authorization header
            -> server
          -> response mapping
          -> App model
```

예를 들어 메인 화면에서 내 투두 목록을 가져오는 흐름은 다음과 같습니다.

```text
MainScreen
  -> useMainScreen
    -> useMyTodosQuery
      -> ChallengeGroupUseCase.getMyTodos()
        -> ChallengeGroupRepository.getMyTodos()
          -> ChallengeGroupRepositoryImpl.getMyTodos()
            -> apiClient.get(endpoints.challengeGroups.myTodos(groupId), { params: { date } })
            -> 서버 응답
            -> mapTodo()
            -> Todo[]
```

## 네트워크 관련 폴더

네트워크 관련 파일은 주로 아래에 있습니다.

```text
src/services/
  api/
    client.ts
    endpoints/
    s3Upload.ts
  errors/
    appError.ts
  repositories/
    impl/
  usecases/
src/types/
  api.ts
```

읽는 순서:

```text
1. RepositoryImpl
2. endpoints
3. apiClient
4. ApiEnvelope
5. mapper 함수
6. error 변환
```

## apiClient

`apiClient`는 모든 서버 요청의 공통 진입점입니다.

파일: `src/services/api/client.ts`

```ts
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

역할:

| 설정 | 의미 |
| --- | --- |
| `baseURL` | API 서버 기본 주소 |
| `timeout` | 요청 최대 대기 시간. 현재 12초 |
| `Content-Type` | JSON 요청 기본 헤더 |
| request interceptor | 요청 직전 access token 자동 첨부 |

iOS로 비유하면 `URLSession` wrapper 또는 Alamofire `Session`에 interceptor를 붙인 구조입니다.

## baseURL

`baseURL`은 `env.apiBaseUrl`에서 옵니다.

```ts
baseURL: env.apiBaseUrl
```

환경별 기본값은 `src/config/env.ts`에서 관리합니다.

```text
mock -> https://api-dev.dogether.site
dev  -> https://api-dev.dogether.site
prod -> https://api.dogether.site
```

실행 스크립트에서 `EXPO_PUBLIC_API_BASE_URL`로 덮어쓸 수도 있습니다.

## Authorization header

API 요청에는 저장된 access token이 자동으로 붙습니다.

```ts
function readAccessToken() {
  return storage.getString(storageKeys.accessToken);
}

function applyAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const accessToken = readAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

apiClient.interceptors.request.use(applyAuthorizationHeader);
```

흐름:

```text
RepositoryImpl에서 apiClient 호출
  -> request interceptor 실행
  -> MMKV에서 access token 읽기
  -> Authorization: Bearer ... 추가
  -> 서버 요청
```

중요한 점:

```text
토큰은 요청 직전에 읽는다.
```

앱 실행 중 로그인/로그아웃으로 토큰이 바뀔 수 있으므로, module load 시점에 한 번만 읽지 않습니다.

## Axios를 쓰는 이유

React Native에는 기본 `fetch`도 있지만, 이 프로젝트는 `axios`를 사용합니다.

Axios의 장점:

| 항목 | 설명 |
| --- | --- |
| JSON 처리 | 요청/응답 JSON 처리가 편함 |
| 4xx/5xx 처리 | HTTP 에러를 Promise reject로 다룸 |
| instance | baseURL, timeout, header를 공통 설정 가능 |
| interceptor | 요청/응답 전후 공통 처리 가능 |
| TypeScript generic | 응답 타입을 `apiClient.get<T>`로 표현 가능 |

## endpoint 구조

API path는 `src/services/api/endpoints` 아래에 모여 있습니다.

```text
endpoints/
  appInfo.ts
  auth.ts
  challengeGroups.ts
  groups.ts
  my.ts
  s3.ts
  todoCertifications.ts
  path.ts
  index.ts
```

`index.ts`에서 하나로 묶습니다.

```ts
export const endpoints = {
  appInfo: appInfoEndpoints,
  auth: authEndpoints,
  groups: groupEndpoints,
  challengeGroups: challengeGroupEndpoints,
  s3: s3Endpoints,
  my: myEndpoints,
  todoCertifications: todoCertificationEndpoints,
};
```

Repository에서는 이렇게 사용합니다.

```ts
apiClient.get(endpoints.groups.my);
apiClient.post(endpoints.auth.login, body);
apiClient.get(endpoints.challengeGroups.myTodos(groupId), { params: { date } });
```

## path helper

`path.ts`는 API path를 만드는 helper입니다.

```ts
export const v1 = (path: ResourcePath): ApiPath => api('v1', path);
export const v2 = (path: ResourcePath): ApiPath => api('v2', path);
export const child = (base: ApiPath, path: ResourcePath): ApiPath => `${base}${path}`;
export const byId = (base: ApiPath, id: number, path: OptionalResourcePath = ''): ApiPath =>
  `${base}/${id}${path}`;
```

예:

```ts
const groups = v1('/groups');

export const groupEndpoints = {
  my: child(groups, '/my'),
  leave: (groupId: number) => byId(groups, groupId, '/leave'),
};
```

결과:

```text
v1('/groups') -> /api/v1/groups
child(groups, '/my') -> /api/v1/groups/my
byId(groups, 3, '/leave') -> /api/v1/groups/3/leave
```

## 주요 endpoint 예시

그룹:

```ts
export const groupEndpoints = {
  create: groups,
  join: child(groups, '/join'),
  checkParticipating: child(groups, '/participating'),
  my: child(groups, '/my'),
  lastSelected: child(groups, '/last-selected'),
  leave: (groupId: number) => byId(groups, groupId, '/leave'),
  ranking: (groupId: number) => byId(groups, groupId, '/ranking'),
};
```

투두/챌린지:

```ts
export const challengeGroupEndpoints = {
  createTodos: (groupId: number) => byId(challengeGroups, groupId, '/todos'),
  myTodos: (groupId: number) => byId(challengeGroups, groupId, '/my-todos'),
  memberTodos: (groupId: number, memberId: number) =>
    child(byId(challengeGroups, groupId), `/challenge-group-members/${memberId}/today-todo-history`),
  certifyTodo: (todoId: number) => byId(todos, todoId, '/certify'),
  readTodo: (todoId: number) => byId(todoHistory, todoId),
};
```

인증:

```ts
export const authEndpoints = {
  login: child(auth, '/login'),
  withdraw: child(auth, '/withdraw'),
  refresh: child(auth, '/refresh'),
};
```

## ApiEnvelope

서버 응답은 공통 envelope 형태로 옵니다.

파일: `src/types/api.ts`

```ts
export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T | null;
};
```

Repository에서는 이렇게 타입을 지정합니다.

```ts
const res = await apiClient.get<ApiEnvelope<{ todos: any[] }>>(...);
```

읽는 법:

```text
Axios response
  -> res.data
    -> ApiEnvelope
      -> res.data.data
        -> 실제 서버 payload
```

예:

```ts
return (res.data.data?.todos ?? []).map(mapTodo);
```

`data`가 null일 수 있으므로 optional chaining과 기본값을 함께 씁니다.

## GET 요청 읽기

예: 내 투두 목록 조회

```ts
const res = await apiClient.get<ApiEnvelope<{ todos: any[] }>>(
  endpoints.challengeGroups.myTodos(groupId),
  {
    params: { date },
  },
);
return (res.data.data?.todos ?? []).map(mapTodo);
```

읽는 순서:

```text
1. endpoint 확인
   -> /api/v1/challenge-groups/{groupId}/my-todos

2. query params 확인
   -> ?date=...

3. 응답 envelope 타입 확인
   -> ApiEnvelope<{ todos: any[] }>

4. payload 꺼내기
   -> res.data.data?.todos

5. 앱 모델로 mapping
   -> mapTodo
```

## POST 요청 읽기

예: 그룹 생성

```ts
const response = await apiClient.post<ApiEnvelope<{ joinCode: string }>>(
  endpoints.groups.create,
  {
    groupName: input.name,
    maximumMemberCount: input.memberCount,
    startAt: input.startAt,
    duration: input.durationDays,
  },
);
```

읽는 순서:

```text
1. 어떤 endpoint로 보내는지 본다.
2. request body가 서버 스펙 이름을 쓰는지 본다.
3. response 타입을 본다.
4. 응답을 앱 모델로 어떻게 바꾸는지 본다.
```

여기서 앱 내부 input은 `name`, `memberCount`지만 서버 body는 `groupName`, `maximumMemberCount`입니다.

이 변환을 Repository가 담당합니다.

## DELETE 요청 읽기

예: 그룹 탈퇴

```ts
await apiClient.delete<ApiEnvelope<null>>(endpoints.groups.leave(groupId));
return this.getGroups();
```

읽는 법:

```text
그룹 탈퇴 API를 호출하고,
성공하면 남은 그룹 목록을 다시 조회해서 반환한다.
```

DELETE 성공 후 화면이 최신 상태를 갖도록 Repository 안에서 `getGroups()`를 다시 호출합니다.

## 서버 응답 mapping

RepositoryImpl은 서버 응답을 앱 내부 모델로 변환합니다.

예: 그룹 mapping

```ts
function mapGroup(raw: any): Group {
  return {
    id: Number(raw.groupId ?? raw.id ?? 1),
    name: String(raw.groupName ?? raw.name ?? 'Dogether Sample Group'),
    currentMember: Number(raw.currentMemberCount ?? raw.currentMember ?? 3),
    maximumMember: Number(raw.maximumMemberCount ?? raw.maximumMember ?? 5),
    status: mapGroupStatus(raw.status),
    startDate: formatGroupDate(raw.startAt ?? raw.startDate),
    endDate: formatGroupDate(raw.endAt ?? raw.endDate),
  };
}
```

예: 투두 상태 mapping

```ts
function mapTodoStatus(value: unknown): Todo['status'] {
  switch (String(value ?? '').toUpperCase()) {
    case 'CERTIFY_PENDING':
    case 'WAIT_CERTIFICATION':
      return 'WAIT_CERTIFICATION';
    case 'REVIEW_PENDING':
    case 'WAIT_APPROVAL':
      return 'WAIT_APPROVAL';
    case 'APPROVE':
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECT':
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'WAIT_CERTIFICATION';
  }
}
```

이렇게 해두면 화면은 서버 필드명과 서버 상태명을 몰라도 됩니다.

```text
서버 naming -> Repository mapping -> 앱 모델 -> 화면
```

## 에러 변환

API 에러는 `src/services/errors/appError.ts`에서 앱 공통 에러로 변환합니다.

```ts
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const code = error.response?.data?.code as AppErrorCode | undefined;
    if (code && KNOWN_ERROR_CODES.includes(code)) {
      return getAppError(code);
    }
  }

  return getAppError('COMMON');
}
```

흐름:

```text
Axios error
  -> 서버 envelope의 code 확인
  -> 앱이 아는 에러 코드면 getAppError(code)
  -> 모르면 COMMON
```

RepositoryImpl은 보통 catch에서 `toAppError`를 던집니다.

```ts
try {
  ...
} catch (error) {
  throw toAppError(error);
}
```

화면은 Axios error를 직접 알 필요 없이 `AppError`만 처리합니다.

## 비즈니스 에러를 결과값으로 반환하는 경우

일부 에러는 throw하지 않고 결과값으로 반환합니다.

예: 그룹 참여

```ts
export type JoinGroupResult =
  | { ok: true; group: Group }
  | { ok: false; code: Extract<AppErrorCode, 'CGF-0002' | 'CGF-0003' | 'CGF-0004' | 'CGF-0005'> };
```

`joinGroupByCode`는 이미 참여한 그룹, 인원 초과, 유효하지 않은 그룹 같은 비즈니스 에러를 화면이 modal로 분기할 수 있게 `ok: false`로 반환합니다.

```text
네트워크 장애/알 수 없는 에러 -> throw
화면에서 분기할 비즈니스 에러 -> { ok: false, code }
```

## S3 이미지 업로드 흐름

인증 이미지는 서버 API에 파일을 직접 보내지 않습니다.

흐름:

```text
CertificationContentScreen
  -> ChallengeGroupUseCase.certifyTodo()
    -> ChallengeGroupRepositoryImpl.certifyTodo()
      -> uploadImageToS3(localUri)
        -> presigned URL 요청
        -> 로컬 파일 업로드
        -> query string 제거한 public URL 반환
      -> apiClient.post(certifyTodo, { content, mediaUrl })
```

`uploadImageToS3`는 세 단계로 읽습니다.

### 1. presigned URL 요청

```ts
const response = await apiClient.post<ApiEnvelope<PresignedUrlResponse>>(
  endpoints.s3.presignedUrls,
  {
    dailyTodoId: 0,
    uploadFileTypes: ['IMAGE'],
  },
);
```

서버에서 S3 업로드용 URL을 받습니다.

### 2. 로컬 URI 정규화

Android의 `content://` URI는 바로 업로드하기 어려울 수 있어 cache 파일로 복사합니다.

```ts
const normalizedLocalUri = await normalizeLocalImageUri(localUri);
```

### 3. 플랫폼별 업로드

Android:

```ts
const imageBase64 = await FileSystem.readAsStringAsync(normalizedLocalUri, {
  encoding: FileSystem.EncodingType.Base64,
});
const uploadBytes = toByteArray(imageBase64);

await fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': UPLOAD_CONTENT_TYPE },
  body: uploadBuffer,
});
```

iOS:

```ts
await FileSystem.uploadAsync(presignedUrl, normalizedLocalUri, {
  httpMethod: 'PUT',
  headers: { 'Content-Type': UPLOAD_CONTENT_TYPE },
  uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
});
```

업로드 후에는 presigned URL의 query string을 제거한 URL을 반환합니다.

```ts
return stripQueryString(presignedUrl);
```

## 인증 제출 API 흐름

인증 제출은 네트워크 흐름이 조금 길기 때문에 읽기 좋은 예시입니다.

```text
CertificationContentScreen.handleSubmit
  -> challengeGroupUseCase.certifyTodo(
       groupId,
       date,
       todoId,
       content,
       imageUri
     )
  -> ChallengeGroupRepositoryImpl.certifyTodo
  -> uploadImageToS3(imageUri)
  -> apiClient.post(endpoints.challengeGroups.certifyTodo(todoId), {
       content,
       mediaUrl: uploadedMediaUrl,
     })
  -> getMyTodos(groupId, date)
  -> 인증된 todo 찾기
  -> query invalidate
  -> router.replace('/main')
```

여기서 네트워크 요청은 두 번 이상 발생합니다.

```text
1. presigned URL 요청
2. S3 PUT 업로드
3. 인증 API POST
4. 최신 투두 목록 GET
```

## 로그인 API 흐름

로그인은 native SDK와 서버 API가 함께 있습니다.

Kakao 예:

```text
useOnboarding
  -> loginWithKakao()
  -> getProfile()
  -> AuthUseCase.loginWithKakao({ providerId, name })
  -> AuthRepositoryImpl.loginWithKakao()
  -> loginWithProvider()
  -> apiClient.post(endpoints.auth.login, {
       loginType: 'KAKAO',
       providerId,
       name,
     })
  -> AuthSession 반환
  -> sessionStore.login()
  -> MMKV 저장
```

Repository는 서버 로그인 응답을 앱 세션 모델로 변환합니다.

```ts
return {
  accessToken: response.data.data?.accessToken ?? '',
  refreshToken: null,
  userName: responseName || payload.name,
  loginType: payload.appLoginType,
  appleUserIdentifier: payload.appleUserIdentifier ?? null,
  hasCompletedStartFlow: false,
};
```

## Query invalidation과 네트워크 재요청

서버 상태가 바뀌면 React Query cache를 무효화합니다.

예: 인증 제출 후

```ts
await queryClient.invalidateQueries({ queryKey: ['todos'] });
await queryClient.invalidateQueries({ queryKey: ['certification-list'] });
await queryClient.invalidateQueries({ queryKey: ['statistics'] });
```

뜻:

```text
투두, 인증 목록, 통계 데이터가 낡았으니 다시 가져와야 한다.
```

네트워크 흐름을 읽을 때는 API 호출만 보지 말고, 이후 어떤 query가 무효화되는지도 같이 봐야 합니다.

## Mock 환경에서는 어떻게 되나?

Mock 환경에서는 Repository factory가 API 구현체 대신 Mock 구현체를 반환합니다.

```ts
export function createGroupRepository() {
  return env.useMockGroups ? new MockGroupRepository() : new GroupRepositoryImpl();
}
```

흐름:

```text
Screen
  -> UseCase
    -> Repository contract
      -> MockRepository
        -> mock data
```

이 경우 `apiClient`를 타지 않습니다.

```text
MockRepository를 쓰면 실제 HTTP 요청은 발생하지 않는다.
```

## 네트워크 흐름 읽는 순서

어떤 API 흐름을 추적할 때는 아래 순서로 보면 좋습니다.

```text
1. 화면 이벤트를 찾는다.
   -> 버튼 onPress, submit 함수, query hook 호출

2. UseCase 호출을 찾는다.
   -> groupUseCase.createGroup, challengeGroupUseCase.certifyTodo 등

3. Repository contract를 본다.
   -> 어떤 메서드 약속인지 확인

4. RepositoryImpl을 본다.
   -> 실제 apiClient.get/post/delete 확인

5. endpoint를 확인한다.
   -> endpoints.xxx가 실제 어떤 path인지 확인

6. request body / params를 확인한다.
   -> 서버에 어떤 값을 보내는지 확인

7. ApiEnvelope 타입을 확인한다.
   -> 서버 payload 모양 확인

8. mapping 함수를 본다.
   -> 서버 응답이 앱 모델로 어떻게 바뀌는지 확인

9. catch/toAppError를 본다.
   -> 실패가 화면에 어떤 AppError로 전달되는지 확인

10. invalidateQueries를 본다.
    -> 성공 후 어떤 화면 데이터가 다시 불러와지는지 확인
```

## 서버 응답이 바뀌었을 때 어디를 볼까?

서버 응답 필드명이나 상태값이 바뀌면 먼저 RepositoryImpl의 mapping을 봅니다.

| 문제 | 볼 위치 |
| --- | --- |
| 그룹 이름이 안 나옴 | `groupRepositoryImpl.ts`의 `mapGroup` |
| 투두 상태가 이상함 | `challengeGroupRepositoryImpl.ts`의 `mapTodoStatus` |
| 인증 이미지 URL이 이상함 | `s3Upload.ts`, `certifyTodo` |
| 서버 에러 문구가 이상함 | `errors/appError.ts`, `models/error.ts` |
| endpoint path가 틀림 | `services/api/endpoints/*` |
| 토큰이 안 붙음 | `api/client.ts`, `sessionStorage.ts` |

## 자주 헷갈리는 점

### apiClient는 어디서 호출되나?

대부분 `src/services/repositories/impl/*`에서 호출됩니다. 화면에서 직접 호출하지 않습니다.

### 서버 응답의 실제 data는 어디 있나?

Axios 응답 기준으로 `res.data.data`에 있습니다.

```text
res.data -> ApiEnvelope
res.data.data -> 실제 payload
```

### Authorization header는 어디서 붙나?

`apiClient` request interceptor에서 요청 직전에 MMKV의 access token을 읽어 붙입니다.

### endpoint 문자열은 어디 있나?

`src/services/api/endpoints` 아래에 기능별로 나뉘어 있습니다.

### S3 업로드도 apiClient를 쓰나?

presigned URL 요청은 `apiClient`를 씁니다. 실제 S3 PUT 업로드는 플랫폼에 따라 `fetch` 또는 `FileSystem.uploadAsync`를 사용합니다.

### Mock 환경에서도 API 요청이 나가나?

해당 feature가 mock repository를 쓰면 실제 API 요청은 나가지 않습니다. env flag와 `repositories/index.ts`를 확인해야 합니다.

## 한 줄 요약

```text
Dogether RN의 네트워크 흐름은
화면 이벤트나 query에서 UseCase로 시작해,
RepositoryImpl에서 endpoint와 apiClient를 통해 서버로 나가고,
ApiEnvelope 응답을 mapper로 앱 모델로 바꾸며,
에러는 toAppError로 공통 AppError로 변환하고,
성공 후 필요한 query를 invalidate해서 화면 데이터를 최신화하는 구조다.
```
