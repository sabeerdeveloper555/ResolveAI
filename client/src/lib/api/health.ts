// Typed contract for the backend health endpoint (GET /api/health).

import { apiGetJson } from './client';
import { ApiError } from './errors';

export interface ApiHealth {
  status: string;
  service: string;
}

function isApiHealth(value: unknown): value is ApiHealth {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiHealth).status === 'string' &&
    typeof (value as ApiHealth).service === 'string'
  );
}

// Fetches the backend health endpoint. Pass an AbortSignal to cancel the
// request (e.g. on component unmount).
export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  const data = await apiGetJson<unknown>('/api/health', signal);

  if (!isApiHealth(data)) {
    throw new ApiError('shape', 'API returned an unexpected health response.');
  }

  return data;
}
