import type { ReactNode } from 'react';

import { useProduct } from '@momo/catalog-data-access';

import { GoodsActions } from './ui/goods-actions';
import { GoodsGallery } from './ui/goods-gallery';
import { GoodsInfo } from './ui/goods-info';
import { GoodsNotFound } from './ui/goods-not-found';

export interface GoodsDetailPageProps {
  /** Comes from the route. Reading the URL is the app's job, not this package's. */
  goodsId: string;
}

/** The page owns its width; the layout around it only says where it goes. */
function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-shop mx-auto w-full px-4 py-8">{children}</div>;
}

/**
 * The goods detail page: the picture on the left; title, description and
 * price on the right; three action buttons below them. Display-only - see
 * ui/goods-actions.tsx.
 *
 * It reads the same product table as the home page, through the same hook,
 * so a card and the page it leads to cannot disagree on name or price.
 */
export function GoodsDetailPage({ goodsId }: GoodsDetailPageProps) {
  const { data: product, isPending, isError } = useProduct(goodsId);

  if (isPending) {
    return (
      <PageContainer>
        <p
          role="status"
          className="text-ec-base text-ink-muted py-16 text-center"
        >
          商品載入中…
        </p>
      </PageContainer>
    );
  }

  // The failure itself is reported by the app's query cache.
  if (isError) {
    return (
      <PageContainer>
        <p role="alert" className="text-ec-base text-ink py-16 text-center">
          商品載入失敗，請重新整理頁面再試一次。
        </p>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <GoodsNotFound goodsId={goodsId} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <article className="flex items-start gap-8">
        <div className="w-110 shrink-0">
          <GoodsGallery imageUrl={product.imageUrl} name={product.name} />
        </div>
        <div className="min-w-0 flex-1">
          <GoodsInfo product={product} />
          <div className="mt-6">
            <GoodsActions />
          </div>
        </div>
      </article>
    </PageContainer>
  );
}
