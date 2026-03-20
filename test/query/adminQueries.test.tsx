import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminUsersQuery } from '../../src/query/adminQueries';
import { createQueryClientWrapper } from '../testUtils/queryClient';

const mocks = vi.hoisted(() => ({
  getAdminUsers: vi.fn(),
}));

vi.mock('../../src/api/users', () => ({
  getAdminUsers: mocks.getAdminUsers,
}));

describe('useAdminUsersQuery', () => {
  beforeEach(() => {
    mocks.getAdminUsers.mockReset();
  });

  it('forwards sort and filter params to getAdminUsers', async () => {
    mocks.getAdminUsers.mockResolvedValue({
      content: [],
      page: { size: 50, number: 0, totalElements: 0, totalPages: 1 },
    });

    const { result } = renderHook(
      () =>
        useAdminUsersQuery({
          sort: 'email,asc',
          filters: { fullName: 'Alice' },
          enabled: true,
        }),
      { wrapper: createQueryClientWrapper().wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const calls = mocks.getAdminUsers.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toEqual({
      page: 0,
      size: 50,
      sort: 'email,asc',
      fullName: 'Alice',
    });
    expect((calls[0]?.[1] as { signal: AbortSignal }).signal).toBeInstanceOf(AbortSignal);
  });

  it('fetches the next page only while more pages exist', async () => {
    mocks.getAdminUsers
      .mockResolvedValueOnce({
        content: [{ id: '1' }],
        page: { size: 50, number: 0, totalElements: 60, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        content: [{ id: '2' }],
        page: { size: 50, number: 1, totalElements: 60, totalPages: 2 },
      });

    const { result } = renderHook(
      () =>
        useAdminUsersQuery({
          enabled: true,
        }),
      { wrapper: createQueryClientWrapper().wrapper },
    );

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });

    await result.current.fetchNextPage();

    const calls = mocks.getAdminUsers.mock.calls as unknown[][];
    expect(calls[1]?.[0]).toEqual({
      page: 1,
      size: 50,
      sort: undefined,
    });
    expect((calls[1]?.[1] as { signal: AbortSignal }).signal).toBeInstanceOf(AbortSignal);
  });
});
