import { ProductCard, type ProductCardItem } from '@momo/shared-ui';

export interface RecommendationGridItem extends ProductCardItem {
  id: string;
  href: string;
}

/**
 * Five products to a row (see model/page-size.ts). New products are appended
 * to the same list, keyed by id, so the ones already on screen do not move
 * or re-mount when more arrive.
 */
export function RecommendationGrid({
  items,
}: {
  items: RecommendationGridItem[];
}) {
  return (
    <ul className="grid grid-cols-5 gap-x-4 gap-y-6">
      {items.map((item) => (
        <li key={item.id}>
          <ProductCard
            item={item}
            href={item.href}
            frame="plain"
            priceTag={{ size: 'sm' }}
          />
        </li>
      ))}
    </ul>
  );
}
