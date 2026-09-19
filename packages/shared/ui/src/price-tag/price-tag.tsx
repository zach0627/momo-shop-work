import { formatPrice } from '@momo/shared-util';

/** Which colour token the price takes: `text-price` or `text-brand`. */
export type PriceTone = 'price' | 'brand';
/** sm: 19px, a product grid. md: 21px, a product rail. */
export type PriceSize = 'sm' | 'md';

// Complete class names, so Tailwind's scanner can see them.
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
  /** Shown struck through - only when it is higher than `price`. */
  originalPrice?: number;
  tone?: PriceTone;
  size?: PriceSize;
  /** Puts the original price under the price instead of beside it. */
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
          {/* Few screen readers announce <del>, so the meaning is spelled out. */}
          <span className="sr-only">原價</span>
          <del className="text-ec-sm text-ink-muted whitespace-nowrap">
            ${formatPrice(originalPrice)}
          </del>
        </>
      )}
    </span>
  );
}
