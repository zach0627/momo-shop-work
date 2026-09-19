import type { ReactNode } from 'react';

import { useHomeLayout } from '@momo/home-data-access';

import { SECTION_REGISTRY } from './section-renderer/section-registry';
import { SectionRenderer } from './section-renderer/section-renderer';

/**
 * The page is a full-width grey surface with white 1220px bands on it, as on
 * the live site. The layout around it (top bar, header, footer) stays up in
 * every state below.
 */
function PageSurface({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-muted pb-4">
      <div className="max-w-shop mx-auto flex w-full flex-col gap-4">
        <h1 className="sr-only">momo 購物網首頁</h1>
        {children}
      </div>
    </div>
  );
}

/**
 * The home page fetches one thing - its layout - and hands it to the
 * renderer. Which sections there are, and in which order, is data.
 */
export function HomePage() {
  const { data: sections, isPending, isError } = useHomeLayout();

  if (isPending) {
    return (
      <PageSurface>
        <p
          role="status"
          className="bg-surface text-ec-base text-ink-muted px-4 py-16 text-center"
        >
          首頁內容載入中…
        </p>
      </PageSurface>
    );
  }

  // The failure itself is reported by the app's query cache.
  if (isError) {
    return (
      <PageSurface>
        <p
          role="alert"
          className="bg-surface text-ec-base text-ink px-4 py-16 text-center"
        >
          首頁內容載入失敗，請重新整理頁面再試一次。
        </p>
      </PageSurface>
    );
  }

  return (
    <PageSurface>
      <SectionRenderer sections={sections} registry={SECTION_REGISTRY} />
    </PageSurface>
  );
}
