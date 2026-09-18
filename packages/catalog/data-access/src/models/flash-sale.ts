import type { Product } from './product';

/** A product on flash sale always has an `originalPrice` to compare against. */
export interface FlashSaleItem extends Product {
  originalPrice: number;
  promoText: string;
  stockLeft: number;
}

export interface FlashSale {
  /** ISO 8601. Relative to "now", so the countdown never opens expired. */
  endsAt: string;
  items: FlashSaleItem[];
}
