import { useInfiniteQuery } from '@tanstack/react-query';
import { getAdminUsers } from '../api/users';

const USERS_PAGE_SIZE = 50;

export function useAdminUsersQuery(args: { sort?: string; enabled: boolean }) {
  return useInfiniteQuery({
    queryKey: ['adminUsers', args.sort ?? null] as const,
    queryFn: ({ signal, pageParam }) =>
      getAdminUsers({ page: pageParam, size: USERS_PAGE_SIZE, sort: args.sort }, { signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page.number + 1;
      return nextPage < lastPage.page.totalPages ? nextPage : undefined;
    },
    enabled: args.enabled,
  });
}
