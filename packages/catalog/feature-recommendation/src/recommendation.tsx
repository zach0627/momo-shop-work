import { useRecommendations } from '@momo/catalog-data-access';
import { ProductCardSkeleton, SectionHeader, Skeleton } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { PAGE_SIZE } from './model/page-size';
import { LoadMoreButton } from './ui/load-more-button';
import { RecommendationGrid } from './ui/recommendation-grid';

export interface RecommendationProps {
  title: string;
  /** 標題前半較淺的字。 */
  lead?: string;
}

/** 「你可能會喜歡」：先顯示 3 列，每按一次「看更多」再加 3 列，載完後按鈕消失。 */
export function Recommendation({ title, lead }: RecommendationProps) {
  const { items, hasMore, isPending, isLoadingMore, isError, loadMore } =
    useRecommendations(PAGE_SIZE);

  // 完全載不到 → 區塊不顯示；後面的批次失敗 → 保留已顯示的，按鈕留著當重試
  if (isError && items.length === 0) return null;

  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface pb-8">
      <SectionHeader lead={lead} title={title} />
      <div className="px-4">
        {isPending ? (
          <>
            <p role="status" className="sr-only">
              推薦商品載入中
            </p>
            <div className="grid grid-cols-5 gap-x-4 gap-y-6">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <ProductCardSkeleton key={index} frame="plain" />
              ))}
            </div>
          </>
        ) : (
          <RecommendationGrid
            items={items.map((product) => ({
              ...product,
              href: paths.goods(product.id),
            }))}
          />
        )}
      </div>
      {/* 多數情況載完第一批還有下一批：先替「看更多」留位置，它出現時頁尾才不會往下跳 */}
      {isPending && (
        <div className="mt-8">
          <Skeleton className="rounded-pill mx-auto h-9.5 w-46" />
        </div>
      )}
      {hasMore && (
        <div className="mt-8">
          <LoadMoreButton busy={isLoadingMore} onClick={loadMore} />
        </div>
      )}
    </section>
  );
}
