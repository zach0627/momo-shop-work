export type { Category } from './models/category';
export type { FlashSale, FlashSaleItem } from './models/flash-sale';
export type { Page } from './models/page';
export type { Product } from './models/product';
export type { CatalogRepository } from './repository/catalog-repository';
export {
  createMockCatalogRepository,
  type CatalogData,
  type MockCatalogOptions,
} from './repository/mock-catalog-repository';
