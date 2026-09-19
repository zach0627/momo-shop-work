import { ProductCard, type ProductCardItem } from '@momo/shared-ui';

export interface RecommendationGridItem extends ProductCardItem {
  id: string;
  href: string;
}

/** 一列 5 件。新商品接在同一個清單後面（key 為 id），已顯示的不會移動或重新掛載。 */
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
