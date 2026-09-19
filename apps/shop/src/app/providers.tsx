import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  CatalogRepositoryProvider,
  createMockCatalogRepository,
} from '@momo/catalog-data-access';
import {
  createMockHomeRepository,
  HomeRepositoryProvider,
} from '@momo/home-data-access';
import { LinkProvider } from '@momo/shared-ui';

import { createQueryClient } from './query-client';
import { RouterLink } from './router-link';

// mock 的延遲：讓載入狀態看得到
const MOCK_LATENCY_MS = 150;

/** Composition root：決定連結怎麼導頁、資料 hook 用哪個 repository。換成真 API 只改這裡。 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [catalogRepository] = useState(() =>
    createMockCatalogRepository({ latencyMs: MOCK_LATENCY_MS }),
  );
  const [homeRepository] = useState(() =>
    createMockHomeRepository({ latencyMs: MOCK_LATENCY_MS }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CatalogRepositoryProvider repository={catalogRepository}>
        <HomeRepositoryProvider repository={homeRepository}>
          <LinkProvider component={RouterLink}>{children}</LinkProvider>
        </HomeRepositoryProvider>
      </CatalogRepositoryProvider>
    </QueryClientProvider>
  );
}
