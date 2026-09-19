/** 這個 package 所有的 query key。 */
export const catalogKeys = {
  all: ['catalog'] as const,
  product: (id: string) => ['catalog', 'product', id] as const,
  collection: (key: string) => ['catalog', 'collection', key] as const,
  recommendations: (pageSize: number) =>
    ['catalog', 'recommendations', pageSize] as const,
  flashSale: () => ['catalog', 'flash-sale'] as const,
  categories: () => ['catalog', 'categories'] as const,
};
