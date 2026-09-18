import { useQuery } from '@tanstack/react-query';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

export function useRanking() {
  const repository = useCatalogRepository();
  return useQuery({
    queryKey: catalogKeys.ranking(),
    queryFn: () => repository.getRanking(),
  });
}
