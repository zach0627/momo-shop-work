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
  /** Collection key -> product ids, in display order. */
  collections: Record<string, string[]>;
  flashSaleExtras: Record<string, { promoText: string; stockLeft: number }>;
  categories: Category[];
}

export interface MockCatalogOptions {
  /** Defaults to the generated fixtures. Tests pass a small set of their own. */
  data?: CatalogData;
  /** Injected so the flash sale can be tested at any point in time. */
  now?: () => Date;
  /** Simulated network delay, so loading states are visible in the app. */
  latencyMs?: number;
  flashSaleHours?: number;
}

const COLLECTION_KEYS = {
  recommendations: 'recommendations',
  flashSale: 'flash-sale',
  ranking: 'best-sellers',
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

  const respond = <T>(value: T): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(value), latencyMs));

  // An id without a product is dropped rather than turned into a hole.
  const productsOf = (key: string): Product[] =>
    (data.collections[key] ?? []).flatMap((id) => byId.get(id) ?? []);

  return {
    getProduct: (id) => respond(byId.get(id) ?? null),

    getCollection: (key) => respond(productsOf(key)),

    getRecommendations: ({ offset, limit }) => {
      const all = productsOf(COLLECTION_KEYS.recommendations);
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
          // Without a price to compare against it is not a flash sale offer.
          if (!extras || product.originalPrice === undefined) return [];
          return [
            { ...product, originalPrice: product.originalPrice, ...extras },
          ];
        },
      );
      return respond({ endsAt: endsAt.toISOString(), items });
    },

    getRanking: () => respond(productsOf(COLLECTION_KEYS.ranking)),

    getCategories: () => respond(data.categories),
  };
}
