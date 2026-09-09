import { Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  adminRoomsFiltersEqual,
  EMPTY_ADMIN_ROOMS_FILTERS,
  getActiveAdminRoomsFilters,
  trimAdminRoomsFilters,
} from './filters';
import {
  type AdminRoomsSort,
  type AdminRoomsSortField,
  toAdminRoomsSortParam,
  toggleAdminRoomsSort,
} from './sorts';
import { UNAUTHENTICATED_CODE, WdsApiError } from '../../../shared/api/apiError';
import { getErrorMessage } from '../../../shared/api/errors';
import type { AdminRoomDto } from './types';
import { AuthErrorAlert } from '../../auth/AuthErrorAlert';
import { useMeQuery } from '../../auth/queries';
import { ErrorAlert } from '../../../shared/ui/ErrorAlert';
import { RoomDetailsDrawer } from './RoomDetailsDrawer';
import { RoomsSkeleton } from './RoomsSkeleton';
import { RoomsTable } from './RoomsTable';
import { useAdminRoomsQuery } from './queries';

export function RoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: me, error: authError, refetch: refetchAuth } = useMeQuery();
  const [filterDraft, setFilterDraft] = useState(EMPTY_ADMIN_ROOMS_FILTERS);
  const [filters, setFilters] = useState(EMPTY_ADMIN_ROOMS_FILTERS);
  const [sort, setSort] = useState<AdminRoomsSort>(null);
  const [selectedRoom, setSelectedRoom] = useState<AdminRoomDto | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = me?.roles.includes('ADMIN') ?? false;

  useEffect(() => {
    if (me && !isAdmin) {
      void navigate('/', { replace: true });
    }
  }, [me, isAdmin, navigate]);

  const shouldFetchRooms = me === null || isAdmin;
  const sortParam = toAdminRoomsSortParam(sort);
  const activeFilters = getActiveAdminRoomsFilters(filters);
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useAdminRoomsQuery({ sort: sortParam, filters: activeFilters, enabled: shouldFetchRooms });

  useEffect(() => {
    if (error instanceof WdsApiError && error.status === 403) {
      void navigate('/', { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) {
          return;
        }
        void fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const applyFilters = (nextDraft = filterDraft) => {
    const nextFilters = trimAdminRoomsFilters(nextDraft);
    setFilters((current) => (adminRoomsFiltersEqual(current, nextFilters) ? current : nextFilters));
  };

  const handleSortChange = (field: AdminRoomsSortField) => {
    setSort((current) => toggleAdminRoomsSort(current, field));
  };

  if (authError && me === undefined) {
    return <AuthErrorAlert error={authError} onRetry={() => void refetchAuth()} />;
  }

  if (!data && (isLoading || isFetching)) {
    return <RoomsSkeleton />;
  }

  if (error) {
    if (
      error instanceof WdsApiError &&
      (error.code === UNAUTHENTICATED_CODE || error.status === 403)
    ) {
      return null;
    }

    return <ErrorAlert title={t('admin.rooms.errorTitle')} message={getErrorMessage(error)} />;
  }

  if (!me) {
    return <RoomsSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const rooms = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.rooms.title')}
      </Heading>
      <RoomsTable
        rooms={rooms}
        sort={sort}
        onSortChange={handleSortChange}
        filters={filterDraft}
        onFilterChange={(nextFilters) => {
          setFilterDraft(nextFilters);
        }}
        onFilterApply={applyFilters}
        onOpenRoom={(room) => {
          setSelectedRoom(room);
        }}
      />
      {rooms.length === 0 ? <Text textAlign="center">{t('admin.rooms.empty')}</Text> : null}
      {isFetchingNextPage ? (
        <Stack align="center">
          <Spinner size="sm" />
        </Stack>
      ) : null}
      {hasNextPage ? <div ref={loadMoreRef} aria-hidden="true" /> : null}
      <RoomDetailsDrawer
        room={selectedRoom}
        onClose={() => {
          setSelectedRoom(null);
        }}
      />
    </Stack>
  );
}
