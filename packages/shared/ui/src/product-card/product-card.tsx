import type { ReactNode } from 'react';

import { AppLink } from '../link/link';
import { PriceTag, type PriceTagProps } from '../price-tag/price-tag';

/**
 * The least a card needs to know about a product. A domain `Product` has all
 * of these fields, so it is passed as it is - and this package never imports
 * the package that owns the domain model.
 */
export interface ProductCardItem {
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
}

/** vertical: image on top. horizontal: a 140px image on the left. */
export type ProductCardLayout = 'vertical' | 'horizontal';
/** outlined: border, 8px corners, a soft shadow. plain: 4px corners only. */
export type ProductCardFrame = 'outlined' | 'plain';

const FRAMES: Record<ProductCardFrame, string> = {
  outlined: 'rounded-card border border-line shadow-card',
  plain: 'rounded-tile',
};

export interface ProductCardProps {
  item: ProductCardItem;
  /** Built by the caller with `paths`; this package knows no routes. */
  href: string;
  layout?: ProductCardLayout;
  frame?: ProductCardFrame;
  /** How the price looks; what it says always comes from `item`. */
  priceTag?: Omit<PriceTagProps, 'price' | 'originalPrice'>;
  /** One red line above the name, e.g. "滿1件折100". */
  promoText?: ReactNode;
  /** Rendered under the link, not inside it, so it may hold a button. */
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
        {/* alt="": the name follows inside the same link, and an alt text
            would make a screen reader say it twice. */}
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
            // The line keeps its height when empty, so the names of
            // neighbouring cards in a rail stay aligned.
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
