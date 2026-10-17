// Minimal API client for the ResolveAI backend.
// Only public, non-sensitive endpoints should be called from here.

export interface ApiHealth {
  status: string;
  service: string;
}

const FALLBACK_BASE_URL = 'http://localhost:5000';

// Resolves the backend base URL from the environment, falling back to the
// local dev server when VITE_API_BASE_URL is not set.
export function getApiBaseUrl(): string {
  const baseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  return (baseUrl || FALLBACK_BASE_URL).replace(/\/+$/, '');
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
  const response = await fetch(`${getApiBaseUrl()}/api/health`, { signal });

  if (!response.ok) {
    throw new Error(
      `API responded with status ${response.status} ${response.statusText}`.trim(),
    );
  }

  const data: unknown = await response.json();

  if (!isApiHealth(data)) {
    throw new Error('API returned an unexpected health response.');
  }

  return data;
}

// Normalizes an unknown catch-site error into a display-friendly message.
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
