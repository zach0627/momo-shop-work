// Models
export type { Category } from './models/category';
export type { FlashSale, FlashSaleItem } from './models/flash-sale';
export type { Page } from './models/page';
export type { Product } from './models/product';

// The seam: an interface, the mock behind it, and the context that injects it
export type { CatalogRepository } from './repository/catalog-repository';
export {
  createMockCatalogRepository,
  type CatalogData,
  type MockCatalogOptions,
} from './repository/mock-catalog-repository';
export {
  CatalogRepositoryProvider,
  useCatalogRepository,
} from './repository/catalog-repository-context';

// What UI code uses
export { useCategories } from './hooks/use-categories';
export { useFlashSale } from './hooks/use-flash-sale';
export { useProduct } from './hooks/use-product';
export { useProductCollection } from './hooks/use-product-collection';
export { useRanking } from './hooks/use-ranking';
export { useRecommendations } from './hooks/use-recommendations';
export { catalogKeys } from './query-keys';
