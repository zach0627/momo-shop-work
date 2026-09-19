import type { Product } from './product';

/** 限時搶購的商品一定有 originalPrice。 */
export interface FlashSaleItem extends Product {
  originalPrice: number;
  promoText: string;
  stockLeft: number;
}

export interface FlashSale {
  /** ISO 8601；以「現在」往後推算，倒數不會一打開就過期。 */
  endsAt: string;
  items: FlashSaleItem[];
}
