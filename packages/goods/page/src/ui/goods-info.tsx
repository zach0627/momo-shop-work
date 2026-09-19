import { formatPrice } from '@momo/shared-util';

/** 這個元件需要的欄位；catalog 的 Product 都有。 */
export interface GoodsInfoProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  promoText?: string;
  description: string[];
}

/** 標題、條列說明、品號與價格。價格照真站詳情頁的寫法（「促銷價 50,200 元」，沒有 $）。 */
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
            // 說明不會重新排序，而且可能有兩行文字相同
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
