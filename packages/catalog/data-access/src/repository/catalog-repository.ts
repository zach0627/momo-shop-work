import type { Category } from '../models/category';
import type { FlashSale } from '../models/flash-sale';
import type { Page } from '../models/page';
import type { Product } from '../models/product';

/**
 * Everything the UI may ask the catalog. The mock implements it today; a
 * real API client would implement the same interface and be swapped in at the
 * composition root.
 *
 * "Not found" is an answer, not a failure: `null` and `[]`, never a throw.
 */
export interface CatalogRepository {
  getProduct(id: string): Promise<Product | null>;
  /** Unknown key -> `[]`. */
  getCollection(key: string): Promise<Product[]>;
  getRecommendations(params: {
    offset: number;
    limit: number;
  }): Promise<Page<Product>>;
  getFlashSale(): Promise<FlashSale>;
  getRanking(): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
}
