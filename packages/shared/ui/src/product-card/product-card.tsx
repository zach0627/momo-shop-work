import type { ReactNode } from 'react';

import { AppLink } from '../link/link';
import { PriceTag, type PriceTagProps } from '../price-tag/price-tag';

/** 商品卡需要的最少欄位。domain 的 Product 可以直接傳入，shared/ui 不用 import data-access。 */
export interface ProductCardItem {
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
}

/** vertical：圖在上；horizontal：140px 的圖在左。 */
export type ProductCardLayout = 'vertical' | 'horizontal';
/** outlined：框線 + 8px 圓角 + 淡陰影；plain：只有 4px 圓角。 */
export type ProductCardFrame = 'outlined' | 'plain';

const FRAMES: Record<ProductCardFrame, string> = {
  outlined: 'rounded-card border border-line shadow-card',
  plain: 'rounded-tile',
};

export interface ProductCardProps {
  item: ProductCardItem;
  /** 由呼叫端用 paths 組好；這個 package 不認識路由。 */
  href: string;
  layout?: ProductCardLayout;
  frame?: ProductCardFrame;
  /** 價格的外觀；數字一律來自 item。 */
  priceTag?: Omit<PriceTagProps, 'price' | 'originalPrice'>;
  /** 名稱上方的一行紅字，例：「滿1件折100」。 */
  promoText?: ReactNode;
  /** 渲染在連結外面，所以可以放按鈕。 */
  footer?: ReactNode;
}

export function ProductCard({
  item,
  href,
  layout = 'vertical',
  frame = 'outlined',
  priceTag,
  promoText,
  footer,
}: ProductCardProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <article className={`${FRAMES[frame]} bg-surface h-full overflow-hidden`}>
      <AppLink
        href={href}
        className={`focus-visible:outline-brand focus-visible:outline-2 ${
          isHorizontal ? 'flex gap-2.5 p-4' : 'block'
        }`}
      >
        {/* alt=""：名稱就在同一個連結裡，寫 alt 會被念兩次 */}
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className={
            isHorizontal
              ? 'size-35 shrink-0 object-cover'
              : 'aspect-square w-full object-cover'
          }
        />
        <div
          className={isHorizontal ? 'flex min-w-0 flex-1 flex-col' : 'p-2.5'}
        >
          {isHorizontal ? (
            // 沒有促銷文字也保留這一行的高度，同一列卡片的名稱才會對齊
            <p className="text-ec-sm text-sale line-clamp-1 h-4.5">
              {promoText}
            </p>
          ) : (
            promoText && (
              <p className="text-ec-base text-sale line-clamp-1 font-bold">
                {promoText}
              </p>
            )
          )}
          <h3 className="text-ec-base text-ink line-clamp-2 h-10">
            {item.name}
          </h3>
          <div className={isHorizontal ? 'mt-6' : 'mt-1'}>
            <PriceTag
              price={item.price}
              originalPrice={item.originalPrice}
              {...priceTag}
            />
          </div>
        </div>
      </AppLink>
      {footer && <div className="px-2.5 pb-2.5">{footer}</div>}
    </article>
  );
}
