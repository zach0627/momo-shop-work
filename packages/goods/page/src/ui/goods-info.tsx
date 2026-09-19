import { formatPrice } from '@momo/shared-util';

/** The least this component needs; a catalog `Product` has all of it. */
export interface GoodsInfoProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  promoText?: string;
  description: string[];
}

/**
 * Title, description lines, goods code and price. The price is written the
 * way the detail page of the live site writes it - "促銷價 50,200 元", no "$"
 * - which is why it does not reuse the PriceTag of the product cards.
 */
export function GoodsInfo({ product }: { product: GoodsInfoProduct }) {
  const { originalPrice } = product;
  const isDiscounted =
    originalPrice !== undefined && originalPrice > product.price;

  return (
    <div>
      {product.promoText && (
        <p className="text-ec-base text-sale">{product.promoText}</p>
      )}
      <h1 className="text-ec-xl text-ink mt-1 font-bold">{product.name}</h1>

      <div className="mt-3 flex items-start justify-between gap-4">
        <ul className="text-ec-base text-ink-emphasis list-disc space-y-0.5 pl-9 font-medium">
          {product.description.map((line, index) => (
            // Lines never reorder, and two of them may read the same.
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
        <p className="text-ec-sm text-ink-muted shrink-0 self-end">
          品號：<span>{product.id}</span>
        </p>
      </div>

      <div className="border-line mt-6 border-y py-4">
        <p className="flex items-baseline gap-2">
          <span className="text-ec-sm text-ink-label">促銷價</span>
          <span className="text-ec-4xl text-brand font-bold">
            {formatPrice(product.price)}
          </span>
          <span className="text-ec-sm text-ink-label">元</span>
        </p>
        {isDiscounted && (
          <p className="text-ec-sm text-ink-label mt-1">
            市售價 <del>{formatPrice(originalPrice)} 元</del>
          </p>
        )}
      </div>
    </div>
  );
}
