import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

export function useProductCollection(key: string) {
  const repository = useCatalogRepository();
  return useQuery({
    queryKey: catalogKeys.collection(key),
    queryFn: () => repository.getCollection(key),
  });
}
