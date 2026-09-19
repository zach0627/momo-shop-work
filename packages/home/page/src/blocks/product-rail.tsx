import { useProductCollection } from '@momo/catalog-data-access';
import type { ProductRailSection } from '@momo/home-data-access';
import { Carousel, ProductCard } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { SectionFrame } from '../ui/section-frame';

// Measured on the live site, the same for both card layouts.
const CARD_GAP = 10;

/**
 * A titled rail of product cards. The layout names a collection; the
 * products come from the catalog - so a product shown here has the same
 * name and price as on its detail page, which every card links to.
 */
export function ProductRail({ section }: { section: ProductRailSection }) {
  const { data: products = [], isError } = useProductCollection(
    section.collection,
  );
  const label = `${section.title.lead ?? ''}${section.title.text}`;
  const isHorizontal = section.card === 'horizontal';

  // The failure is already reported by the app's query cache. A rail that
  // cannot load leaves the page; it does not take the page with it.
  if (isError) return null;

  return (
    <SectionFrame label={label} title={section.title}>
      {/* The height is reserved while the products load, so the sections
          below do not jump when they arrive. */}
      <div className={isHorizontal ? 'min-h-44' : 'min-h-60'}>
        {products.length > 0 && (
          <Carousel label={label} perView={section.perView} gap={CARD_GAP} dots>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                item={product}
                href={paths.goods(product.id)}
                layout={section.card}
                // Vertical rails stack the struck price under a brand-coloured
                // price; horizontal cards keep it beside the price and carry
                // the product's promo line. Both as measured on the live site.
                priceTag={
                  isHorizontal ? undefined : { tone: 'brand', stacked: true }
                }
                promoText={isHorizontal ? product.promoText : undefined}
              />
            ))}
          </Carousel>
        )}
      </div>
    </SectionFrame>
  );
}
