import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryClientWrapper } from '../../../testUtils/queryClient';
import { useAdminRoomsQuery } from '../../../../src/features/admin/rooms/queries';

const mocks = vi.hoisted(() => ({ getAdminRooms: vi.fn() }));

vi.mock('../../../../src/features/admin/rooms/api', () => ({ getAdminRooms: mocks.getAdminRooms }));

describe('useAdminRoomsQuery', () => {
  beforeEach(() => {
    mocks.getAdminRooms.mockReset();
  });

  it('starts at page zero and forwards all applied filters', async () => {
    mocks.getAdminRooms.mockResolvedValue({
      content: [],
      page: { size: 50, number: 0, totalElements: 0, totalPages: 1 },
    });

    const { result } = renderHook(
      () =>
        useAdminRoomsQuery({
          sort: 'rounds,desc',
          filters: {
            statuses: ['WAITING_FOR_PLAYERS', 'IN_PROGRESS'],
            rounds: 'FIVE',
            roomId: 'abc',
            playerSearch: 'user-1',
            createdAt: '2025-06-01',
            lastUpdatedAt: '2025-06-02',
          },
          enabled: true,
        }),
      { wrapper: createQueryClientWrapper().wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const calls = mocks.getAdminRooms.mock.calls as unknown[][];
    expect(calls[0]?.[0]).toEqual({
      page: 0,
      size: 50,
      sort: 'rounds,desc',
      statuses: ['WAITING_FOR_PLAYERS', 'IN_PROGRESS'],
      rounds: 'FIVE',
      roomId: 'abc',
      playerSearch: 'user-1',
      createdAt: '2025-06-01',
      lastUpdatedAt: '2025-06-02',
    });
    expect((calls[0]?.[1] as { signal: AbortSignal }).signal).toBeInstanceOf(AbortSignal);
  });

  it('stops when the response reports the last page', async () => {
    mocks.getAdminRooms.mockResolvedValue({
      content: [],
      page: { size: 50, number: 0, totalElements: 50, totalPages: 1 },
    });

    const { result } = renderHook(() => useAdminRoomsQuery({ enabled: true }), {
      wrapper: createQueryClientWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });
});
