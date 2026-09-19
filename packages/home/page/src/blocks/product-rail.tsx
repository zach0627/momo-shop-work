import { useProductCollection } from '@momo/catalog-data-access';
import type { ProductRailSection } from '@momo/home-data-access';
import { Carousel, ProductCard, ProductCardSkeleton } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { SectionFrame } from '../ui/section-frame';

// 真站實測，兩種卡片版型相同
const CARD_GAP = 10;

/** 有標題的商品列。版位資料只給 collection key，商品由 catalog 提供，每張卡片連到詳情頁。 */
export function ProductRail({ section }: { section: ProductRailSection }) {
  const {
    data: products = [],
    isPending,
    isError,
  } = useProductCollection(section.collection);
  const label = `${section.title.lead ?? ''}${section.title.text}`;
  const isHorizontal = section.card === 'horizontal';

  // 載入失敗就不顯示這一列，不拖垮整頁（失敗由 app 的 QueryCache 回報）
  if (isError) return null;

  return (
    <SectionFrame
      label={label}
      title={section.title}
      background={section.background}
      endsWithDots
    >
      {/* 載入中顯示佔位卡片並保留高度，下面的區塊才不會跳動 */}
      <div className={isHorizontal ? 'min-h-44' : 'min-h-60'}>
        {isPending && (
          <>
            <p role="status" className="sr-only">
              {label}載入中
            </p>
            {/* 和 Carousel 同樣的排法：每張佔 100 / perView %，間距放在左邊；pb-6 是圓點那一列的高度 */}
            <div className="overflow-hidden pb-6">
              <div className="flex" style={{ marginLeft: -CARD_GAP }}>
                {Array.from(
                  { length: Math.ceil(section.perView) },
                  (_, index) => (
                    <div
                      key={index}
                      className="shrink-0"
                      style={{
                        flexBasis: `${100 / section.perView}%`,
                        paddingLeft: CARD_GAP,
                      }}
                    >
                      <ProductCardSkeleton
                        layout={section.card}
                        frame={isHorizontal ? 'bordered' : 'outlined'}
                        stacked={!isHorizontal}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </>
        )}
        {products.length > 0 && (
          <Carousel label={label} perView={section.perView} gap={CARD_GAP} dots>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                item={product}
                href={paths.goods(product.id)}
                layout={section.card}
                // 真站實測：橫式卡是較深的框線、沒有陰影
                frame={isHorizontal ? 'bordered' : 'outlined'}
                // 直式：品牌色價格、原價放下面；橫式：原價放旁邊，並顯示促銷文字
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
