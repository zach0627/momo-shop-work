import type { ReactNode } from 'react';

import { AppLink } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

/**
 * The chrome every page is rendered inside. Walking-skeleton version: the
 * landmarks and the logo link are real; the sticky top bar, category
 * navigation and the full footer arrive with the layout step.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="border-b border-line-strong">
        <div className="mx-auto flex h-20 w-full max-w-shop items-center px-4">
          <AppLink
            href={paths.home()}
            aria-label="momo 回首頁"
            className="text-ec-4xl font-black tracking-tight text-brand"
          >
            momo
          </AppLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-shop flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="bg-footer py-8 text-center text-ec-sm text-on-action">
        展示用專案：以 Mock Data 重建，非 momo 官方網站
      </footer>
    </div>
  );
}
