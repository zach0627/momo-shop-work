import { useFlashSale } from '@momo/catalog-data-access';
import { Carousel, ProductCard, ProductCardSkeleton } from '@momo/shared-ui';
import { paths } from '@momo/shared-util';

import { chunk } from './model/chunk';
import { PAGE_SIZE } from './model/page-size';
import { CardFooter } from './ui/card-footer';
import { FlashSaleHeader } from './ui/flash-sale-header';

export interface FlashSaleProps {
  title: string;
  /** 標題前半較淺的字。 */
  lead?: string;
}

// 真站實測：卡片之間的間距（左右、上下相同）
const CARD_GAP = 10;

/** 限時搶購：標題列上的倒數，加上每頁 2 列 × 5 件、可左右換頁的商品。 */
export function FlashSale({ title, lead }: FlashSaleProps) {
  const { data, isError } = useFlashSale();
  const label = `${lead ?? ''}${title}`;

  // 載入失敗或沒有商品就不顯示這個區塊（失敗由 app 的 QueryCache 回報）
  if (isError || data?.items.length === 0) return null;

  return (
    <section aria-label={label} className="bg-surface">
      {data ? (
        <>
          <FlashSaleHeader title={label} endsAt={data.endsAt} />
          <div className="p-4">
            <Carousel label={label} gap={CARD_GAP} dots>
              {chunk(data.items, PAGE_SIZE).map((page) => (
                <ul
                  key={page[0].id}
                  className="grid grid-cols-5"
                  style={{ gap: CARD_GAP }}
                >
                  {page.map((item) => (
                    <li key={item.id}>
                      <ProductCard
                        item={item}
                        href={paths.goods(item.id)}
                        frame="raised"
                        promoText={item.promoText}
                        priceTag={{
                          tone: 'sale',
                          size: 'lg',
                          stacked: true,
                          label: '限搶價',
                        }}
                        footer={<CardFooter stockLeft={item.stockLeft} />}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </Carousel>
          </div>
        </>
      ) : (
        <>
          <FlashSaleHeader title={label} />
          <p role="status" className="sr-only">
            {label}載入中
          </p>
          {/* pb-10：內距 16 + 圓點那一列 24 */}
          <div
            className="grid grid-cols-5 px-4 pt-4 pb-10"
            style={{ gap: CARD_GAP }}
          >
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <ProductCardSkeleton key={index} frame="raised" stacked />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
