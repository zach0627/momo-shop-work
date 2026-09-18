import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

export function useCategories() {
  const repository = useCatalogRepository();
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => repository.getCategories(),
  });
}
