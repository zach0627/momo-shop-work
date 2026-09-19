import { CATEGORIES } from '../fixtures/categories';
import {
  COLLECTIONS,
  FLASH_SALE_EXTRAS,
} from '../fixtures/collections.generated';
import { PRODUCTS } from '../fixtures/products.generated';
import type { Category } from '../models/category';
import type { FlashSaleItem } from '../models/flash-sale';
import type { Product } from '../models/product';
import type { CatalogRepository } from './catalog-repository';

export interface CatalogData {
  products: Product[];
  /** collection key → 商品 id（依顯示順序）。 */
  collections: Record<string, string[]>;
  flashSaleExtras: Record<string, { promoText: string; stockLeft: number }>;
  categories: Category[];
}

export interface MockCatalogOptions {
  /** 預設為產生的 fixtures；測試可傳入自己的小資料。 */
  data?: CatalogData;
  /** 可注入，讓限時搶購能在任意時間點測試。 */
  now?: () => Date;
  /** 模擬網路延遲（ms）。 */
  latencyMs?: number;
  flashSaleHours?: number;
}

const COLLECTION_KEYS = {
  recommendations: 'recommendations',
  flashSale: 'flash-sale',
} as const;

const DEFAULT_DATA: CatalogData = {
  products: PRODUCTS,
  collections: COLLECTIONS,
  flashSaleExtras: FLASH_SALE_EXTRAS,
  categories: CATEGORIES,
};

export function createMockCatalogRepository({
  data = DEFAULT_DATA,
  now = () => new Date(),
  latencyMs = 0,
  flashSaleHours = 3,
}: MockCatalogOptions = {}): CatalogRepository {
  const byId = new Map(data.products.map((product) => [product.id, product]));

  // 每個回應都延遲 latencyMs，模擬網路
  const respond = <T>(value: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(value), latencyMs));

  // 找不到商品的 id 直接略過
  const productsOf = (key: string): Product[] =>
    (data.collections[key] ?? []).flatMap((id) => byId.get(id) ?? []);

  return {
    getProduct: (id) => respond(byId.get(id) ?? null),

    getCollection: (key) => respond(productsOf(key)),

    getRecommendations: ({ offset, limit }) => {
      const all = productsOf(COLLECTION_KEYS.recommendations);
      // nextOffset 為 null 代表這是最後一頁（恰好取完也算）
      const end = offset + limit;
      return respond({
        items: all.slice(offset, end),
        nextOffset: end < all.length ? end : null,
      });
    },

    getFlashSale: () => {
      const endsAt = new Date(now().getTime() + flashSaleHours * 3_600_000);
      const items = productsOf(COLLECTION_KEYS.flashSale).flatMap(
        (product): FlashSaleItem[] => {
          const extras = data.flashSaleExtras[product.id];
          // 沒有原價就不算限時搶購商品
          if (!extras || product.originalPrice === undefined) return [];
          return [
            { ...product, originalPrice: product.originalPrice, ...extras },
          ];
        },
      );
      return respond({ endsAt: endsAt.toISOString(), items });
    },

    getCategories: () => respond(data.categories),
  };
}
