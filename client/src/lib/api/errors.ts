// Consistent, typed representation of API failures.
// Messages must stay safe to show in the UI: never include credentials,
// connection strings, or response internals.

export type ApiErrorKind = 'http' | 'network' | 'parse' | 'shape';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  // HTTP status is present only for responses the server actually returned.
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

// Normalizes an unknown catch-site error into a display-friendly message.
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
