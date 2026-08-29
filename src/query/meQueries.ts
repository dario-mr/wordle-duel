import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/users';

export function meQueryKey() {
  return ['me'] as const;
}

export function useMeQuery() {
  return useQuery({
    queryKey: meQueryKey(),
    queryFn: ({ signal }) => getMe({ signal }),
    staleTime: 60_000,
  });
}
