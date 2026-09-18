import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

/** `data` is `null` when the product does not exist - that is a success. */
export function useProduct(id: string) {
  const repository = useCatalogRepository();
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: () => repository.getProduct(id),
  });
}
