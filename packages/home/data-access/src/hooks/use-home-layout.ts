import { useQuery } from '@tanstack/react-query';

import { homeKeys } from '../query-keys';
import { useHomeRepository } from '../repository/home-repository-context';

export function useHomeLayout() {
  const repository = useHomeRepository();
  return useQuery({
    queryKey: homeKeys.layout(),
    queryFn: () => repository.getLayout(),
  });
}
