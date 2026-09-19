import { useRecommendations } from '@momo/catalog-data-access';
import { SectionHeader } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { PAGE_SIZE } from './model/page-size';
import { LoadMoreButton } from './ui/load-more-button';
import { RecommendationGrid } from './ui/recommendation-grid';

export interface RecommendationProps {
  title: string;
  /** The lighter first part of the title. */
  lead?: string;
}

/**
 * "你可能會喜歡": three rows of products, and three more each time the user
 * asks, until there are none left - then the button goes away.
 *
 * It lives in the catalog scope, not in home, because the goods detail page
 * is meant to show it too; that is also why it takes a plain title instead
 * of a home layout section.
 */
export function Recommendation({ title, lead }: RecommendationProps) {
  const { items, hasMore, isPending, isLoadingMore, isError, loadMore } =
    useRecommendations(PAGE_SIZE);

  // Nothing could be loaded at all: leave the page rather than show an empty
  // frame. (The failure is reported by the app's query cache.) When a LATER
  // batch fails, what is on screen stays, and so does the button: asking
  // again is the retry.
  if (isError && items.length === 0) return null;

  return (
    <section aria-label={`${lead ?? ''}${title}`} className="bg-surface pb-8">
      <SectionHeader lead={lead} title={title} />
      <div className="px-4">
        {isPending ? (
          <p
            role="status"
            className="text-ec-base text-ink-muted py-16 text-center"
          >
            推薦商品載入中…
          </p>
        ) : (
          <RecommendationGrid
            items={items.map((product) => ({
              ...product,
              href: paths.goods(product.id),
            }))}
          />
        )}
      </div>
      {hasMore && (
        <div className="mt-8">
          <LoadMoreButton busy={isLoadingMore} onClick={loadMore} />
        </div>
      )}
    </section>
  );
}
