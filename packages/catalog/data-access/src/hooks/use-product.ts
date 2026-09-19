import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

/** 商品不存在時 data 是 null：這是成功，不是錯誤。 */
export function useProduct(id: string) {
  const repository = useCatalogRepository();
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => repository.getProduct(id),
  });
}
