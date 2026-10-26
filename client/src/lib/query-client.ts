// One app-level QueryClient. Conservative defaults avoid background refetch
// storms against the small Express backend; per-query options can override
// these (e.g. the health query disables retries).
//
// Exported as a singleton so the auth layer can clear cached data when the
// authenticated identity changes (see contexts/AuthContext.tsx).

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
