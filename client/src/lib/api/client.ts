// Generic HTTP transport for the ResolveAI backend.
// Only public, non-sensitive endpoints should be called from here.

import { getApiBaseUrl } from './config';
import { ApiError } from './errors';

// Joins the configured base URL with an endpoint path consistently.
export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}

// Performs a GET request and parses the JSON response body.
// Pass an AbortSignal to cancel the request (e.g. on component unmount).
// Aborts reject with the DOMException as-is, so callers can keep checking
// `signal.aborted` to ignore unmount cleanup.
export async function apiGetJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(apiUrl(path), { signal });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    // Network failure (server unreachable, DNS, offline). The underlying
    // browser message is not shown to avoid leaking environment details.
    void error;
    throw new ApiError('network', 'Request failed.');
  }

  if (!response.ok) {
    // Status and statusText are safe protocol metadata, not response bodies.
    throw new ApiError(
      'http',
      `API responded with status ${response.status} ${response.statusText}`.trim(),
      response.status,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'parse',
      `API returned an unreadable response for ${path}.`,
      response.status,
    );
  }

  return data as T;
}
