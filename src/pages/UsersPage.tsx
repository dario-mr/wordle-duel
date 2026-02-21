import { Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, subscribeCurrentUser } from '../api/auth';
import { getErrorMessage } from '../api/errors';
import { UNAUTHENTICATED_CODE } from '../constants';
import { WdsApiError } from '../api/types';
import { UsersSkeleton } from '../components/admin/UsersSkeleton.tsx';
import type { UsersSort, UsersSortField } from '../components/admin/UsersTable.tsx';
import { UsersTable } from '../components/admin/UsersTable.tsx';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { useAdminUsersQuery } from '../query/adminQueries';

export function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [me, setMe] = useState(() => getCurrentUser());
  const [sort, setSort] = useState<UsersSort>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return subscribeCurrentUser(() => {
      setMe(getCurrentUser());
    });
  }, []);

  const isAdmin = me?.roles.includes('ADMIN') ?? false;

  useEffect(() => {
    if (me !== null && !isAdmin) {
      void navigate('/', { replace: true });
    }
  }, [me, isAdmin, navigate]);

  const shouldFetchUsers = me === null || isAdmin;
  const sortParam = sort ? `${sort.field},${sort.direction}` : undefined;
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useAdminUsersQuery({
      sort: sortParam,
      enabled: shouldFetchUsers,
    });

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

  const handleSortChange = (field: UsersSortField) => {
    setSort((current) => {
      if (current?.field !== field) {
        return { field, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return null;
    });
  };

  if (!data && (isLoading || isFetching)) {
    return <UsersSkeleton />;
  }

  if (error) {
    if (
      error instanceof WdsApiError &&
      (error.code === UNAUTHENTICATED_CODE || error.status === 403)
    ) {
      return null;
    }

    return (
      <Stack gap={6}>
        <ErrorAlert title={t('admin.users.errorTitle')} message={getErrorMessage(error)} />
      </Stack>
    );
  }

  if (!me) {
    return <UsersSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const users = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.users.title')}
      </Heading>

      {users.length === 0 ? (
        <Text textAlign="center">{t('admin.users.empty')}</Text>
      ) : (
        <>
          <UsersTable users={users} sort={sort} onSortChange={handleSortChange} />
          {isFetchingNextPage && (
            <Stack align="center">
              <Spinner size="sm" />
            </Stack>
          )}
          {hasNextPage && <div ref={loadMoreRef} aria-hidden="true" />}
        </>
      )}
    </Stack>
  );
}
