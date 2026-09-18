import { useRef, type ReactNode } from 'react';

import { ACTIVE_CATEGORY_ID, CATEGORIES } from './model/categories';
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

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <header className="pt-topbar">
        <TopBar compact={!mainHeaderInView} />
        <div ref={mainHeaderRef}>
          <MainHeader />
        </div>
        <CategoryNav categories={CATEGORIES} activeId={ACTIVE_CATEGORY_ID} />
      </header>

      <main className="mx-auto w-full max-w-shop flex-1 px-4 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
