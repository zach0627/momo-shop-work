import { useRef, type ReactNode } from 'react';

import { useCategories } from '@momo/catalog-data-access';

import { ACTIVE_CATEGORY_ID } from './model/layout-content';
import { useInView } from './model/use-in-view';
import { CategoryNav } from './ui/category-nav';
import { Footer } from './ui/footer';
import { MainHeader } from './ui/main-header';
import { TopBar } from './ui/top-bar';

/** 每一頁共用的外框：固定的頂部列、主 header、分類列、footer。掛在 app 的 layout route 上，換頁時不會重新掛載。 */
export function AppLayout({ children }: { children: ReactNode }) {
  const mainHeaderRef = useRef<HTMLDivElement>(null);
  const mainHeaderInView = useInView(mainHeaderRef);
  // 外框先渲染，分類到了再補上
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
