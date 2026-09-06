import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { AdminRoomsFilters } from '../admin/roomsFilters';
import { USERS_FILTER_FIELDS, type UsersFilters } from '../admin/usersFilters';
import { deleteAdminRoom, getAdminRooms } from '../api/rooms';
import { getAdminUsers } from '../api/users';

const USERS_PAGE_SIZE = 50;
const ADMIN_ROOMS_PAGE_SIZE = 50;

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

export function useAdminRoomsQuery(args: {
  sort?: string;
  filters?: Partial<AdminRoomsFilters>;
  enabled: boolean;
}) {
  return useInfiniteQuery({
    queryKey: [
      'adminRooms',
      args.sort ?? null,
      args.filters?.statuses?.join(',') ?? null,
      args.filters?.language ?? null,
      args.filters?.rounds ?? null,
      args.filters?.roomId ?? null,
      args.filters?.playerSearch ?? null,
      args.filters?.createdAt ?? null,
      args.filters?.lastUpdatedAt ?? null,
    ],
    queryFn: ({ signal, pageParam }) =>
      getAdminRooms(
        {
          page: pageParam,
          size: ADMIN_ROOMS_PAGE_SIZE,
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

export function useDeleteAdminRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminRoom,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminRooms'] });
    },
  });
}
