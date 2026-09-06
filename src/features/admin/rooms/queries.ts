import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { deleteAdminRoom, getAdminRooms } from './api';
import type { AdminRoomsFilters } from './filters';

const ADMIN_ROOMS_PAGE_SIZE = 50;

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
