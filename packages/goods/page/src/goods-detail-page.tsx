import type { ReactNode } from 'react';

import { useProduct } from '@momo/catalog-data-access';
import { Skeleton } from '@momo/shared-ui';

import { GoodsActions } from './ui/goods-actions';
import { GoodsGallery } from './ui/goods-gallery';
import { GoodsInfo } from './ui/goods-info';
import { GoodsNotFound } from './ui/goods-not-found';

export interface GoodsDetailPageProps {
  /** 來自路由；讀網址是 app 的事。 */
  goodsId: string;
}

/** 頁面自己決定寬度，layout 不管。 */
function PageContainer({ children }: { children: ReactNode }) {
  return <div className="max-w-shop mx-auto w-full px-4 py-8">{children}</div>;
}

/** 商品詳情頁（展示用）：左邊主圖，右邊標題、說明與價格，下方三顆不綁行為的按鈕。 */
export function GoodsDetailPage({ goodsId }: GoodsDetailPageProps) {
  const { data: product, isPending, isError } = useProduct(goodsId);

  if (isPending) {
    return (
      <PageContainer>
        <p role="status" className="sr-only">
          商品載入中
        </p>
        {/* 和載入後同樣的兩欄：左邊主圖 440，右邊標題、說明、價格、按鈕 */}
        <div className="flex items-start gap-8">
          <Skeleton className="size-110 shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="rounded-tile h-7 w-4/5" />
            <Skeleton className="rounded-tile h-5 w-3/5" />
            <Skeleton className="rounded-tile h-5 w-2/5" />
            <Skeleton className="rounded-tile h-12 w-1/3" />
            <Skeleton className="h-action w-126" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // 失敗由 app 的 QueryCache 統一回報
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
