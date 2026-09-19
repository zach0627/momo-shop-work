import type { ReactNode } from 'react';

import { useHomeLayout } from '@momo/home-data-access';

import { SECTION_REGISTRY } from './section-renderer/section-registry';
import { SectionRenderer } from './section-renderer/section-renderer';

/** 滿版灰底 + 1220px 的白色區帶；三種狀態共用。 */
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

/** 首頁只抓一樣東西：版位資料，然後交給 SectionRenderer。 */
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

  // 失敗由 app 的 QueryCache 統一回報
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
