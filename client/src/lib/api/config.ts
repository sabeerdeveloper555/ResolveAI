// Resolves the backend base URL from the environment, falling back to the
// local dev server when VITE_API_BASE_URL is not set.

const FALLBACK_BASE_URL = 'http://localhost:5000';

export function getApiBaseUrl(): string {
  const baseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
  return (baseUrl || FALLBACK_BASE_URL).replace(/\/+$/, '');
}
