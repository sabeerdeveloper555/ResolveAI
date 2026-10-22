// TanStack Query hook for the backend health endpoint.
// Reuses the existing transport/contract in ../health without rewriting it.

import { useQuery } from '@tanstack/react-query';
import { fetchApiHealth } from '../health';
import { queryKeys } from '../query-keys';

// Reads /api/health through the shared client. Retries are disabled so a
// downed server surfaces as an error promptly instead of retrying in the
// background; the conservative cache window avoids needless refetches.
export function useApiHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    // TanStack provides an AbortSignal that is cancelled on unmount and
    // before refetches; forwarding it keeps the client's abort behavior.
    queryFn: ({ signal }) => fetchApiHealth(signal),
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
