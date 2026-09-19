// 型別
export type { Category } from './models/category';
export type { FlashSale, FlashSaleItem } from './models/flash-sale';
export type { Page } from './models/page';
export type { Product } from './models/product';

// Repository：介面、mock、注入用的 Context
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

// 給 UI 用的 hooks
export { useCategories } from './hooks/use-categories';
export { useFlashSale } from './hooks/use-flash-sale';
export { useProduct } from './hooks/use-product';
export { useProductCollection } from './hooks/use-product-collection';
export { useRecommendations } from './hooks/use-recommendations';
export { catalogKeys } from './query-keys';
