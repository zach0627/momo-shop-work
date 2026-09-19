import { formatPrice } from '@momo/shared-util';

/** 價格的顏色：text-price 或 text-brand。 */
export type PriceTone = 'price' | 'brand';
/** sm：19px（格狀）；md：21px（商品列）。 */
export type PriceSize = 'sm' | 'md';

// class 要寫完整字串，Tailwind 才掃得到
const TONES: Record<PriceTone, string> = {
  price: 'text-price',
  brand: 'text-brand',
};
const SIZES: Record<PriceSize, string> = {
  sm: 'text-ec-xl',
  md: 'text-ec-2xl',
};

export interface PriceTagProps {
  price: number;
  /** 劃線顯示；只有高於 price 時才顯示。 */
  originalPrice?: number;
  tone?: PriceTone;
  size?: PriceSize;
  /** 原價放在售價下面，而不是旁邊。 */
  stacked?: boolean;
}

export function PriceTag({
  price,
  originalPrice,
  tone = 'price',
  size = 'md',
  stacked = false,
}: PriceTagProps) {
  const isDiscounted = originalPrice !== undefined && originalPrice > price;

  return (
    <span
      className={
        stacked ? 'flex flex-col items-start' : 'flex items-baseline gap-2'
      }
    >
      <span className={`${TONES[tone]} whitespace-nowrap`}>
        <span className="text-ec-sm font-medium">$</span>
        <span className={`${SIZES[size]} font-bold`}>{formatPrice(price)}</span>
      </span>
      {isDiscounted && (
        <>
          {/* 多數螢幕閱讀器不會念出 <del>，所以補上文字 */}
          <span className="sr-only">原價</span>
          <del className="text-ec-sm text-ink-muted whitespace-nowrap">
            ${formatPrice(originalPrice)}
          </del>
        </>
      )}
    </span>
  );
}
