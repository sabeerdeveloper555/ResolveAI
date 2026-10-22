// Public surface of the ResolveAI API client.
// Import API helpers from '@/lib/api' (this barrel) rather than deep modules.

export { apiUrl, apiGetJson } from './client';
export { getApiBaseUrl } from './config';
export { ApiError, getErrorMessage, type ApiErrorKind } from './errors';
export { fetchApiHealth, type ApiHealth } from './health';
export { queryKeys } from './query-keys';
export { useApiHealthQuery } from './queries/useHealthQuery';
