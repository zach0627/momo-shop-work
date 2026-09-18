import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LinkProvider } from '@momo/shared-ui';

import { RouterLink } from './router-link';

/**
 * Composition root. Everything a lib needs but must not choose for itself is
 * decided here: how links navigate now, which repository implementation
 * (mock or HTTP) the data hooks talk to once the data layer lands.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mock data never changes underneath us and never fails transiently.
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LinkProvider component={RouterLink}>{children}</LinkProvider>
    </QueryClientProvider>
  );
}
