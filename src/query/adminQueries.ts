import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { USERS_FILTER_FIELDS, type UsersFilters } from '../admin/usersFilters';
import { getAdminUsers } from '../api/users';

const USERS_PAGE_SIZE = 50;

export function useAdminUsersQuery(args: {
  sort?: string;
  filters?: Partial<UsersFilters>;
  enabled: boolean;
}) {
  return useInfiniteQuery({
    queryKey: [
      'adminUsers',
      args.sort ?? null,
      ...USERS_FILTER_FIELDS.map((field) => args.filters?.[field] ?? null),
    ],
    queryFn: ({ signal, pageParam }) =>
      getAdminUsers(
        {
          page: pageParam,
          size: USERS_PAGE_SIZE,
          sort: args.sort,
          ...args.filters,
        },
        { signal },
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page.number + 1;
      return nextPage < lastPage.page.totalPages ? nextPage : undefined;
    },
    placeholderData: keepPreviousData,
    enabled: args.enabled,
  });
}
