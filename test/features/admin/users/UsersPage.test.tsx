import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WdsApiError } from '../../../../src/shared/api/apiError';
import { UsersPage } from '../../../../src/features/admin/users/UsersPage';
import { resetAuthModuleMocks } from '../../../testUtils/auth';

interface MockAdminUsersPage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface MockAdminUsersResponse {
  content: { id: string; fullName?: string }[];
  page: MockAdminUsersPage;
}

interface MockUsersQueryResult {
  data?: { pages: MockAdminUsersResponse[] };
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  error: unknown;
}

interface MockIntersectionObserverEntry {
  isIntersecting: boolean;
}

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  getCurrentUser: vi.fn(),
  authError: null as unknown,
  refetchAuth: vi.fn(),
  queryResult: {
    data: { pages: [] },
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn().mockResolvedValue(undefined),
    error: null,
  } as MockUsersQueryResult,
  lastQueryArgs: undefined as
    | {
        sort?: string;
        filters?: Record<string, string>;
        enabled: boolean;
      }
    | undefined,
  observe: vi.fn(),
  disconnect: vi.fn(),
  intersectionCallback: undefined as
    ((entries: MockIntersectionObserverEntry[]) => void) | undefined,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../../../src/features/auth/queries', () => ({
  useMeQuery: () => ({
    data: mocks.getCurrentUser() as { id: string; roles: string[] } | null | undefined,
    error: mocks.authError,
    refetch: mocks.refetchAuth,
  }),
}));

vi.mock('../../../../src/features/auth/AuthErrorAlert', () => ({
  AuthErrorAlert: ({ error, onRetry }: { error: unknown; onRetry: () => void }) => (
    <div>
      {`auth-error:${error instanceof Error ? error.message : String(error)}`}
      <button type="button" onClick={onRetry}>
        retry-auth
      </button>
    </div>
  ),
}));

vi.mock('../../../../src/shared/api/errors', () => ({
  getErrorMessage: () => 'Users failed',
}));

vi.mock('../../../../src/features/admin/users/queries', () => ({
  useAdminUsersQuery: (args: {
    sort?: string;
    filters?: Record<string, string>;
    enabled: boolean;
  }) => {
    mocks.lastQueryArgs = args;
    return mocks.queryResult;
  },
}));

vi.mock('react-i18next', async () => await import('../../../testUtils/reactI18nextMock'));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  Spinner: () => <div>spinner</div>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../../../src/features/admin/users/UsersSkeleton', () => ({
  UsersSkeleton: () => <div>users-skeleton</div>,
}));

vi.mock('../../../../src/shared/ui/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../../../src/features/admin/users/UsersTable', () => ({
  UsersTable: ({
    users,
    filters,
    onFilterValueChange,
    onFilterApply,
  }: {
    users: { id: string }[];
    filters: { fullName: string };
    onFilterValueChange: (field: 'fullName', value: string) => void;
    onFilterApply: () => void;
  }) => (
    <div>
      <div>{`users:${String(users.length)}`}</div>
      <div>{`draft:${filters.fullName}`}</div>
      <button
        type="button"
        onClick={() => {
          onFilterValueChange('fullName', ' Alice ');
        }}
      >
        change-filter
      </button>
      <button type="button" onClick={onFilterApply}>
        apply-filter
      </button>
    </div>
  ),
}));

describe('UsersPage', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.authError = null;
    mocks.refetchAuth.mockReset();
    resetAuthModuleMocks(mocks, { id: 'admin-1', roles: ['ADMIN'] });
    mocks.queryResult = {
      data: {
        pages: [
          {
            content: [{ id: 'user-1', fullName: 'Alice' }],
            page: { size: 50, number: 0, totalElements: 1, totalPages: 1 },
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn().mockResolvedValue(undefined),
      error: null,
    };
    mocks.lastQueryArgs = undefined;
    mocks.observe.mockReset();
    mocks.disconnect.mockReset();
    mocks.intersectionCallback = undefined;

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: MockIntersectionObserverEntry[]) => void) {
          mocks.intersectionCallback = callback;
        }

        observe(target: Element) {
          mocks.observe(target);
        }

        disconnect() {
          mocks.disconnect();
        }
      },
    );
  });

  it('redirects authenticated non-admin users away from the page', async () => {
    mocks.getCurrentUser.mockReturnValue({ id: 'user-1', roles: ['USER'] });

    render(<UsersPage />);

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('waits for the current-user query before redirecting', () => {
    mocks.getCurrentUser.mockReturnValue(undefined);

    render(<UsersPage />);

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.lastQueryArgs?.enabled).toBe(false);
  });

  it('shows an authentication error with a retry action', () => {
    mocks.getCurrentUser.mockReturnValue(undefined);
    mocks.authError = new Error('auth lookup failed');

    render(<UsersPage />);

    expect(screen.getByText('auth-error:auth lookup failed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'retry-auth' }));
    expect(mocks.refetchAuth).toHaveBeenCalledTimes(1);
  });

  it('redirects away when the admin query returns 403', async () => {
    mocks.queryResult.error = new WdsApiError({
      status: 403,
      code: 'FORBIDDEN',
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('only applies draft filters after the user confirms them', async () => {
    render(<UsersPage />);

    expect(mocks.lastQueryArgs).toEqual({
      sort: undefined,
      filters: {},
      enabled: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'change-filter' }));
    expect(screen.getByText(/draft: Alice/)).toBeTruthy();
    expect(mocks.lastQueryArgs).toEqual({
      sort: undefined,
      filters: {},
      enabled: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'apply-filter' }));

    await waitFor(() => {
      expect(mocks.lastQueryArgs).toEqual({
        sort: undefined,
        filters: { fullName: 'Alice' },
        enabled: true,
      });
    });
  });

  it('fetches the next page when the sentinel intersects and more pages exist', async () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);
    mocks.queryResult = {
      data: {
        pages: [
          {
            content: [{ id: 'user-1', fullName: 'Alice' }],
            page: { size: 50, number: 0, totalElements: 51, totalPages: 2 },
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage,
      error: null,
    };

    render(<UsersPage />);

    expect(mocks.observe).toHaveBeenCalledTimes(1);
    mocks.intersectionCallback?.([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });
  });
});
