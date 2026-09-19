import { useRef, type ReactNode } from 'react';

import { useCategories } from '@momo/catalog-data-access';

import { ACTIVE_CATEGORY_ID } from './model/layout-content';
import { useInView } from './model/use-in-view';
import { CategoryNav } from './ui/category-nav';
import { Footer } from './ui/footer';
import { MainHeader } from './ui/main-header';
import { TopBar } from './ui/top-bar';

/**
 * The chrome every page is rendered inside: fixed top bar, main header,
 * category navigation and footer. It is mounted once, on a pathless layout
 * route in the app, so it persists across pages - only `children` changes.
 *
 * It knows nothing about routing: links go through `AppLink` and the page
 * arrives as `children`.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const mainHeaderRef = useRef<HTMLDivElement>(null);
  const mainHeaderInView = useInView(mainHeaderRef);
  // The frame renders at once; the categories fill in when they arrive.
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="pt-topbar">
        <TopBar compact={!mainHeaderInView} />
        <div ref={mainHeaderRef}>
          <MainHeader />
        </div>
        <CategoryNav categories={categories} activeId={ACTIVE_CATEGORY_ID} />
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
