import type { Category } from '../models/category';
import type { FlashSale } from '../models/flash-sale';
import type { Page } from '../models/page';
import type { Product } from '../models/product';

/** UI 能向商品目錄要的所有資料。查不到回 null 或 []，不 throw。 */
export interface CatalogRepository {
  getProduct(id: string): Promise<Product | null>;
  /** 未知的 key → []。 */
  getCollection(key: string): Promise<Product[]>;
  getRecommendations(params: {
    offset: number;
    limit: number;
  }): Promise<Page<Product>>;
  getFlashSale(): Promise<FlashSale>;
  getCategories(): Promise<Category[]>;
}
