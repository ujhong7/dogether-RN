// MARK: - API path builder
//
// 역할: endpoint 파일들이 문자열을 직접 이어 붙이지 않고 타입이 있는 helper로 REST path를 만들게 합니다.
// 읽는 법: v1/v2로 base path를 만들고, child/byId로 하위 리소스를 붙입니다.
// 예: byId(v1('/groups'), 3, '/ranking') -> '/api/v1/groups/3/ranking'

type ApiVersion = 'v1' | 'v2';

type ApiPath = `/api/${ApiVersion}/${string}`;
type ResourcePath = `/${string}`;
type OptionalResourcePath = ResourcePath | '';

const api = (version: ApiVersion, path: ResourcePath): ApiPath => `/api/${version}${path}`;

// MARK: - Version helpers

export const v1 = (path: ResourcePath): ApiPath => api('v1', path);

export const v2 = (path: ResourcePath): ApiPath => api('v2', path);

// MARK: - Composition helpers

export const child = (base: ApiPath, path: ResourcePath): ApiPath => `${base}${path}`;

export const byId = (base: ApiPath, id: number, path: OptionalResourcePath = ''): ApiPath => `${base}/${id}${path}`;
