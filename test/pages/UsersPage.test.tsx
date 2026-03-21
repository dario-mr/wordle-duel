import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WdsApiError } from '../../src/api/types';
import { UsersPage } from '../../src/pages/UsersPage';
import { resetAuthModuleMocks } from '../testUtils/auth';

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
  subscribeCurrentUser: vi.fn<(listener: () => void) => () => void>(),
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
    | ((entries: MockIntersectionObserverEntry[]) => void)
    | undefined,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../src/api/auth', () => ({
  getCurrentUser: mocks.getCurrentUser,
  subscribeCurrentUser: mocks.subscribeCurrentUser,
}));

vi.mock('../../src/auth/useCurrentUser', () => ({
  useCurrentUser: () => mocks.getCurrentUser() as { id: string; roles: string[] } | null,
}));

vi.mock('../../src/api/errors', () => ({
  getErrorMessage: () => 'Users failed',
}));

vi.mock('../../src/query/adminQueries', () => ({
  useAdminUsersQuery: (args: {
    sort?: string;
    filters?: Record<string, string>;
    enabled: boolean;
  }) => {
    mocks.lastQueryArgs = args;
    return mocks.queryResult;
  },
}));

vi.mock('react-i18next', async () => await import('../testUtils/reactI18nextMock'));

vi.mock('@chakra-ui/react', () => ({
  Heading: ({ children }: { children?: ReactNode }) => <h1>{children}</h1>,
  Spinner: () => <div>spinner</div>,
  Stack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));

vi.mock('../../src/components/admin/UsersSkeleton.tsx', () => ({
  UsersSkeleton: () => <div>users-skeleton</div>,
}));

vi.mock('../../src/components/common/ErrorAlert', () => ({
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div>{`${title}:${message}`}</div>
  ),
}));

vi.mock('../../src/components/admin/UsersTable.tsx', () => ({
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

  it('redirects away when the admin query returns 403', async () => {
    mocks.queryResult.error = new WdsApiError({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Forbidden',
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
